import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Input-search de Caribe Design: campo de búsqueda con icono, botón de limpiar
 * e integración con Angular Forms (CVA).
 *
 * @example
 * ```html
 * <cb-input-search placeholder="Buscar…" (search)="run($event)" />
 * ```
 */
@Component({
  selector: 'cb-input-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputSearch),
      multi: true,
    },
  ],
  host: { class: 'cb-input-search-host' },
  template: `
    <div class="cb-input-search" [class.cb-is-disabled]="disabled() || cvaDisabled()">
      <span class="cb-input-search__icon" aria-hidden="true">⌕</span>
      <input
        class="cb-input-search__field"
        type="search"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled() || cvaDisabled()"
        [attr.aria-label]="placeholder()"
        (input)="onInput($event)"
        (blur)="onTouched()"
        (keydown.enter)="search.emit(value())"
      />
      @if (clearable() && value()) {
        <button
          type="button"
          class="cb-input-search__clear"
          aria-label="Limpiar búsqueda"
          (click)="clear()"
        >
          ×
        </button>
      }
    </div>
  `,
  styleUrl: './input-search.component.css',
})
export class CbInputSearch implements ControlValueAccessor {
  readonly placeholder = input<string>('Buscar…');
  readonly clearable = input<boolean>(true);
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');
  readonly search = output<string>();

  protected readonly cvaDisabled = signal(false);
  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

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
