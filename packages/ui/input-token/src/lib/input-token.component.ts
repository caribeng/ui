import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cbFormat, cbFieldState, injectCbTranslation } from '@caribeng/ui';

/**
 * Input-token: entrada de código OTP con casillas por dígito,
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
        [attr.aria-label]="t().verificationCode"
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
            [attr.aria-label]="fmt(t().digit, slot + 1)"
            (input)="onDigitInput($event, slot)"
            (keydown)="onKeydown($event, slot)"
            (paste)="onPaste($event)"
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
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly slots = computed(() =>
    Array.from(
      { length: Math.max(3, Math.min(8, this.numInputs())) },
      (_, i) => i,
    ),
  );

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected charAt(index: number): string {
    const ch = (this.value() ?? '')[index] ?? '';
    return ch === ' ' ? '' : ch;
  }

  /** Solo acepta dígitos y pasa a la casilla siguiente al escribir uno. */
  protected onDigitInput(event: Event, index: number): void {
    const el = event.target as HTMLInputElement;
    const ch = (el.value || '').slice(-1);
    const digit = /^[0-9]$/.test(ch) ? ch : '';
    el.value = digit;
    this.setChar(index, digit);
    if (digit) this.focusSlot(index + 1);
  }

  /** Flechas mueven el foco; Backspace borra la casilla actual o, si está vacía, la anterior. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.focusSlot(index + (event.key === 'ArrowLeft' ? -1 : 1));
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      const target = this.charAt(index) || index === 0 ? index : index - 1;
      this.setChar(target, '');
      this.slotEls()[target].value = '';
      this.focusSlot(target);
    }
  }

  /** Pegar reparte los dígitos entre las casillas y enfoca la última rellenada. */
  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const digits = (event.clipboardData?.getData('text') ?? '').replace(/[^0-9]/g, '').slice(0, this.slots().length);
    if (!digits) return;
    this.updateValue(digits);
    this.focusSlot(digits.length - 1);
  }

  private setChar(index: number, ch: string): void {
    const chars = this.slots().map((i) => this.charAt(i) || ' ');
    chars[index] = ch || ' ';
    this.updateValue(chars.join('').trimEnd());
  }

  private updateValue(next: string): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  private slotEls(): HTMLInputElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLInputElement>('.cb-input-token__slot'));
  }

  private focusSlot(index: number): void {
    this.slotEls()[index]?.focus();
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
