import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CbInputSelectOption {
  label: string;
  value: string;
}

/**
 * Input-select de Caribe Design: desplegable nativo estilizado con etiqueta,
 * placeholder y CVA.
 *
 * @example
 * ```html
 * <cb-input-select label="País" [options]="paises" />
 * ```
 */
@Component({
  selector: 'cb-input-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputSelect),
      multi: true,
    },
  ],
  host: { class: 'cb-input-select-host' },
  template: `
    <label class="cb-input-select">
      @if (label()) {
        <span class="cb-input-select__label">{{ label() }}</span>
      }
      <div class="cb-input-select__wrap">
        <select
          class="cb-input-select__field"
          [value]="value()"
          [disabled]="disabled() || cvaDisabled()"
          (change)="onSelect($event)"
          (blur)="onTouched()"
        >
          @if (placeholder()) {
            <option value="" disabled>{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <span class="cb-input-select__chevron" aria-hidden="true">▾</span>
      </div>
    </label>
  `,
  styleUrl: './input-select.component.css',
})
export class CbInputSelect implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Seleccione una opción');
  readonly options = input<readonly CbInputSelectOption[]>([]);
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');
  protected readonly cvaDisabled = signal(false);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onSelect(event: Event): void {
    const next = (event.target as HTMLSelectElement).value;
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
