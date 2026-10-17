import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * InputMask de CaribeNG: campo de texto con máscara de formato (`9` = dígito,
 * `a` = letra, `*` = alfanumérico) e integración con Angular Forms (CVA).
 */
@Component({
  selector: 'cb-input-mask',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputMaskComponent),
      multi: true,
    },
  ],
  host: {
    class: 'cb-input-mask',
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  template: `
    <input
      type="text"
      class="cb-input-mask__field"
      [value]="displayValue()"
      [placeholder]="placeholder() || mask()"
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel() || null"
      (input)="onInput($event)"
      (blur)="onBlur()"
    />
  `,
  styleUrl: './inputmask.component.css',
})
export class CbInputMaskComponent implements ControlValueAccessor {
  /** Patrón de máscara: `9` para números, `a` para letras, `*` alfanumérico. */
  readonly mask = input<string>('999-999');
  /** Si es true, el valor del modelo excluye los literales de la máscara. */
  readonly unmask = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string>('');

  readonly value = model<string>('');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly displayValue = computed(() => {
    const raw = this.value() ?? '';
    if (!raw) return '';
    return this.applyMask(raw, this.mask()).masked;
  });

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | null | undefined): void {
    this.value.set(val ?? '');
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

  protected onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const { masked, unmasked } = this.applyMask(inputEl.value, this.mask());
    inputEl.value = masked;
    const nextVal = this.unmask() ? unmasked : masked;
    this.value.set(nextVal);
    this.onChange(nextVal);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private applyMask(raw: string, mask: string): { masked: string; unmasked: string } {
    const cleanChars = Array.from(raw);
    let rawIdx = 0;
    let masked = '';
    let unmasked = '';

    for (let mIdx = 0; mIdx < mask.length; mIdx++) {
      const mChar = mask[mIdx];
      if (mChar === '9' || mChar === 'a' || mChar === '*') {
        let matched = '';
        while (rawIdx < cleanChars.length) {
          const candidate = cleanChars[rawIdx++];
          if (this.matchesToken(candidate, mChar)) {
            matched = candidate;
            break;
          }
        }
        if (!matched) break;
        masked += matched;
        unmasked += matched;
      } else {
        if (rawIdx < cleanChars.length && cleanChars[rawIdx] === mChar) {
          rawIdx++;
        }
        if (rawIdx <= cleanChars.length && unmasked.length > 0) {
          masked += mChar;
        }
      }
    }

    return { masked, unmasked };
  }

  private matchesToken(ch: string, token: '9' | 'a' | '*'): boolean {
    if (token === '9') return /^[0-9]$/.test(ch);
    if (token === 'a') return /^[a-zA-Z]$/.test(ch);
    return /^[a-zA-Z0-9]$/.test(ch);
  }
}
