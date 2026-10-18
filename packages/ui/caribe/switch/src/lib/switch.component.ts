import { ChangeDetectionStrategy, Component, ViewEncapsulation, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cb-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbSwitch),
      multi: true,
    },
  ],
  host: { class: 'cb-switch' },
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label() || 'Interruptor'"
      [disabled]="disabled() || cvaDisabled()"
      (click)="toggle()"
      style="display: inline-flex; align-items: center; gap: 0.5rem; border: none; background: transparent; cursor: pointer; color: inherit"
    >
      <span
        [style.background]="checked() ? 'var(--cb-color-primary-500, #10b981)' : 'var(--cb-color-surface-300, #cbd5e1)'"
        style="width: 2.5rem; height: 1.4rem; border-radius: 999px; position: relative; display: inline-flex; align-items: center; padding: 0 0.15rem; transition: background 150ms ease"
      >
        <span
          [style.transform]="checked() ? 'translateX(1.1rem)' : 'translateX(0)'"
          style="width: 1.1rem; height: 1.1rem; border-radius: 999px; background: #ffffff; transition: transform 150ms ease"
        ></span>
      </span>
      @if (label()) {
        <span style="font-size: 0.875rem">{{ label() }}</span>
      }
    </button>
  `,
  styleUrl: './switch.component.css',
})
export class CbSwitch implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly checked = model<boolean>(false);

  protected readonly cvaDisabled = signal(false);
  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled() || this.cvaDisabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }

  writeValue(val: boolean | null | undefined): void {
    this.checked.set(!!val);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
