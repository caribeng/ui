import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import type { CbSize } from '@caribeng/ui';

let nextUid = 0;

/**
 * Checkbox de CaribeNG integrado con Angular Forms vía `ControlValueAccessor`.
 *
 * Soporta dos modos automáticos según el valor enlazado:
 * - **Binario** (por defecto): el modelo es `boolean`.
 * - **Lista**: si el modelo enlazado es un array, el checkbox añade o quita su
 *   `value` de la lista. Útil para grupos de selección múltiple.
 *
 * @example
 * ```html
 * <!-- Binario -->
 * <cb-checkbox formControlName="acepto" label="Acepto los términos" />
 *
 * <!-- Lista -->
 * <cb-checkbox formControlName="gustos" value="cafe" label="Café" />
 * <cb-checkbox formControlName="gustos" value="te" label="Té" />
 * ```
 */
@Component({
  selector: 'cb-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-checkbox-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbCheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label
      class="cb-checkbox"
      [class]="'cb-checkbox--' + size()"
      [class.cb-is-disabled]="isDisabled()"
      [class.cb-is-invalid]="invalid()"
    >
      <input
        type="checkbox"
        class="cb-checkbox__input"
        [id]="inputId()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [required]="required()"
        [attr.aria-checked]="indeterminate() ? 'mixed' : checked()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-label]="label() ? null : ariaLabel()"
        (change)="toggle()"
        (blur)="handleBlur()"
      />
      <span class="cb-checkbox__box" aria-hidden="true">
        @if (indeterminate()) {
          <svg class="cb-checkbox__icon" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        } @else if (checked()) {
          <svg class="cb-checkbox__icon" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      </span>
      @if (label()) {
        <span class="cb-checkbox__label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './checkbox.component.css',
})
export class CbCheckboxComponent implements ControlValueAccessor {
  /** Etiqueta mostrada junto al control. */
  readonly label = input<string>('');
  /** `aria-label` cuando no hay `label` visible. */
  readonly ariaLabel = input<string>('');
  /** Tamaño. */
  readonly size = input<CbSize>('md');
  /** Valor que aporta a la lista cuando el modelo enlazado es un array. */
  readonly value = input<unknown>(true);
  /** Estado indeterminado (visual + `aria-checked="mixed"`). */
  readonly indeterminate = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido. */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Requerido. */
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  /** Deshabilitado de forma declarativa (se combina con Angular Forms). */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Id del input; se genera uno estable si no se provee. */
  readonly inputId = input<string>(`cb-checkbox-${++nextUid}`);

  /** Emite el nuevo estado al cambiar. */
  readonly changed = output<boolean | unknown[]>();

  private readonly modelValue = signal<unknown>(false);

  protected readonly checked = computed(() => {
    const v = this.modelValue();
    return Array.isArray(v) ? v.includes(this.value()) : !!v;
  });

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: unknown): void {
    this.modelValue.set(Array.isArray(value) ? [...value] : value);
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

  // --- Lógica ----------------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) return;
    const current = this.modelValue();
    let next: boolean | unknown[];
    if (Array.isArray(current)) {
      const val = this.value();
      next = current.includes(val)
        ? current.filter((x) => x !== val)
        : [...current, val];
    } else {
      next = !current;
    }
    this.modelValue.set(next);
    this.onChange(next);
    this.onTouched();
    this.changed.emit(next);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
