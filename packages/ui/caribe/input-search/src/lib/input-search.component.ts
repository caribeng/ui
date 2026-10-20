import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
  model,
  output,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cbFieldState, injectCbTranslation } from '@caribeng/ui';

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
    <div
      class="cb-input-search"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="disabled() || cvaDisabled()"
    >
      <span class="cb-input-search__icon" aria-hidden="true">⌕</span>
      <input
        class="cb-input-search__field"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-required]="fieldState.required() || null"
        type="search"
        [value]="value()"
        [placeholder]="(placeholder() ?? t().search)"
        [disabled]="disabled() || cvaDisabled()"
        [attr.aria-label]="(placeholder() ?? t().search)"
        (input)="onInput($event)"
        (blur)="onTouched()"
        (keydown.enter)="search.emit(value())"
      />
      @if (clearable() && value()) {
        <button
          type="button"
          class="cb-input-search__clear"
          [attr.aria-label]="t().clearSearch"
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
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly placeholder = input<string | undefined>(undefined);
  readonly clearable = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });

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
