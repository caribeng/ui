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
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { cbFieldState, type CbSize } from '@caribeng/ui';

export type CbInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number';

let nextUid = 0;

/**
 * Campo de texto de CaribeNG integrado con Angular Forms vía
 * `ControlValueAccessor`. Compatible con `formControlName`, `[formControl]` y
 * `ngModel`.
 *
 * @example
 * ```html
 * <cb-input formControlName="email" type="email" placeholder="Correo"
 *           [invalid]="form.controls.email.invalid && form.controls.email.touched"
 *           error="Correo inválido" />
 * ```
 */
@Component({
  selector: 'cb-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-input-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInput),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="cb-input__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.required()) {
          <span class="cb-input__required" aria-hidden="true">*</span>
        }
      </label>
    }

    <input
      class="cb-input__field"
      [class]="'cb-input__field--' + size()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      [id]="inputId()"
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readonly]="readonly()"
      [required]="fieldState.required()"
      [attr.inputmode]="inputmode()"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    />

    @if (fieldState.invalid() && error()) {
      <p class="cb-input__message cb-input__message--error" [id]="errorId()" role="alert">
        {{ error() }}
      </p>
    } @else if (hint()) {
      <p class="cb-input__message cb-input__message--hint" [id]="hintId()">
        {{ hint() }}
      </p>
    }
  `,
  styleUrl: './input.component.css',
})
export class CbInput implements ControlValueAccessor {
  /** Valor del control (two-way opcional fuera de Angular Forms). */
  readonly value = model<string>('');

  /** Etiqueta accesible. Si se omite, usa un `aria-label` externo. */
  readonly label = input<string>('');
  /** Texto de ayuda bajo el campo. */
  readonly hint = input<string>('');
  /** Mensaje de error (se muestra cuando `invalid` es true). */
  readonly error = input<string>('');
  /** Marca visual y ARIA de estado inválido. */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Tipo nativo del input. */
  readonly type = input<CbInputType>('text');
  /** Placeholder. */
  readonly placeholder = input<string>('');
  /** Tamaño. */
  readonly size = input<CbSize>('md');
  /** Solo lectura. */
  readonly readonly = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca el campo como requerido (atributo + indicador visual). */
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
  });
  /** `inputmode` para teclados móviles. */
  readonly inputmode = input<string | null>(null);
  /** Deshabilitado de forma declarativa (se combina con Angular Forms). */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Id del input; se genera uno estable si no se provee. */
  readonly inputId = input<string>(`cb-input-${++nextUid}`);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly describedBy = computed(() => {
    if (this.fieldState.invalid() && this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Eventos del DOM -------------------------------------------------------
  protected handleInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
