import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { CbKbd } from '@caribeng/ui/kbd';
import { type CbCommandItem, type CbCommandSelectEvent, cbCommandFilter, cbCommandHighlight } from './command-filter';

let nextUid = 0;

/** Combinación de teclas en texto (`mod+k`, `ctrl+shift+p`, `/`). `mod` acepta ⌘ y Ctrl. */
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+').map((p) => p.trim()).filter(Boolean);
  const key = parts.pop();
  if (!key || event.key.toLowerCase() !== key) return false;
  const wants = new Set(parts);
  if (wants.has('mod')) {
    if (!event.metaKey && !event.ctrlKey) return false;
  } else if (event.ctrlKey !== wants.has('ctrl') || event.metaKey !== wants.has('meta')) {
    return false;
  }
  return event.shiftKey === wants.has('shift') && event.altKey === wants.has('alt');
}

/** Si el foco está en un campo de texto (para no robar atajos sin modificador como `/`). */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));
}

/**
 * Paleta de comandos de CaribeNG (Ctrl/⌘ + K): buscador global de páginas y
 * acciones con teclado. Filtra sin tildes ni mayúsculas, agrupa, resalta la
 * coincidencia y muestra atajos con `cb-kbd`.
 *
 * Accesibilidad: diálogo modal con un combobox (`aria-activedescendant`) que
 * controla una lista de opciones; el foco no sale del campo y vuelve al
 * elemento anterior al cerrar.
 *
 * @example
 * ```html
 * <cb-command-palette [items]="comandos" (itemSelect)="ir($event.item)" />
 * ```
 */
