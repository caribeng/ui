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
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/**
 * Selección múltiple (multiselect) de CaribeNG. Listbox accesible sobre CDK
 * Overlay con casillas, filtro y seleccionar-todo. Integrado con Angular Forms
 * vía `ControlValueAccessor`; el modelo es un array de valores.
 *
 * @example
 * ```html
 * <cb-multiselect [options]="ciudades" optionLabel="nombre" optionValue="id"
 *                 formControlName="ciudades" placeholder="Elige ciudades" />
 * ```
 */
@Component({
  selector: 'cb-multiselect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
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
              <button type="button" class="cb-multiselect__all" (click)="toggleAll()">
                <span class="cb-multiselect__check" [class.cb-is-checked]="allSelected()">
                  @if (allSelected()) { <cb-icon name="check" [size]="14" aria-hidden="true" /> }
                </span>
                {{ t().selectAll }}
              </button>
            }
            @if (filter()) {
              <input
                #filterInput
                type="text"
                class="cb-multiselect__filter-input"
                [placeholder]="(filterPlaceholder() ?? t().search)"
                [value]="filterText()"
                (input)="onFilter($event)"
                (keydown)="onTriggerKeydown($event)"
                [attr.aria-label]="t().filterOptions"
              />
            }
          </div>
        }
        <ul class="cb-multiselect__list" role="listbox" aria-multiselectable="true" [id]="listboxId">
          @for (opt of filteredOptions(); track trackOption(opt); let i = $index) {
            <li
              class="cb-multiselect__option"
              [class.cb-is-active]="i === activeIndex()"
              [class.cb-is-selected]="isSelected(opt)"
              [class.cb-is-disabled]="isOptionDisabled(opt)"
              role="option"
              [id]="optionId(i)"
              [attr.aria-selected]="isSelected(opt)"
              [attr.aria-disabled]="isOptionDisabled(opt) ? 'true' : null"
              (click)="toggleOption(opt)"
              (mouseenter)="activeIndex.set(i)"
            >
              <span class="cb-multiselect__check" [class.cb-is-checked]="isSelected(opt)">
                @if (isSelected(opt)) { <cb-icon name="check" [size]="14" aria-hidden="true" /> }
              </span>
              {{ labelOf(opt) }}
            </li>
          } @empty {
            <li class="cb-multiselect__empty" role="option" aria-disabled="true">
              {{ (emptyMessage() ?? t().noResults) }}
            </li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  styleUrl: './multiselect.component.css',
})
export class CbMultiSelect implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string | null>(null);
  readonly optionDisabled = input<string>('disabled');
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<CbSize>('md');
  readonly filter = input<boolean, unknown>(false, { transform: toBoolean });
  readonly filterPlaceholder = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly showToggleAll = input<boolean, unknown>(true, { transform: toBoolean });
  /** Nº máx. de etiquetas antes de mostrar "N seleccionados". */
  readonly maxSelectedLabels = input<number>(3);
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

  protected readonly filteredOptions = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    const opts = this.options();
    if (!this.filter() || !q) return opts;
    return opts.filter((o) => this.labelOf(o).toLowerCase().includes(q));
  });

  protected readonly selected = computed(() =>
    this.options().filter((o) => this.value().includes(this.valueOf(o))),
  );

  protected readonly displayLabel = computed(() => {
    const sel = this.selected();
    if (!sel.length) return (this.placeholder() ?? this.t().select);
    if (sel.length > this.maxSelectedLabels()) return cbFormat(this.t().selectedCount, sel.length);
    return sel.map((o) => this.labelOf(o)).join(', ');
  });

  protected readonly allSelected = computed(() => {
    const enabled = this.options().filter((o) => !this.isOptionDisabled(o));
    return enabled.length > 0 && enabled.every((o) => this.value().includes(this.valueOf(o)));
  });

  constructor() {
    effect(() => {
      if (this.open() && this.filter()) {
        queueMicrotask(() => this.filterInputRef()?.nativeElement.focus());
      }
    });
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
    this.open.set(true);
    this.activeIndex.set(this.firstEnabledIndex());
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
    const enabled = this.options().filter((o) => !this.isOptionDisabled(o));
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
        this.activeIndex.set(this.filteredOptions().length - 1);
        break;
      case 'Enter':
      case ' ': {
        const opt = this.filteredOptions()[this.activeIndex()];
        if (opt !== undefined) {
          event.preventDefault();
          this.toggleOption(opt);
        }
        break;
      }
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
  protected trackOption(opt: unknown): unknown {
    return this.valueOf(opt);
  }

  private firstEnabledIndex(): number {
    return this.filteredOptions().findIndex((o) => !this.isOptionDisabled(o));
  }
  private move(delta: number): void {
    const opts = this.filteredOptions();
    if (!opts.length) return;
    let i = this.activeIndex();
    for (let s = 0; s < opts.length; s++) {
      i = (i + delta + opts.length) % opts.length;
      if (!this.isOptionDisabled(opts[i])) {
        this.activeIndex.set(i);
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
