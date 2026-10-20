import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cbFieldState } from '@caribeng/ui';

/**
 * Input-token de Caribe Design: entrada de código OTP con casillas por dígito,
 * enmascarado opcional y CVA.
 *
 * @example
 * ```html
 * <cb-input-token [numInputs]="6" helpText="Enviado a tu móvil" />
 * ```
 */
@Component({
  selector: 'cb-input-token',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputToken),
      multi: true,
    },
  ],
  host: { class: 'cb-input-token-host' },
  template: `
    <div class="cb-input-token">
      <div
        class="cb-input-token__slots"
        role="group"
        aria-label="Código de verificación"
      >
        @for (slot of slots(); track slot) {
          <input
            class="cb-input-token__slot"
            [class.cb-is-invalid]="fieldState.invalid()"
            [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
            [type]="unmasked() ? 'text' : 'password'"
            maxlength="1"
            inputmode="numeric"
            [value]="charAt(slot)"
            [disabled]="disabled() || cvaDisabled()"
            [attr.aria-label]="'Dígito ' + (slot + 1)"
            (input)="onDigitInput($event, slot)"
            (blur)="onTouched()"
          />
        }
      </div>
      @if (helpText()) {
        <span class="cb-input-token__help">{{ helpText() }}</span>
      }
    </div>
  `,
  styleUrl: './input-token.component.css',
})
export class CbInputToken implements ControlValueAccessor {
  readonly numInputs = input<number>(6);
  readonly unmasked = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly disabled = input<boolean>(false);
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });

  readonly value = model<string>('');
  protected readonly cvaDisabled = signal(false);

  protected readonly slots = computed(() =>
    Array.from(
      { length: Math.max(3, Math.min(8, this.numInputs())) },
      (_, i) => i,
    ),
  );

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected charAt(index: number): string {
    return (this.value() ?? '')[index] ?? '';
  }

  protected onDigitInput(event: Event, index: number): void {
    const ch = ((event.target as HTMLInputElement).value || '').slice(-1);
    const chars = this.slots().map((i) => this.charAt(i));
    chars[index] = ch;
    const next = chars.join('');
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
