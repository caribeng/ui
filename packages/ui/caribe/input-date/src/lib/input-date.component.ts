import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
  model,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cbFieldState } from '@caribeng/ui';

/**
 * Input-date de Caribe Design: campo de fecha nativo estilizado con etiqueta,
 * límites min/max y CVA.
 *
 * @example
 * ```html
 * <cb-input-date label="Fecha de pago" />
 * ```
 */
@Component({
  selector: 'cb-input-date',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputDate),
      multi: true,
    },
  ],
  host: { class: 'cb-input-date-host' },
  template: `
    <label class="cb-input-date">
      @if (label()) {
        <span class="cb-input-date__label">{{ label() }}</span>
      }
      <input
        class="cb-input-date__field"
        [class.cb-is-invalid]="fieldState.invalid()"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-required]="fieldState.required() || null"
        type="date"
        [value]="value()"
        [attr.min]="min() || null"
        [attr.max]="max() || null"
        [disabled]="disabled() || cvaDisabled()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </label>
  `,
  styleUrl: './input-date.component.css',
})
export class CbInputDate implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly disabled = input<boolean>(false);
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });

  readonly value = model<string>('');
  protected readonly cvaDisabled = signal(false);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  writeValue(val: string | null | undefined): void {
    this.value.set(val ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
