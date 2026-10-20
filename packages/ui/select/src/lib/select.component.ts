import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

/**
 * Select (dropdown) de CaribeNG. Listbox accesible sobre CDK Overlay con
 * navegación por teclado, filtro opcional e integración con Angular Forms
 * mediante `ControlValueAccessor`.
 *
 * @example
 * ```html
 * <cb-select [options]="ciudades" optionLabel="nombre" optionValue="id"
 *            formControlName="ciudad" placeholder="Elige una ciudad" />
 * ```
 */
@Component({
  selector: 'cb-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
  host: { class: 'cb-select-host' },
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
      [attr.aria-activedescendant]="activeDescendant()"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-required]="fieldState.required() || null"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
      (blur)="onBlur()"
    >
      <span
        class="cb-select__label"
        [class.cb-select__label--placeholder]="!selectedOption()"
      >
        {{ displayLabel() }}
      </span>
      <cb-icon class="cb-select__chevron" name="chevron-down" [size]="16" aria-hidden="true" />
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
      <div class="cb-select__panel" [attr.data-theme]="null">
        @if (filter()) {
          <div class="cb-select__filter">
            <input
              #filterInput
              type="text"
              class="cb-select__filter-input"
              [placeholder]="(filterPlaceholder() ?? t().search)"
              [value]="filterText()"
              (input)="onFilter($event)"
              (keydown)="onTriggerKeydown($event)"
              [attr.aria-label]="t().filterOptions"
            />
          </div>
        }
        <ul class="cb-select__list" role="listbox" [id]="listboxId">
          @for (opt of filteredOptions(); track trackOption(opt); let i = $index) {
            <li
              class="cb-select__option"
              [class.cb-is-active]="i === activeIndex()"
              [class.cb-is-selected]="isSelected(opt)"
              [class.cb-is-disabled]="isOptionDisabled(opt)"
              role="option"
              [id]="optionId(i)"
              [attr.aria-selected]="isSelected(opt)"
              [attr.aria-disabled]="isOptionDisabled(opt) ? 'true' : null"
              (click)="selectOption(opt)"
              (mouseenter)="activeIndex.set(i)"
            >
              {{ labelOf(opt) }}
            </li>
          } @empty {
            <li class="cb-select__empty" role="option" aria-disabled="true">
              {{ (emptyMessage() ?? t().noResults) }}
            </li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  styleUrl: './select.component.css',
})
export class CbSelect implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  // --- Inputs ----------------------------------------------------------------
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string | null>(null);
  readonly optionDisabled = input<string>('disabled');
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<CbSize>('md');
  readonly filter = input<boolean, unknown>(false, { transform: toBoolean });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
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

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly listboxId = `${this.inputId()}-listbox`;

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly filterInputRef = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  // --- Derivados -------------------------------------------------------------
  protected readonly filteredOptions = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    const opts = this.options();
    if (!this.filter() || !q) return opts;
    return opts.filter((o) => this.labelOf(o).toLowerCase().includes(q));
  });

  protected readonly selectedOption = computed(() => {
    const value = this.value();
    return this.options().find((o) => this.valueOf(o) === value) ?? null;
  });

  protected readonly displayLabel = computed(() => {
    const selected = this.selectedOption();
    return selected ? this.labelOf(selected) : (this.placeholder() ?? this.t().select);
  });

  protected readonly activeDescendant = computed(() =>
    this.open() && this.activeIndex() >= 0
      ? this.optionId(this.activeIndex())
      : null,
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
    this.open.set(true);
    const selectedIdx = this.filteredOptions().indexOf(this.selectedOption() as unknown);
    this.activeIndex.set(selectedIdx >= 0 ? selectedIdx : this.firstEnabledIndex());
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
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
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

  protected trackOption(opt: unknown): unknown {
    return this.valueOf(opt);
  }

  private move(delta: number): void {
    const opts = this.filteredOptions();
    if (opts.length === 0) return;
    let i = this.activeIndex();
    for (let step = 0; step < opts.length; step++) {
      i = (i + delta + opts.length) % opts.length;
      if (!this.isOptionDisabled(opts[i])) {
        this.activeIndex.set(i);
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
      this.activeIndex.set(this.firstEnabledIndex());
    }
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
