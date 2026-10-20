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
import { cbFieldState } from '@caribeng/ui';

let nextUid = 0;

/**
 * Switch de Caribe Design. Permite alternar entre dos estados mutuamente
 * exclusivos (on/off). Integrado con Angular Forms vía `ControlValueAccessor`,
 * expone `role="switch"` y soporte de teclado.
 *
 * @example
 * ```html
 * <cb-switch [(value)]="activo">Notificaciones</cb-switch>
 * <cb-switch formControlName="oscuro" leftLabel>Modo oscuro</cb-switch>
 * ```
 */
@Component({
  selector: 'cb-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-switch-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbSwitch),
      multi: true,
    },
  ],
  template: `
    <label
      class="cb-switch"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-switch--left-label]="leftLabel()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <input
        type="checkbox"
        class="cb-switch__input"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        role="switch"
        [id]="inputId()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-checked]="checked()"
        [attr.aria-required]="fieldState.required() || null"
        [attr.aria-label]="label() ? null : 'Interruptor'"
        (change)="toggle()"
        (blur)="handleBlur()"
      />
      <span class="cb-switch__track" aria-hidden="true">
        <span class="cb-switch__thumb"></span>
      </span>
      @if (label()) {
        <span class="cb-switch__label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './switch.component.css',
})
export class CbSwitch implements ControlValueAccessor {
  /** Etiqueta visible junto al control. */
  readonly label = input<string>('');
  /** Coloca la etiqueta a la izquierda del control. */
  readonly leftLabel = input(false, { transform: booleanAttr });
  /** Marca el control como requerido (`aria-required`). */
  readonly required = input(false, { transform: booleanAttr });
  /** Deshabilitado declarativo (se combina con Angular Forms). */
  readonly disabled = input(false, { transform: booleanAttr });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttr });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
  });
  /** Id del input; se genera uno estable si no se provee. */
  readonly inputId = input<string>(`cb-switch-${++nextUid}`);

  /** Estado del switch (two-way: `[(checked)]`). */
  readonly checked = model(false);
  /** Emite el nuevo estado al cambiar. */
  readonly changed = output<boolean>();

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
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
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
    this.changed.emit(next);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}

function booleanAttr(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
