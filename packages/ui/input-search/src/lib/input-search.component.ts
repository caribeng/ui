import { ChangeDetectionStrategy, Component, ViewEncapsulation, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cb-input-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputSearchComponent),
      multi: true,
    },
  ],
  host: { class: 'cb-input-search' },
  template: `
    <div class="cb-caribe-box" style="padding: 0.35rem 0.65rem; min-width: 240px">
      <input
        type="search"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled() || cvaDisabled()"
        [attr.aria-label]="placeholder()"
        (input)="onInput($event)"
        (keydown.enter)="search.emit(value())"
        style="border: none; outline: none; background: transparent; color: inherit; width: 100%; font-size: 0.875rem"
      />
      @if (clearable() && value()) {
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          (click)="clear()"
          style="border: none; background: transparent; cursor: pointer; color: var(--cb-color-text-muted, #64748b)"
        >
          ×
        </button>
      }
    </div>
  `,
  styleUrl: './input-search.component.css',
})
export class CbInputSearchComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('Buscar…');
  readonly clearable = input<boolean>(true);
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');
  readonly search = output<string>();

  protected readonly cvaDisabled = signal(false);
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
    this.search.emit('');
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
