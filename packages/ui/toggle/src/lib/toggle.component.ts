import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { cbFieldState, type CbSize } from '@caribeng/ui';

let nextUid = 0;

/**
 * Switch/Toggle booleano de CaribeNG integrado con Angular Forms vía
 * `ControlValueAccessor`. Expone `role="switch"` para accesibilidad.
 *
 * @example
 * ```html
 * <cb-toggle formControlName="notificaciones" label="Recibir notificaciones" />
 * ```
 */
@Component({
  selector: 'cb-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-toggle-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbToggle),
      multi: true,
    },
  ],
  template: `
    <label
      class="cb-toggle"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class]="'cb-toggle--' + size()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <input
        type="checkbox"
        class="cb-toggle__input"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-required]="fieldState.required() || null"
        role="switch"
        [id]="inputId()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() ? null : ariaLabel()"
        (change)="toggle()"
        (blur)="handleBlur()"
      />
      <span class="cb-toggle__track" aria-hidden="true">
        <span class="cb-toggle__thumb"></span>
      </span>
      @if (label()) {
        <span class="cb-toggle__label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './toggle.component.css',
})
export class CbToggle implements ControlValueAccessor {
  /** Etiqueta mostrada junto al control. */
  readonly label = input<string>('');
  /** `aria-label` cuando no hay `label` visible. */
  readonly ariaLabel = input<string>('');
  /** Tamaño. */
  readonly size = input<CbSize>('md');
  /** Deshabilitado de forma declarativa (se combina con Angular Forms). */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  /** Id del input; se genera uno estable si no se provee. */
  readonly inputId = input<string>(`cb-toggle-${++nextUid}`);

  /** Emite el nuevo estado al cambiar. */
  readonly changed = output<boolean>();

  protected readonly checked = signal(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Lógica ----------------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
    this.changed.emit(next);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
