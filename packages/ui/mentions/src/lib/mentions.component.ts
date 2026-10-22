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
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { cbFieldState, cbFormat, injectCbTranslation, type CbRequiredIndicator } from '@caribeng/ui';
import { cbCaretCoordinates } from './caret';

/** Persona, etiqueta o elemento que se puede mencionar. */
export interface CbMentionItem {
  readonly id: string;
  /** Texto que se inserta tras el disparador (`@Laura Gómez`). */
  readonly label: string;
  /** Texto secundario en la lista (cargo, correo…). */
  readonly description?: string;
  /** Imagen del avatar en la lista. */
  readonly avatar?: string;
  /** Disparador al que pertenece (`@` por defecto, `#` para etiquetas…). */
  readonly trigger?: string;
}

/** Mención presente en el texto. */
export interface CbMention {
  readonly id: string;
  readonly label: string;
  readonly trigger: string;
}

/** Búsqueda en curso (para pedir sugerencias al servidor). */
export interface CbMentionSearch {
  readonly trigger: string;
  readonly query: string;
}

interface ActiveQuery extends CbMentionSearch {
  /** Posición del disparador en el texto. */
  readonly start: number;
}

let nextUid = 0;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Campo de texto con menciones de CaribeNG: al escribir `@` (u otro
 * disparador como `#`) muestra sugerencias junto al cursor, que se filtran
 * sin tildes y se eligen con el teclado o el ratón. Funciona con Angular Forms
 * (el valor es el texto) y emite las menciones presentes con su `id`.
 *
 * @example
 * ```html
 * <cb-mentions label="Comentario" [suggestions]="equipo" formControlName="comentario" (mentionsChange)="menciones = $event" />
 * ```
 */
