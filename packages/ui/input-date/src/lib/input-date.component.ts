import { ChangeDetectionStrategy, Component, ViewEncapsulation, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cb-input-date',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputDateComponent),
      multi: true,
    },
  ],
  host: { class: 'cb-input-date' },
  template: `
    <label style="display: inline-flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem">
      @if (label()) {
        <span style="font-weight: 600">{{ label() }}</span>
      }
      <input
        type="date"
        [value]="value()"
        [attr.min]="min() || null"
        [attr.max]="max() || null"
        [disabled]="disabled() || cvaDisabled()"
        (input)="onInput($event)"
        style="padding: 0.45rem 0.7rem; border-radius: 0.5rem; border: 1px solid var(--cb-color-border, #cbd5e1); background: var(--cb-color-bg, #fff); color: inherit"
      />
    </label>
  `,
  styleUrl: './input-date.component.css',
})
export class CbInputDateComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');
  protected readonly cvaDisabled = signal(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

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
