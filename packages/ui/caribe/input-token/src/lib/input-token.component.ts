import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  host: { class: 'cb-input-token' },
  template: `
    <div style="display: inline-flex; flex-direction: column; gap: 0.4rem">
      <div style="display: inline-flex; gap: 0.45rem" role="group" aria-label="Código de verificación">
        @for (slot of slots(); track slot) {
          <input
            [type]="unmasked() ? 'text' : 'password'"
            maxlength="1"
            inputmode="numeric"
            [value]="charAt(slot)"
            [disabled]="disabled() || cvaDisabled()"
            [attr.aria-label]="'Dígito ' + (slot + 1)"
            (input)="onDigitInput($event, slot)"
            style="width: 2.4rem; height: 2.6rem; text-align: center; border-radius: 0.5rem; border: 1px solid var(--cb-color-border, #cbd5e1); font-size: 1rem; font-weight: 600"
          />
        }
      </div>
      @if (helpText()) {
        <span style="font-size: 0.75rem; color: var(--cb-color-text-muted, #64748b)">{{ helpText() }}</span>
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

  readonly value = model<string>('');
  protected readonly cvaDisabled = signal(false);

  protected readonly slots = computed(() =>
    Array.from({ length: Math.max(3, Math.min(8, this.numInputs())) }, (_, i) => i)
  );

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

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
