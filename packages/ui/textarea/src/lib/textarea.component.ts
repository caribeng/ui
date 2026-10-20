import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { cbFieldState, type CbSize } from '@caribeng/ui';

let nextUid = 0;

/**
 * Área de texto multilínea de CaribeNG integrada con Angular Forms vía
 * `ControlValueAccessor`. Soporta auto-resize opcional, filas fijas y conteo
 * de caracteres. Compatible con `formControlName`, `[formControl]` y `ngModel`.
 *
 * @example
 * ```html
 * <cb-textarea formControlName="bio" label="Biografía" autoResize
 *               [maxlength]="280" hint="Máx. 280 caracteres" />
 * ```
 */
@Component({
  selector: 'cb-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-textarea-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbTextarea),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="cb-textarea__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.required()) {
          <span class="cb-textarea__required" aria-hidden="true">*</span>
        }
      </label>
    }

    <textarea
      #field
      class="cb-textarea__field"
      [class]="'cb-textarea__field--' + size()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      [class.cb-textarea__field--auto]="autoResize()"
      [id]="inputId()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readonly]="readonly()"
      [required]="fieldState.required()"
      [rows]="rows()"
      [attr.maxlength]="maxlength()"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    ></textarea>

    <div class="cb-textarea__footer">
      @if (fieldState.invalid() && error()) {
        <p class="cb-textarea__message cb-textarea__message--error" [id]="errorId()" role="alert">
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p class="cb-textarea__message cb-textarea__message--hint" [id]="hintId()">
          {{ hint() }}
        </p>
      } @else {
        <span></span>
      }
      @if (maxlength() != null) {
        <span class="cb-textarea__count" aria-hidden="true">
          {{ value().length }}/{{ maxlength() }}
        </span>
      }
    </div>
  `,
  styleUrl: './textarea.component.css',
})
export class CbTextarea implements ControlValueAccessor {
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
  /** Placeholder. */
  readonly placeholder = input<string>('');
  /** Tamaño. */
  readonly size = input<CbSize>('md');
  /** Número de filas inicial. */
  readonly rows = input<number>(3);
  /** Crece automáticamente con el contenido (ignora el scroll vertical). */
  readonly autoResize = input<boolean, unknown>(false, { transform: toBoolean });
  /** Límite de caracteres; muestra un contador cuando se define. */
  readonly maxlength = input<number | null>(null);
  /** Solo lectura. */
  readonly readonly = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca el campo como requerido (atributo + indicador visual). */
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
  });
  /** Deshabilitado de forma declarativa (se combina con Angular Forms). */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Id del textarea; se genera uno estable si no se provee. */
  readonly inputId = input<string>(`cb-textarea-${++nextUid}`);

  private readonly field = viewChild<ElementRef<HTMLTextAreaElement>>('field');

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

  constructor() {
    // Ajusta la altura cuando cambia el valor (incl. writeValue) si autoResize.
    effect(() => {
      this.value();
      if (this.autoResize()) this.resize();
    });
  }

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
    const next = (event.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  private resize(): void {
    const el = this.field()?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
