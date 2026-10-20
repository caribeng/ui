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
import { cbFieldState } from '@caribeng/ui';

/**
 * InputOTP de CaribeNG: entrada de código de verificación en casillas individuales
 * con avance automático de foco, pegado desde portapapeles e integración CVA.
 */
@Component({
  selector: 'cb-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputOtp),
      multi: true,
    },
  ],
  host: {
    class: 'cb-input-otp',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || "Código de verificación"',
  },
  template: `
    @for (idx of indices(); track idx) {
      <input
        [type]="mask() ? 'password' : 'text'"
        class="cb-input-otp__slot"
        [class.cb-is-invalid]="fieldState.invalid()"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        maxlength="1"
        [attr.inputmode]="integerOnly() ? 'numeric' : 'text'"
        [value]="charAt(idx)"
        [disabled]="isDisabled()"
        [attr.aria-label]="'Dígito ' + (idx + 1)"
        (input)="onSlotInput($event, idx)"
        (keydown)="onSlotKeydown($event, idx)"
        (paste)="onPaste($event)"
        (blur)="onBlur()"
      />
    }
  `,
  styleUrl: './inputotp.component.css',
})
export class CbInputOtp implements ControlValueAccessor {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly length = input<number>(6);
  readonly integerOnly = input<boolean>(false);
  readonly mask = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly ariaLabel = input<string>('Código de verificación');

  readonly value = model<string>('');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly indices = computed(() =>
    Array.from({ length: Math.max(1, this.length()) }, (_, i) => i),
  );

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | null | undefined): void {
    this.value.set((val ?? '').slice(0, this.length()));
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected charAt(idx: number): string {
    return (this.value() ?? '')[idx] ?? '';
  }

  protected onSlotInput(event: Event, idx: number): void {
    const el = event.target as HTMLInputElement;
    let ch = el.value.slice(-1);
    if (this.integerOnly() && !/^[0-9]$/.test(ch)) {
      ch = '';
    }
    el.value = ch;
    const chars = Array.from({ length: this.length() }, (_, i) => this.charAt(i));
    chars[idx] = ch;
    const next = chars.join('');
    this.value.set(next);
    this.onChange(next);

    if (ch && idx < this.length() - 1) {
      this.focusSlot(idx + 1);
    }
  }

  protected onSlotKeydown(event: KeyboardEvent, idx: number): void {
    if (event.key === 'Backspace' && !this.charAt(idx) && idx > 0) {
      event.preventDefault();
      this.focusSlot(idx - 1);
    } else if (event.key === 'ArrowLeft' && idx > 0) {
      event.preventDefault();
      this.focusSlot(idx - 1);
    } else if (event.key === 'ArrowRight' && idx < this.length() - 1) {
      event.preventDefault();
      this.focusSlot(idx + 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const raw = event.clipboardData?.getData('text') ?? '';
    const cleaned = this.integerOnly() ? raw.replace(/[^0-9]/g, '') : raw.trim();
    const next = cleaned.slice(0, this.length());
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private focusSlot(idx: number): void {
    const slots = this.hostRef.nativeElement.querySelectorAll<HTMLInputElement>('.cb-input-otp__slot');
    slots[idx]?.focus();
  }
}