@Component({
  selector: 'cb-mentions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-mentions' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CbMentions), multi: true }],
  template: `
    @if (label()) {
      <label class="cb-mentions__label" [attr.for]="inputId">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span [class]="'cb-mentions__required cb-mentions__required--' + mark.kind" [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'">{{ mark.text }}</span>
        }
      </label>
    }
    <textarea
      #field
      class="cb-mentions__field"
      [class.cb-is-invalid]="fieldState.invalid()"
      [id]="inputId"
      [rows]="rows()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [required]="fieldState.required()"
      aria-autocomplete="list"
      [attr.aria-controls]="open() ? listId : null"
      [attr.aria-activedescendant]="open() ? activeId() : null"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-describedby]="hint() ? inputId + '-hint' : null"
      [attr.aria-label]="label() ? null : (ariaLabel() || null)"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
      (click)="detect()"
      (blur)="onBlur()"
    ></textarea>
    @if (hint()) {
      <p class="cb-mentions__hint" [id]="inputId + '-hint'">{{ hint() }}</p>
    }
    <div class="cb-mentions__sr" role="status">{{ announcement() }}</div>

    <ng-template #panel>
      <ul class="cb-mentions__panel" role="listbox" [id]="listId" [attr.aria-label]="label() || ariaLabel() || null">
        @for (item of results(); track item.id; let i = $index) {
          <li
            class="cb-mentions__option"
            role="option"
            [id]="listId + '-' + i"
            [class.cb-mentions__option--active]="i === active()"
            [attr.aria-selected]="i === active()"
            (mousedown)="$event.preventDefault()"
            (mousemove)="active.set(i)"
            (click)="choose(item)"
          >
            <span class="cb-mentions__avatar" aria-hidden="true">
              @if (item.avatar) {
                <img [src]="item.avatar" alt="" />
              } @else {
                {{ initials(item) }}
              }
            </span>
            <span class="cb-mentions__text">
              <span class="cb-mentions__name">{{ item.label }}</span>
              @if (item.description) {
                <span class="cb-mentions__description">{{ item.description }}</span>
              }
            </span>
          </li>
        } @empty {
          <li class="cb-mentions__empty" role="presentation">{{ loading() ? t().loading : t().noResults }}</li>
        }
      </ul>
    </ng-template>
  `,
  styleUrl: './mentions.component.css',
})
export class CbMentions implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly fieldEl = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  protected readonly inputId = `cb-mentions-${++nextUid}`;
  protected readonly listId = `${this.inputId}-list`;

  /** Texto (bidireccional y con Angular Forms). */
  readonly value = model('');
  /** Elementos mencionables. Cada uno puede indicar su `trigger`. */
  readonly suggestions = input<readonly CbMentionItem[]>([]);
  /** Caracteres que abren las sugerencias. */
  readonly triggers = input<readonly string[]>(['@']);
  /** Filtra `suggestions` con lo escrito. Desactívalo si llegan ya filtradas del servidor. */
  readonly filter = input(true, { transform: booleanAttribute });
  /** Máximo de sugerencias visibles. */
  readonly maxResults = input<number>(8);
  /** Muestra "Cargando" mientras no hay sugerencias. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly placeholder = input<string>('');
  /** Nombre accesible sin `label` visible. */
  readonly ariaLabel = input<string>('');
  readonly rows = input<number>(3);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Lo escrito tras el disparador (para pedir sugerencias). */
  readonly search = output<CbMentionSearch>();
  /** Menciones presentes en el texto, cada vez que cambian. */
  readonly mentionsChange = output<CbMention[]>();

  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  private readonly query = signal<ActiveQuery | null>(null);
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  protected readonly announcement = signal('');
  /** Menciones elegidas (se conservan mientras su texto siga en el campo). */
  private chosen: CbMention[] = [];
  private lastMentions = '';

  protected readonly results = computed<CbMentionItem[]>(() => {
    const q = this.query();
    if (!q) return [];
    const items = this.suggestions().filter((s) => (s.trigger ?? '@') === q.trigger);
    if (!this.filter()) return items.slice(0, this.maxResults());
    const needle = normalize(q.query);
    const scored = items
      .map((item) => {
        const label = normalize(item.label);
        const score = !needle ? 1 : label.startsWith(needle) ? 3 : label.split(/\s+/).some((w) => w.startsWith(needle)) ? 2 : label.includes(needle) ? 1 : 0;
        return { item, score };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, this.maxResults()).map((e) => e.item);
  });

  protected readonly activeId = computed(() => (this.results().length ? `${this.listId}-${this.active()}` : null));

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected initials(item: CbMentionItem): string {
    return item.label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }

  // --- ControlValueAccessor ---------------------------------------------------
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    this.syncMentions(false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Escritura ----------------------------------------------------------------
  protected onInput(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.value.set(text);
    this.onChange(text);
    this.syncMentions(true);
    this.detect();
  }

  protected onBlur(): void {
    this.onTouched();
    this.close();
  }

  /** Busca un disparador justo antes del cursor y abre (o cierra) las sugerencias. */
  detect(): void {
    const el = this.fieldEl().nativeElement;
    const caret = el.selectionStart ?? el.value.length;
    if (el.selectionEnd !== caret) return this.close();
    const before = el.value.slice(0, caret);
    let found: ActiveQuery | null = null;
    for (const trigger of this.triggers()) {
      const start = before.lastIndexOf(trigger);
      if (start < 0 || (start > 0 && !/\s|[([{"'¿¡]/.test(before[start - 1]))) continue;
      const query = before.slice(start + trigger.length);
      // Admite nombres con espacios, pero no saltos de línea ni búsquedas larguísimas.
      if (/\n/.test(query) || query.length > 40 || /\s{2}/.test(query)) continue;
      if (!found || start > found.start) found = { trigger, query, start };
    }
    if (!found) return this.close();
    const previous = this.query();
    this.query.set(found);
    if (previous?.query !== found.query || previous.trigger !== found.trigger) {
      this.active.set(0);
      this.search.emit({ trigger: found.trigger, query: found.query });
    }
    // Con un espacio y sin resultados, se entiende que ya no es una mención.
    if (/\s/.test(found.query) && !this.results().length && !this.loading()) return this.close();
    this.openPanel(found.start);
    this.announcement.set(this.results().length ? cbFormat(this.t().mentionsCount, this.results().length) : this.t().noResults);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open()) return;
    const count = this.results().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (!count) return;
        event.preventDefault();
        this.active.set((this.active() + (event.key === 'ArrowDown' ? 1 : -1) + count) % count);
        this.scrollActiveIntoView();
        break;
      case 'Enter':
      case 'Tab': {
        const item = this.results()[this.active()];
        if (!item) return;
        event.preventDefault();
        this.choose(item);
        break;
      }
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
    }
  }

  /** Inserta la mención elegida en lugar de lo escrito tras el disparador. */
  protected choose(item: CbMentionItem): void {
    const q = this.query();
    const el = this.fieldEl().nativeElement;
    if (!q) return;
    const caret = el.selectionStart ?? el.value.length;
    const inserted = `${q.trigger}${item.label} `;
    const text = el.value.slice(0, q.start) + inserted + el.value.slice(caret);
    const position = q.start + inserted.length;
    this.value.set(text);
    el.value = text;
    el.setSelectionRange(position, position);
    this.chosen = [...this.chosen.filter((m) => !(m.id === item.id && m.trigger === q.trigger)), { id: item.id, label: item.label, trigger: q.trigger }];
    this.onChange(text);
    this.close();
    this.syncMentions(true);
    el.focus();
  }

  /** Quita las menciones cuyo texto ya no está y avisa si cambió la lista. */
  private syncMentions(emit: boolean): void {
    const text = this.value();
    this.chosen = this.chosen.filter((m) => text.includes(`${m.trigger}${m.label}`));
    const signature = JSON.stringify(this.chosen.map((m) => `${m.trigger}${m.id}`));
    if (signature === this.lastMentions) return;
    this.lastMentions = signature;
    if (emit) this.mentionsChange.emit([...this.chosen]);
  }

  // --- Panel ---------------------------------------------------------------------
  private openPanel(start: number): void {
    const el = this.fieldEl().nativeElement;
    const rect = el.getBoundingClientRect();
    const caret = cbCaretCoordinates(el, start);
    const origin = { x: rect.left + caret.left, y: rect.top + caret.top + caret.height };
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(this.position(origin));
      return;
    }
    this.overlayRef = this.overlay.create({
      positionStrategy: this.position(origin),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.open.set(true);
  }

  private position(origin: { x: number; y: number }) {
    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions([
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -24 },
      ])
      .withPush(true);
  }

  /** Cierra las sugerencias. */
  close(): void {
    this.query.set(null);
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.open.set(false);
    this.announcement.set('');
  }

  private scrollActiveIntoView(): void {
    const id = this.activeId();
    afterNextRender(() => (id ? this.overlayRef?.overlayElement.querySelector(`#${id}`)?.scrollIntoView?.({ block: 'nearest' }) : null), {
      injector: this.injector,
    });
  }
}
