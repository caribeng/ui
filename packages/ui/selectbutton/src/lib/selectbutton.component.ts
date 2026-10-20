import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { cbFieldState, type CbSize } from '@caribeng/ui';

let nextUid = 0;

/**
 * SelectButton de CaribeNG: grupo de botones segmentados para elegir una o
 * varias opciones. Integrado con Angular Forms vía `ControlValueAccessor`.
 *
 * @example
 * ```html
 * <cb-selectbutton [options]="vistas" optionLabel="nombre" optionValue="id"
 *                  formControlName="vista" />
 * ```
 */
@Component({
  selector: 'cb-selectbutton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-selectbutton',
    '[class.cb-is-invalid]': 'fieldState.invalid()',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbSelectButton),
      multi: true,
    },
  ],
  template: `
    @for (opt of options(); track trackOption(opt); let i = $index) {
      <button
        type="button"
        class="cb-selectbutton__btn"
        [class]="'cb-selectbutton__btn--' + size()"
        [class.cb-is-selected]="isSelected(opt)"
        [attr.aria-pressed]="isSelected(opt)"
        [disabled]="isDisabled() || isOptionDisabled(opt)"
        (click)="select(opt)"
      >
        {{ labelOf(opt) }}
      </button>
    }
  `,
  styleUrl: './selectbutton.component.css',
})
export class CbSelectButton implements ControlValueAccessor {
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string | null>(null);
  readonly optionDisabled = input<string>('disabled');
  readonly multiple = input<boolean, unknown>(false, { transform: toBoolean });
  readonly size = input<CbSize>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-selectbutton-${++nextUid}`);

  readonly value = model<unknown>(null);
  readonly changed = output<unknown>();

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(this.multiple() ? (Array.isArray(value) ? [...value] : []) : value ?? null);
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
  protected select(opt: unknown): void {
    if (this.isDisabled() || this.isOptionDisabled(opt)) return;
    const val = this.valueOf(opt);
    let next: unknown;
    if (this.multiple()) {
      const arr = Array.isArray(this.value()) ? (this.value() as unknown[]) : [];
      next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    } else {
      next = this.value() === val ? null : val;
    }
    this.commit(next);
  }

  private commit(next: unknown): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    this.changed.emit(next);
  }

  // --- Helpers ---------------------------------------------------------------
  protected isSelected(opt: unknown): boolean {
    const val = this.valueOf(opt);
    const v = this.value();
    return Array.isArray(v) ? v.includes(val) : v === val;
  }
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
  protected trackOption(opt: unknown): unknown {
    return this.valueOf(opt);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
