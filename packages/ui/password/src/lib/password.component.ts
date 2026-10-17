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

export type CbPasswordSize = 'sm' | 'md' | 'lg';
export type CbPasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

/**
 * Password de CaribeNG: campo de contraseña con alternancia de visibilidad,
 * indicador de fortaleza e integración completa con Angular Forms (CVA).
 */
@Component({
  selector: 'cb-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbPasswordComponent),
      multi: true,
    },
  ],
  host: {
    class: 'cb-password',
    '[class.cb-password--sm]': 'size() === "sm"',
    '[class.cb-password--md]': 'size() === "md"',
    '[class.cb-password--lg]': 'size() === "lg"',
    '[class.cb-is-disabled]': 'isDisabled()',
    '[class.cb-is-invalid]': 'invalid()',
  },
  template: `
    <div class="cb-password__field">
      <input
        class="cb-password__input"
        [attr.id]="inputId() || null"
        [type]="revealed() ? 'text' : 'password'"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.autocomplete]="autocomplete()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      @if (toggleMask()) {
        <button
          type="button"
          class="cb-password__toggle"
          [disabled]="isDisabled()"
          [attr.aria-label]="revealed() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          [attr.aria-pressed]="revealed()"
          (click)="toggleReveal()"
        >
          @if (revealed()) {
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        </button>
      }
    </div>

    @if (feedback() && value().length > 0) {
      <div class="cb-password__meter" role="status" aria-live="polite">
        <div class="cb-password__bars" aria-hidden="true">
          <span
            class="cb-password__bar"
            [class.cb-password__bar--weak]="strengthScore() === 1"
            [class.cb-password__bar--medium]="strengthScore() === 2"
            [class.cb-password__bar--strong]="strengthScore() === 3"
          ></span>
          <span
            class="cb-password__bar"
            [class.cb-password__bar--medium]="strengthScore() === 2"
            [class.cb-password__bar--strong]="strengthScore() === 3"
          ></span>
          <span
            class="cb-password__bar"
            [class.cb-password__bar--strong]="strengthScore() === 3"
          ></span>
        </div>
        <span class="cb-password__label">{{ strengthLabel() }}</span>
      </div>
    }
  `,
  styleUrl: './password.component.css',
})
export class CbPasswordComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly toggleMask = input<boolean>(true);
  readonly feedback = input<boolean>(true);
  readonly size = input<CbPasswordSize>('md');
  readonly inputId = input<string>('');
  readonly autocomplete = input<string>('current-password');

  readonly value = model<string>('');
  readonly revealed = signal(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  readonly strengthScore = computed<0 | 1 | 2 | 3>(() => {
    const val = this.value() ?? '';
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;
    return Math.max(1, Math.min(3, score)) as 1 | 2 | 3;
  });

  readonly strength = computed<CbPasswordStrength>(() => {
    const s = this.strengthScore();
    if (s === 1) return 'weak';
    if (s === 2) return 'medium';
    if (s === 3) return 'strong';
    return 'none';
  });

  protected readonly strengthLabel = computed(() => {
    switch (this.strength()) {
      case 'weak':
        return 'Fortaleza: Débil';
      case 'medium':
        return 'Fortaleza: Media';
      case 'strong':
        return 'Fortaleza: Fuerte';
      default:
        return '';
    }
  });

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  toggleReveal(): void {
    if (this.isDisabled()) return;
    this.revealed.update((v) => !v);
  }

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
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
