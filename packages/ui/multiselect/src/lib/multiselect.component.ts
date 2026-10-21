import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/** Opción con su posición en la lista filtrada (la que usan teclado y `aria-activedescendant`). */
interface IndexedOption {
  opt: unknown;
  index: number;
}

/** Grupo de opciones ya filtrado; `label` es `null` cuando no se agrupa. */
interface OptionGroup {
  label: string | null;
  options: IndexedOption[];
}

/** Fila del modo virtual: cabecera de grupo u opción, todas de la misma altura. */
type VirtualRow = { kind: 'group'; label: string; key: string } | ({ kind: 'option' } & IndexedOption);

/** Filas extra que se pintan por encima y por debajo de las visibles en modo virtual. */
const VIRTUAL_BUFFER = 4;

/**
 * Selección múltiple (multiselect) de CaribeNG. Listbox accesible sobre CDK
 * Overlay con casillas, filtro, seleccionar-todo, grupos, búsqueda al teclear
 * y scroll virtual. Integrado con Angular Forms vía `ControlValueAccessor`;
 * el modelo es un array de valores.
 *
 * @example
 * ```html
 * <cb-multiselect [options]="ciudades" optionLabel="nombre" optionValue="id"
 *                 formControlName="ciudades" placeholder="Elige ciudades" />
 *
 * <!-- Agrupado: [{ label: 'Colombia', items: [...] }, …] -->
 * <cb-multiselect [options]="paises" group filter />
 * ```
 */
