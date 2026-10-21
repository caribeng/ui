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
import { cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

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
 * Select (dropdown) de CaribeNG. Listbox accesible sobre CDK Overlay con
 * navegación por teclado, búsqueda al teclear, filtro opcional, grupos,
 * scroll virtual para listas grandes e integración con Angular Forms
 * mediante `ControlValueAccessor`.
 *
 * @example
 * ```html
 * <cb-select [options]="ciudades" optionLabel="nombre" optionValue="id"
 *            formControlName="ciudad" placeholder="Elige una ciudad" showClear />
 *
 * <!-- Agrupado: [{ label: 'Colombia', items: [...] }, …] -->
 * <cb-select [options]="paises" group optionLabel="nombre" />
 *
 * <!-- 10 000 opciones -->
 * <cb-select [options]="clientes" virtualScroll [virtualScrollItemSize]="36" filter />
 * ```
 */
@Component({
  selector: 'cb-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, NgTemplateOutlet, CbIcon],
  host: { class: 'cb-select-host', '[class.cb-has-clear]': 'canClear()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbSelect),
      multi: true,
    },
  ],
  template: `
    <div
      #trigger
      class="cb-select__trigger"
      [class]="'cb-select__trigger--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      role="combobox"
      [id]="inputId()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledBy() || null"
      [attr.tabindex]="isDisabled() ? -1 : 0"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listboxId"
      [attr.aria-activedescendant]="filter() ? null : activeDescendant()"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-required]="fieldState.required() || null"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
      (blur)="onBlur()"
    >
      <span class="cb-select__label" [class.cb-select__label--placeholder]="!selectedOption()">
        {{ displayLabel() }}
      </span>
      <cb-icon class="cb-select__chevron" name="chevron-down" [size]="16" aria-hidden="true" />
    </div>
    @if (canClear()) {
      <button type="button" class="cb-select__clear" [attr.aria-label]="t().clear" (click)="clear()">
        <cb-icon name="x" [size]="14" aria-hidden="true" />
      </button>
    }

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
      <div class="cb-select__panel" [attr.data-theme]="null">
        @if (filter()) {
          <div class="cb-select__filter">
            <!-- Con filtro, el foco vive aquí: es el combobox que anuncia la opción activa. -->
            <input
              #filterInput
              type="text"
              class="cb-select__filter-input"
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
          </div>
        }
        @if (virtualScroll()) {
          <ul
            #viewport
            class="cb-select__list cb-select__list--virtual"
            role="listbox"
            [id]="listboxId"
            [style.height.px]="viewportHeight()"
            (scroll)="scrollTop.set($any($event.target).scrollTop)"
          >
            <li role="presentation" class="cb-select__spacer" [style.height.px]="virtualRows().length * virtualScrollItemSize()">
              <ul role="presentation" class="cb-select__window" [style.transform]="'translateY(' + windowOffset() + 'px)'">
                @for (row of visibleRows(); track row.kind === 'group' ? row.key : row.index) {
                  @if (row.kind === 'group') {
                    <li role="presentation" class="cb-select__group-label" [style.height.px]="virtualScrollItemSize()">
                      {{ row.label }}
                    </li>
                  } @else {
                    <li
                      class="cb-select__option"
                      [class.cb-is-active]="row.index === activeIndex()"
                      [class.cb-is-selected]="isSelected(row.opt)"
                      [class.cb-is-disabled]="isOptionDisabled(row.opt)"
                      role="option"
                      [id]="optionId(row.index)"
                      [style.height.px]="virtualScrollItemSize()"
                      [attr.aria-selected]="isSelected(row.opt)"
                      [attr.aria-disabled]="isOptionDisabled(row.opt) ? 'true' : null"
                      [attr.aria-setsize]="filteredOptions().length"
                      [attr.aria-posinset]="row.index + 1"
                      (click)="selectOption(row.opt)"
                      (mouseenter)="activeIndex.set(row.index)"
                    >
                      {{ labelOf(row.opt) }}
                    </li>
                  }
                }
              </ul>
            </li>
            @if (!filteredOptions().length) {
              <li class="cb-select__empty" role="option" aria-disabled="true">{{ (emptyMessage() ?? t().noResults) }}</li>
            }
          </ul>
        } @else {
          <ul #viewport class="cb-select__list" role="listbox" [id]="listboxId" [style.max-height]="scrollHeight()">
            @for (g of filteredGroups(); track $index; let gi = $index) {
              @if (g.label !== null) {
                <li role="presentation">
                  <ul role="group" class="cb-select__group" [attr.aria-labelledby]="groupId(gi)">
                    <li role="presentation" class="cb-select__group-label" [id]="groupId(gi)">{{ g.label }}</li>
                    @for (item of g.options; track item.index) {
                      <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: item }" />
                    }
                  </ul>
                </li>
              } @else {
                @for (item of g.options; track item.index) {
                  <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: item }" />
                }
              }
            }
            @if (!filteredOptions().length) {
              <li class="cb-select__empty" role="option" aria-disabled="true">{{ (emptyMessage() ?? t().noResults) }}</li>
            }
          </ul>
        }
      </div>
    </ng-template>

    <ng-template #optionTpl let-item>
      <li
        class="cb-select__option"
        [class.cb-is-active]="item.index === activeIndex()"
        [class.cb-is-selected]="isSelected(item.opt)"
        [class.cb-is-disabled]="isOptionDisabled(item.opt)"
        role="option"
        [id]="optionId(item.index)"
        [attr.aria-selected]="isSelected(item.opt)"
        [attr.aria-disabled]="isOptionDisabled(item.opt) ? 'true' : null"
        (click)="selectOption(item.opt)"
        (mouseenter)="activeIndex.set(item.index)"
      >
        {{ labelOf(item.opt) }}
      </li>
    </ng-template>
  `,
  styleUrl: './select.component.css',
})
export class CbSelect implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly injector = inject(Injector);
  // --- Inputs ----------------------------------------------------------------
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
  /** Muestra un botón para vaciar la selección. */
  readonly showClear = input<boolean, unknown>(false, { transform: toBoolean });
  /** Alto máximo de la lista (CSS). En modo virtual es su alto fijo. */
  readonly scrollHeight = input<string>('16rem');
  /** Pinta solo las opciones visibles: para listas de miles de elementos. */
  readonly virtualScroll = input<boolean, unknown>(false, { transform: toBoolean });
  /** Alto fijo de cada fila en modo virtual (px). */
  readonly virtualScrollItemSize = input<number>(36);
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly inputId = input<string>(`cb-select-${++nextUid}`);
  /** Nombre accesible del disparador cuando no hay etiqueta visible. */
  readonly ariaLabel = input<string>('');
  /** Id del elemento que etiqueta al disparador (p. ej. un `<label>` o título visible). */
  readonly ariaLabelledBy = input<string>('');

  /** Valor seleccionado (two-way opcional fuera de Angular Forms). */
  readonly value = model<unknown>(null);

  // --- Estado interno --------------------------------------------------------
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');
  protected readonly triggerWidth = signal<number>(0);
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

  // --- Derivados -------------------------------------------------------------
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

  protected readonly selectedOption = computed(() => {
    const value = this.value();
    return this.flatOptions().find((o) => this.valueOf(o) === value) ?? null;
  });

  protected readonly displayLabel = computed(() => {
    const selected = this.selectedOption();
    return selected ? this.labelOf(selected) : (this.placeholder() ?? this.t().select);
  });

  protected readonly canClear = computed(() => this.showClear() && this.selectedOption() !== null && !this.isDisabled());

  protected readonly activeDescendant = computed(() =>
    this.open() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  constructor() {
    // Enfoca el filtro al abrir (si existe).
    effect(() => {
      if (this.open() && this.filter()) {
        queueMicrotask(() => this.filterInputRef()?.nativeElement.focus());
      }
    });
    // Reinicia el índice activo cuando cambia la lista filtrada.
    effect(() => {
      this.filteredOptions();
      if (this.open()) this.ensureActiveVisible();
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typeaheadTimer));
  }

  // --- ControlValueAccessor --------------------------------------------------
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) return;
    this.open() ? this.close() : this.openPanel();
  }

  protected openPanel(): void {
    if (this.isDisabled()) return;
    this.triggerWidth.set(this.triggerRef().nativeElement.offsetWidth);
    this.scrollTop.set(0);
    this.open.set(true);
    const selectedIdx = this.filteredOptions().indexOf(this.selectedOption() as unknown);
    this.setActive(selectedIdx >= 0 ? selectedIdx : this.firstEnabledIndex());
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.filterText.set('');
    this.onTouched();
    queueMicrotask(() => this.triggerRef().nativeElement.focus());
  }

  protected selectOption(opt: unknown): void {
    if (this.isOptionDisabled(opt)) return;
    const value = this.valueOf(opt);
    this.value.set(value);
    this.onChange(value);
    this.close();
  }

  /** Vacía la selección (botón de `showClear`) y devuelve el foco al disparador. */
  clear(): void {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
    this.triggerRef().nativeElement.focus();
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
    const inFilter = event.target === this.filterInputRef()?.nativeElement;
    if (!inFilter && isPrintable(event)) {
      event.preventDefault();
      if (!this.open()) {
        this.openPanel();
        // Sin selección previa, la búsqueda empieza por la primera opción.
        if (!this.selectedOption()) this.activeIndex.set(-1);
      }
      // Con filtro, lo tecleado empieza la búsqueda; sin él, salta a la opción que coincide.
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
      case 'Enter':
        event.preventDefault();
        this.selectActive();
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
    return this.valueOf(opt) === this.value();
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

  private move(delta: number): void {
    const opts = this.filteredOptions();
    if (opts.length === 0) return;
    let i = this.activeIndex();
    for (let step = 0; step < opts.length; step++) {
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

  private selectActive(): void {
    const opt = this.filteredOptions()[this.activeIndex()];
    if (opt !== undefined) this.selectOption(opt);
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

  private ensureActiveVisible(): void {
    if (this.activeIndex() >= this.filteredOptions().length) {
      this.setActive(this.firstEnabledIndex());
    }
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