@Component({
  selector: 'cb-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbKbd],
  host: {
    class: 'cb-command-palette',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <ng-template #tpl>
      <div class="cb-command" role="dialog" aria-modal="true" [attr.aria-label]="label()">
        <div class="cb-command__search">
          <cb-icon name="search" [size]="18" class="cb-command__search-icon" aria-hidden="true" />
          <input
            #input
            class="cb-command__input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            autocomplete="off"
            spellcheck="false"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="activeOptionId()"
            [attr.aria-label]="label()"
            [placeholder]="placeholder() ?? t().commandPlaceholder"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
          />
        </div>

        <div class="cb-command__list" role="listbox" [id]="listId" [attr.aria-label]="label()">
          @for (group of groups(); track group.label; let g = $index) {
            <div role="group" [attr.aria-labelledby]="group.label ? listId + '-g' + g : null">
              @if (group.label) {
                <div class="cb-command__group" [id]="listId + '-g' + g" aria-hidden="true">{{ group.label }}</div>
              }
              @for (item of group.items; track item.id ?? item.label) {
                <div
                  class="cb-command__option"
                  role="option"
                  [id]="optionId(item)"
                  [class.cb-command__option--active]="item === activeItem()"
                  [attr.aria-selected]="item === activeItem()"
                  [attr.aria-disabled]="item.disabled ? 'true' : null"
                  (mousemove)="hover(item)"
                  (mousedown)="$event.preventDefault()"
                  (click)="select(item, $event)"
                >
                  @if (item.icon) {
                    <cb-icon class="cb-command__icon" [name]="item.icon" [size]="18" aria-hidden="true" />
                  }
                  <span class="cb-command__text">
                    <!-- En una línea: los saltos de línea añadirían espacios dentro de la palabra resaltada. -->
                    <span class="cb-command__label">@for (part of highlight(item); track $index) {@if (part.match) {<mark class="cb-command__match">{{ part.text }}</mark>} @else {<span>{{ part.text }}</span>}}</span>
                    @if (item.description) {
                      <span class="cb-command__description">{{ item.description }}</span>
                    }
                  </span>
                  @if (item.shortcut?.length) {
                    <cb-kbd class="cb-command__shortcut" [keys]="item.shortcut!" size="sm" aria-hidden="true" />
                  }
                </div>
              }
            </div>
          }
          @if (!flat().length) {
            <div class="cb-command__empty">{{ loading() ? t().loading : (emptyMessage() ?? t().noResults) }}</div>
          }
        </div>

        <div class="cb-command__footer" aria-hidden="true">
          <span><cb-kbd [keys]="['up', 'down']" size="sm" /> {{ t().commandNavigate }}</span>
          <span><cb-kbd [keys]="['enter']" size="sm" /> {{ t().commandSelect }}</span>
          <span><cb-kbd size="sm">Esc</cb-kbd> {{ t().close }}</span>
        </div>
        <div class="cb-command__status" role="status">{{ announcement() }}</div>
      </div>
    </ng-template>
  `,
  styleUrl: './command-palette.component.css',
})
export class CbCommandPalette {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');
  private overlayRef: OverlayRef | null = null;
  private previouslyFocused: HTMLElement | null = null;

  protected readonly listId = `cb-command-${++nextUid}`;

  /** Páginas y acciones. */
  readonly items = input<readonly CbCommandItem[]>([]);
  /** Abierta o cerrada. */
  readonly visible = model(false);
  /** Texto buscado (bidireccional, para búsquedas en servidor). */
  readonly query = model('');
  /** Atajo global que abre o cierra la paleta. `''` lo desactiva. */
  readonly shortcut = input<string>('mod+k');
  readonly placeholder = input<string | undefined>(undefined);
  /** Mensaje sin resultados. Por defecto, "Sin resultados". */
  readonly emptyMessage = input<string | undefined>(undefined);
  /** Nombre del diálogo. Por defecto, "Paleta de comandos". */
  readonly ariaLabel = input<string | undefined>(undefined);
  /** Filtra `items` con la búsqueda. Desactívalo si los resultados llegan ya filtrados (servidor). */
  readonly filter = input(true, { transform: booleanAttribute });
  /** Muestra "Cargando" mientras no hay resultados. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Cierra la paleta al elegir un item. */
  readonly closeOnSelect = input(true, { transform: booleanAttribute });

  /** Item elegido (con clic o Enter). */
  readonly itemSelect = output<CbCommandSelectEvent>();

  protected readonly label = computed(() => this.ariaLabel() ?? this.t().commandPalette);
  protected readonly groups = computed(() => cbCommandFilter(this.items(), this.query(), this.filter()));
  /** Resultados en el orden en que se muestran (para el teclado). */
  protected readonly flat = computed(() => this.groups().flatMap((g) => g.items));
  private readonly enabled = computed(() => this.flat().filter((item) => !item.disabled));
  protected readonly activeItem = signal<CbCommandItem | null>(null);
  protected readonly activeOptionId = computed(() => {
    const item = this.activeItem();
    return item ? this.optionId(item) : null;
  });
  protected readonly announcement = computed(() =>
    this.query().trim() && !this.loading() ? cbFormat(this.t().commandResults, String(this.flat().length)) : '',
  );

  constructor() {
    effect(() => {
      const open = this.visible();
      untracked(() => {
        if (open && !this.overlayRef) this.attach();
        else if (!open && this.overlayRef) this.detach();
      });
    });
    // Al cambiar los resultados, el activo pasa al primero disponible.
    effect(() => {
      const enabled = this.enabled();
      untracked(() => {
        const current = this.activeItem();
        if (!current || !enabled.includes(current)) this.activeItem.set(enabled[0] ?? null);
      });
    });
  }

  open(): void {
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }

  toggle(): void {
    this.visible.update((v) => !v);
  }

  protected optionId(item: CbCommandItem): string {
    return `${this.listId}-o${this.flat().indexOf(item)}`;
  }

  protected highlight(item: CbCommandItem) {
    return this.filter() ? cbCommandHighlight(item.label, this.query()) : [{ text: item.label, match: false }];
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    const shortcut = this.shortcut();
    if (!shortcut || !matchesShortcut(event, shortcut)) return;
    // Un atajo sin modificador (p. ej. "/") no se roba mientras se escribe en otro campo.
    const hasModifier = /(^|\+)(mod|ctrl|meta|alt)\+/i.test(shortcut);
    if (!hasModifier && !this.visible() && isTyping(event.target)) return;
    event.preventDefault();
    this.toggle();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected hover(item: CbCommandItem): void {
    if (!item.disabled && this.activeItem() !== item) this.activeItem.set(item);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.enabled();
    const index = enabled.indexOf(this.activeItem()!);
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!enabled.length) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        this.setActive(enabled[(index + step + enabled.length) % enabled.length]);
        break;
      }
      case 'Home':
      case 'End':
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        this.setActive(event.key === 'Home' ? enabled[0] : enabled[enabled.length - 1]);
        break;
      case 'Enter': {
        event.preventDefault();
        const item = this.activeItem();
        if (item) this.select(item, event);
        break;
      }
      case 'Tab':
        // El foco se queda en el campo: la lista se recorre con las flechas.
        event.preventDefault();
        break;
    }
  }

  /** Elige un item: ejecuta su `command`, emite `itemSelect` y cierra (según `closeOnSelect`). */
  select(item: CbCommandItem, originalEvent?: Event): void {
    if (item.disabled) return;
    const event: CbCommandSelectEvent = { item, query: this.query(), originalEvent };
    if (this.closeOnSelect()) this.close();
    item.command?.(event);
    this.itemSelect.emit(event);
  }

  private setActive(item: CbCommandItem | undefined): void {
    if (!item) return;
    this.activeItem.set(item);
    afterNextRender(
      () => {
        this.document.getElementById(this.optionId(item))?.scrollIntoView?.({ block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  private attach(): void {
    this.previouslyFocused = this.document.activeElement as HTMLElement | null;
    this.query.set('');
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cb-dialog-backdrop',
      panelClass: 'cb-command-pane',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().top('12vh'),
    });
    this.overlayRef.attach(new TemplatePortal(this.tpl(), this.vcr));
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    });
    this.activeItem.set(this.enabled()[0] ?? null);
    afterNextRender(() => this.inputEl()?.nativeElement.focus(), { injector: this.injector });
  }

  private detach(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    if (target?.isConnected) target.focus();
  }
}