@Component({
  selector: 'cb-multiselect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, NgTemplateOutlet, CbIcon],
  host: { class: 'cb-multiselect-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbMultiSelect),
      multi: true,
    },
  ],
  template: `
    <div
      #trigger
      class="cb-multiselect__trigger"
      [class]="'cb-multiselect__trigger--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      role="combobox"
      [id]="inputId()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledBy() || null"
      [attr.tabindex]="isDisabled() ? -1 : 0"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listboxId"
      [attr.aria-activedescendant]="filter() ? null : activeDescendant()"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-required]="fieldState.required() || null"
      (click)="toggleOpen()"
      (keydown)="onTriggerKeydown($event)"
      (blur)="onBlur()"
    >
      <span class="cb-multiselect__label" [class.cb-multiselect__label--placeholder]="!selected().length">
        {{ displayLabel() }}
      </span>
      <cb-icon class="cb-multiselect__chevron" name="chevron-down" [size]="16" aria-hidden="true" />
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="false"
      (overlayOutsideClick)="close()"
      (overlayKeydown)="onOverlayKeydown($event)"
      (detach)="close()"
    >
      <div class="cb-multiselect__panel">
        @if (filter() || showToggleAll()) {
          <div class="cb-multiselect__header">
            @if (showToggleAll()) {
              <button type="button" class="cb-multiselect__all" [attr.aria-pressed]="allSelected()" (click)="toggleAll()">
                <span class="cb-multiselect__check" [class.cb-is-checked]="allSelected()" aria-hidden="true">
                  @if (allSelected()) {
                    <cb-icon name="check" [size]="14" />
                  }
                </span>
                {{ t().selectAll }}
              </button>
            }
            @if (filter()) {
              <!-- Con filtro, el foco vive aquí: es el combobox que anuncia la opción activa. -->
              <input
                #filterInput
                type="text"
                class="cb-multiselect__filter-input"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                [attr.aria-controls]="listboxId"
                [attr.aria-activedescendant]="activeDescendant()"
                [placeholder]="(filterPlaceholder() ?? t().search)"
                [value]="filterText()"
                (input)="onFilter($event)"
                (keydown)="onTriggerKeydown($event)"
                [attr.aria-label]="t().filterOptions"
              />
            }
          </div>
        }
        @if (virtualScroll()) {
          <ul
            #viewport
            class="cb-multiselect__list cb-multiselect__list--virtual"
            role="listbox"
            aria-multiselectable="true"
            [id]="listboxId"
            [style.height.px]="viewportHeight()"
            (scroll)="scrollTop.set($any($event.target).scrollTop)"
          >
            <li role="presentation" class="cb-multiselect__spacer" [style.height.px]="virtualRows().length * virtualScrollItemSize()">
              <ul role="presentation" class="cb-multiselect__window" [style.transform]="'translateY(' + windowOffset() + 'px)'">
                @for (row of visibleRows(); track row.kind === 'group' ? row.key : row.index) {
                  @if (row.kind === 'group') {
                    <li role="presentation" class="cb-multiselect__group-label" [style.height.px]="virtualScrollItemSize()">
                      {{ row.label }}
                    </li>
                  } @else {
                    <ng-container
                      *ngTemplateOutlet="optionTpl; context: { $implicit: row, height: virtualScrollItemSize(), virtual: true }"
                    />
                  }
                }
              </ul>
            </li>
            @if (!filteredOptions().length) {
              <li class="cb-multiselect__empty" role="option" aria-disabled="true">{{ (emptyMessage() ?? t().noResults) }}</li>
            }
          </ul>
        } @else {
          <ul
            #viewport
            class="cb-multiselect__list"
            role="listbox"
            aria-multiselectable="true"
            [id]="listboxId"
            [style.max-height]="scrollHeight()"
          >
            @for (g of filteredGroups(); track $index; let gi = $index) {
              @if (g.label !== null) {
                <li role="presentation">
                  <ul role="group" class="cb-multiselect__group" [attr.aria-labelledby]="groupId(gi)">
                    <li role="presentation" class="cb-multiselect__group-label" [id]="groupId(gi)">{{ g.label }}</li>
                    @for (item of g.options; track item.index) {
                      <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: item, height: null, virtual: false }" />
                    }
                  </ul>
                </li>
              } @else {
                @for (item of g.options; track item.index) {
                  <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: item, height: null, virtual: false }" />
                }
              }
            }
            @if (!filteredOptions().length) {
              <li class="cb-multiselect__empty" role="option" aria-disabled="true">{{ (emptyMessage() ?? t().noResults) }}</li>
            }
          </ul>
        }
      </div>
    </ng-template>

    <ng-template #optionTpl let-item let-height="height" let-virtual="virtual">
      <li
        class="cb-multiselect__option"
        [class.cb-is-active]="item.index === activeIndex()"
        [class.cb-is-selected]="isSelected(item.opt)"
        [class.cb-is-disabled]="isOptionDisabled(item.opt)"
        role="option"
        [id]="optionId(item.index)"
        [style.height.px]="height"
        [attr.aria-selected]="isSelected(item.opt)"
        [attr.aria-disabled]="isOptionDisabled(item.opt) ? 'true' : null"
        [attr.aria-setsize]="virtual ? filteredOptions().length : null"
        [attr.aria-posinset]="virtual ? item.index + 1 : null"
        (click)="toggleOption(item.opt)"
        (mouseenter)="activeIndex.set(item.index)"
      >
        <span class="cb-multiselect__check" [class.cb-is-checked]="isSelected(item.opt)" aria-hidden="true">
          @if (isSelected(item.opt)) {
            <cb-icon name="check" [size]="14" />
          }
        </span>
        {{ labelOf(item.opt) }}
      </li>
    </ng-template>
  `,
  styleUrl: './multiselect.component.css',
})
export class CbMultiSelect implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  private readonly injector = inject(Injector);
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string | null>(null);
  readonly optionDisabled = input<string>('disabled');
  /** Las opciones son grupos (`{ label, items }`): se muestran con su título. */
  readonly group = input<boolean, unknown>(false, { transform: toBoolean });
  /** Propiedad con el título de cada grupo. */
  readonly optionGroupLabel = input<string>('label');
  /** Propiedad con las opciones de cada grupo. */
  readonly optionGroupChildren = input<string>('items');
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<CbSize>('md');
  readonly filter = input<boolean, unknown>(false, { transform: toBoolean });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly showToggleAll = input<boolean, unknown>(true, { transform: toBoolean });
  /** Nº máx. de etiquetas antes de mostrar "N seleccionados". */
  readonly maxSelectedLabels = input<number>(3);
  /** Alto máximo de la lista (CSS). En modo virtual es su alto fijo. */
  readonly scrollHeight = input<string>('15rem');
  /** Pinta solo las opciones visibles: para listas de miles de elementos. */
  readonly virtualScroll = input<boolean, unknown>(false, { transform: toBoolean });
  /** Alto fijo de cada fila en modo virtual (px). */
  readonly virtualScrollItemSize = input<number>(36);
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly inputId = input<string>(`cb-multiselect-${++nextUid}`);
  /** Nombre accesible del disparador cuando no hay etiqueta visible. */
  readonly ariaLabel = input<string>('');
  /** Id del elemento que etiqueta al disparador (p. ej. un `<label>` o título visible). */
  readonly ariaLabelledBy = input<string>('');

  readonly value = model<unknown[]>([]);

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');
  protected readonly triggerWidth = signal(0);
  protected readonly scrollTop = signal(0);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly listboxId = `${this.inputId()}-listbox`;

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly filterInputRef = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly viewportRef = viewChild<ElementRef<HTMLElement>>('viewport');

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  // --- Búsqueda al teclear ------------------------------------------------------
  private typeahead = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  /** Todas las opciones (aplanando los grupos). */
  protected readonly flatOptions = computed(() =>
    this.group() ? this.options().flatMap((g) => this.childrenOf(g)) : this.options(),
  );

  protected readonly filteredGroups = computed<OptionGroup[]>(() => {
    const q = normalize(this.filterText());
    const keep = (o: unknown) => !this.filter() || !q || normalize(this.labelOf(o)).includes(q);
    let index = 0;
    const indexed = (opts: readonly unknown[]) => opts.filter(keep).map((opt) => ({ opt, index: index++ }));
    if (!this.group()) return [{ label: null, options: indexed(this.options()) }];
    return this.options()
      .map((g) => ({ label: this.groupLabelOf(g), options: indexed(this.childrenOf(g)) }))
      .filter((g) => g.options.length > 0);
  });

  protected readonly filteredOptions = computed(() =>
    this.filteredGroups().flatMap((g) => g.options.map((o) => o.opt)),
  );

  /** Filas del modo virtual (cabeceras de grupo + opciones). */
  protected readonly virtualRows = computed<VirtualRow[]>(() =>
    this.filteredGroups().flatMap((g, gi) => [
      ...(g.label !== null ? [{ kind: 'group' as const, label: g.label, key: `g${gi}` }] : []),
      ...g.options.map((o) => ({ kind: 'option' as const, ...o })),
    ]),
  );
  protected readonly viewportHeight = computed(() => cssToPx(this.scrollHeight()));
  private readonly windowStart = computed(() =>
    Math.max(0, Math.floor(this.scrollTop() / this.virtualScrollItemSize()) - VIRTUAL_BUFFER),
  );
  protected readonly windowOffset = computed(() => this.windowStart() * this.virtualScrollItemSize());
  protected readonly visibleRows = computed(() => {
    const size = this.virtualScrollItemSize();
    const end = Math.ceil((this.scrollTop() + this.viewportHeight()) / size) + VIRTUAL_BUFFER;
    return this.virtualRows().slice(this.windowStart(), end);
  });

  protected readonly selected = computed(() =>
    this.flatOptions().filter((o) => this.value().includes(this.valueOf(o))),
  );

  protected readonly displayLabel = computed(() => {
    const sel = this.selected();
    if (!sel.length) return (this.placeholder() ?? this.t().select);
    if (sel.length > this.maxSelectedLabels()) return cbFormat(this.t().selectedCount, sel.length);
    return sel.map((o) => this.labelOf(o)).join(', ');
  });

  protected readonly allSelected = computed(() => {
    const enabled = this.flatOptions().filter((o) => !this.isOptionDisabled(o));
    return enabled.length > 0 && enabled.every((o) => this.value().includes(this.valueOf(o)));
  });

  protected readonly activeDescendant = computed(() =>
    this.open() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  constructor() {
    effect(() => {
      if (this.open() && this.filter()) {
        queueMicrotask(() => this.filterInputRef()?.nativeElement.focus());
      }
    });
    // Mantiene el índice activo dentro de la lista filtrada.
    effect(() => {
      const length = this.filteredOptions().length;
      if (this.open() && this.activeIndex() >= length) this.setActive(this.firstEnabledIndex());
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typeaheadTimer));
  }

  private onChange: (value: unknown[]) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: unknown[] | null): void {
    this.value.set(Array.isArray(value) ? [...value] : []);
  }
  registerOnChange(fn: (value: unknown[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected toggleOpen(): void {
    if (this.isDisabled()) return;
    this.open() ? this.close() : this.openPanel();
  }

  protected openPanel(): void {
    if (this.isDisabled()) return;
    this.triggerWidth.set(this.triggerRef().nativeElement.offsetWidth);
    this.scrollTop.set(0);
    this.open.set(true);
    this.setActive(this.firstEnabledIndex());
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.filterText.set('');
    this.onTouched();
    queueMicrotask(() => this.triggerRef().nativeElement.focus());
  }

  protected toggleOption(opt: unknown): void {
    if (this.isOptionDisabled(opt)) return;
    const v = this.valueOf(opt);
    const current = this.value();
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    this.commit(next);
  }

  protected toggleAll(): void {
    const enabled = this.flatOptions().filter((o) => !this.isOptionDisabled(o));
    this.commit(this.allSelected() ? [] : enabled.map((o) => this.valueOf(o)));
  }

  protected onBlur(): void {
    if (!this.open()) this.onTouched();
  }

  protected onFilter(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    const key = event.key;
    // En el filtro, Espacio, Inicio y Fin escriben o mueven el cursor del texto.
    const inFilter = event.target === this.filterInputRef()?.nativeElement;
    if (!inFilter && isPrintable(event)) {
      event.preventDefault();
      if (!this.open()) {
        this.openPanel();
        this.activeIndex.set(-1);
      }
      if (this.filter()) this.filterText.set(this.filterText() + key);
      else this.searchByTyping(key);
      return;
    }
    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Home':
        if (inFilter) break;
        event.preventDefault();
        this.setActive(this.firstEnabledIndex());
        break;
      case 'End':
        if (inFilter) break;
        event.preventDefault();
        this.setActive(this.lastEnabledIndex());
        break;
      case ' ':
        if (inFilter) break;
        this.toggleActive(event);
        break;
      case 'Enter':
        this.toggleActive(event);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // --- Helpers ---------------------------------------------------------------
  protected labelOf(opt: unknown): string {
    const key = this.optionLabel();
    if (opt != null && typeof opt === 'object' && key in (opt as object)) {
      return String((opt as Record<string, unknown>)[key]);
    }
    return String(opt);
  }
  protected valueOf(opt: unknown): unknown {
    const key = this.optionValue();
    if (key && opt != null && typeof opt === 'object') {
      return (opt as Record<string, unknown>)[key];
    }
    return opt;
  }
  protected isOptionDisabled(opt: unknown): boolean {
    const key = this.optionDisabled();
    return !!(opt != null && typeof opt === 'object' && (opt as Record<string, unknown>)[key]);
  }
  protected isSelected(opt: unknown): boolean {
    return this.value().includes(this.valueOf(opt));
  }
  protected optionId(index: number): string {
    return `${this.inputId()}-opt-${index}`;
  }
  protected groupId(index: number): string {
    return `${this.inputId()}-group-${index}`;
  }

  private groupLabelOf(group: unknown): string {
    return String((group as Record<string, unknown> | null)?.[this.optionGroupLabel()] ?? '');
  }
  private childrenOf(group: unknown): readonly unknown[] {
    const items = (group as Record<string, unknown> | null)?.[this.optionGroupChildren()];
    return Array.isArray(items) ? items : [];
  }

  private toggleActive(event: KeyboardEvent): void {
    const opt = this.filteredOptions()[this.activeIndex()];
    if (opt === undefined) return;
    event.preventDefault();
    this.toggleOption(opt);
  }

  /** Cambia la opción activa y la desplaza a la vista. */
  private setActive(index: number): void {
    this.activeIndex.set(index);
    if (index < 0 || !this.open()) return;
    if (this.virtualScroll()) {
      const size = this.virtualScrollItemSize();
      const row = this.virtualRows().findIndex((r) => r.kind === 'option' && r.index === index);
      const top = row * size;
      const view = this.viewportHeight();
      const current = this.scrollTop();
      const next = top < current ? top : top + size > current + view ? top + size - view : current;
      if (next !== current) {
        this.scrollTop.set(next);
        const viewport = this.viewportRef()?.nativeElement;
        if (viewport) viewport.scrollTop = next;
      }
    } else {
      afterNextRender(
        () => this.viewportRef()?.nativeElement.querySelector(`#${this.optionId(index)}`)?.scrollIntoView?.({ block: 'nearest' }),
        { injector: this.injector },
      );
    }
  }

  private firstEnabledIndex(): number {
    return this.filteredOptions().findIndex((o) => !this.isOptionDisabled(o));
  }
  private lastEnabledIndex(): number {
    const opts = this.filteredOptions();
    for (let i = opts.length - 1; i >= 0; i--) {
      if (!this.isOptionDisabled(opts[i])) return i;
    }
    return -1;
  }
  private move(delta: number): void {
    const opts = this.filteredOptions();
    if (!opts.length) return;
    let i = this.activeIndex();
    for (let s = 0; s < opts.length; s++) {
      i = (i + delta + opts.length) % opts.length;
      if (!this.isOptionDisabled(opts[i])) {
        this.setActive(i);
        return;
      }
    }
  }
  /** Teclear salta a la siguiente opción que empieza por lo escrito (se reinicia tras 500 ms). */
  private searchByTyping(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += normalize(char);
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 500);
    const opts = this.filteredOptions();
    // Repetir la misma letra recorre las opciones que empiezan por ella ("m", "m"…).
    const query = [...this.typeahead].every((c) => c === this.typeahead[0]) ? this.typeahead[0] : this.typeahead;
    // Con una sola letra se avanza a la siguiente coincidencia; con más, se refina desde la actual.
    const from = query.length === 1 ? this.activeIndex() + 1 : Math.max(0, this.activeIndex());
    for (let step = 0; step < opts.length; step++) {
      const i = (from + step) % opts.length;
      if (!this.isOptionDisabled(opts[i]) && normalize(this.labelOf(opts[i])).startsWith(query)) {
        this.setActive(i);
        return;
      }
    }
  }
  private commit(next: unknown[]): void {
    this.value.set(next);
    this.onChange(next);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

/** Minúsculas y sin tildes, para que "medellin" encuentre "Medellín". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase().trim();
}

/** Tecla imprimible sin modificadores (para la búsqueda al teclear). */
function isPrintable(event: KeyboardEvent): boolean {
  return event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;
}

/** Convierte un alto CSS (`px` o `rem`) a píxeles para el modo virtual. */
function cssToPx(value: string): number {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 256;
  return value.trim().endsWith('rem') ? n * 16 : n;
}
