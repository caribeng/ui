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
import { cbFieldState, type CbRequiredIndicator, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

/**
 * Campo numérico de CaribeNG con botones de incremento/decremento, formato
 * sensible al locale (decimal o moneda) e integración con Angular Forms vía
 * `ControlValueAccessor`. El modelo es `number | null`.
 *
 * @example
 * ```html
 * <cb-input-number formControlName="precio" mode="currency" currency="COP"
 *                  locale="es-CO" [min]="0" label="Precio" />
 * ```
 */
@Component({
  selector: 'cb-input-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-input-number-host' },
  imports: [CbIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbInputNumber),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="cb-input-number__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span
            [class]="'cb-input-number__required cb-input-number__required--' + mark.kind"
            [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'"
          >{{ mark.text }}</span>
        }
      </label>
    }

    <div
      class="cb-input-number"
      [class]="'cb-input-number--' + size()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      [class.cb-input-number--buttons]="showButtons()"
    >
      <input
        class="cb-input-number__field"
        [id]="inputId()"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        [value]="display()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readonly]="readonly()"
        [required]="fieldState.required()"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        role="spinbutton"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        (focus)="onFocus()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
      />

      @if (showButtons()) {
        <div class="cb-input-number__buttons">
          <button
            type="button"
            class="cb-input-number__btn cb-input-number__btn--up"
            tabindex="-1"
            [attr.aria-label]="t().increment"
            [disabled]="isDisabled() || readonly() || isAtMax()"
            (click)="increment()"
          >
            <cb-icon name="chevron-up" [size]="14" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="cb-input-number__btn cb-input-number__btn--down"
            tabindex="-1"
            [attr.aria-label]="t().decrement"
            [disabled]="isDisabled() || readonly() || isAtMin()"
            (click)="decrement()"
          >
            <cb-icon name="chevron-down" [size]="14" aria-hidden="true" />
          </button>
        </div>
      }
    </div>

    @if (fieldState.invalid() && error()) {
      <p class="cb-input-number__message cb-input-number__message--error" [id]="errorId()" role="alert">
        {{ error() }}
      </p>
    } @else if (hint()) {
      <p class="cb-input-number__message cb-input-number__message--hint" [id]="hintId()">
        {{ hint() }}
      </p>
    }
  `,
  styleUrl: './input-number.component.css',
})
export class CbInputNumber implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Valor numérico (two-way opcional fuera de Angular Forms). */
  readonly value = model<number | null>(null);

  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  readonly size = input<CbSize>('md');
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  /** Indicador de obligatoriedad de este campo; si se omite usa el global de `provideCaribeNG()`. */
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });
  readonly readonly = input<boolean, unknown>(false, { transform: toBoolean });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly inputId = input<string>(`cb-input-number-${++nextUid}`);

  /** Valor mínimo permitido. */
  readonly min = input<number | null>(null);
  /** Valor máximo permitido. */
  readonly max = input<number | null>(null);
  /** Incremento de los botones y de las flechas. */
  readonly step = input<number>(1);
  /** Muestra los botones de incremento/decremento. */
  readonly showButtons = input<boolean, unknown>(false, { transform: toBoolean });

  /** 'decimal' (por defecto) o 'currency'. */
  readonly mode = input<'decimal' | 'currency'>('decimal');
  /** Código ISO de moneda cuando mode='currency' (p. ej. 'USD', 'COP', 'EUR'). */
  readonly currency = input<string>('USD');
  /** Locale BCP 47 para el formato (por defecto el del navegador). */
  readonly locale = input<string | undefined>(undefined);
  /** Agrupación de miles. */
  readonly useGrouping = input<boolean, unknown>(true, { transform: toBoolean });
  /** Mínimo de decimales. */
  readonly minFractionDigits = input<number | null>(null);
  /** Máximo de decimales. */
  readonly maxFractionDigits = input<number | null>(null);
  /** Texto antepuesto (solo visual, cuando no está enfocado). */
  readonly prefix = input<string>('');
  /** Texto pospuesto (solo visual, cuando no está enfocado). */
  readonly suffix = input<string>('');

  private readonly focused = signal(false);
  /** Texto en edición mientras el campo tiene foco. */
  private readonly editing = signal<string>('');

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

  /** Separadores del locale, derivados de Intl. */
  private readonly separators = computed(() => {
    const parts = new Intl.NumberFormat(this.locale()).formatToParts(12345.6);
    return {
      decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
      group: parts.find((p) => p.type === 'group')?.value ?? ',',
    };
  });

  /** Texto mostrado en el input (formateado si no hay foco, crudo si edita). */
  protected readonly display = computed(() => {
    if (this.focused()) return this.editing();
    const v = this.value();
    if (v == null || Number.isNaN(v)) return '';
    return `${this.prefix()}${this.format(v)}${this.suffix()}`;
  });

  protected readonly isAtMax = computed(() => {
    const max = this.max();
    return max != null && this.value() != null && (this.value() as number) >= max;
  });
  protected readonly isAtMin = computed(() => {
    const min = this.min();
    return min != null && this.value() != null && (this.value() as number) <= min;
  });

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: number | null): void {
    this.value.set(typeof value === 'number' && !Number.isNaN(value) ? value : null);
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected onFocus(): void {
    this.focused.set(true);
    const v = this.value();
    this.editing.set(v == null ? '' : this.toRawString(v));
  }

  protected onInput(event: Event): void {
    this.editing.set((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    const parsed = this.parse(this.editing());
    this.commit(parsed);
    this.focused.set(false);
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  protected increment(): void {
    this.spin(this.step());
  }
  protected decrement(): void {
    this.spin(-this.step());
  }

  private spin(delta: number): void {
    if (this.isDisabled() || this.readonly()) return;
    const base = this.focused() ? this.parse(this.editing()) : this.value();
    const next = this.clamp((base ?? 0) + delta);
    this.commit(next);
    if (this.focused()) this.editing.set(next == null ? '' : this.toRawString(next));
  }

  private commit(next: number | null): void {
    const clamped = next == null ? null : this.clamp(next);
    if (clamped !== this.value()) {
      this.value.set(clamped);
      this.onChange(clamped);
    }
  }

  // --- Formato / parseo ------------------------------------------------------
  private format(n: number): string {
    const options: Intl.NumberFormatOptions = {
      useGrouping: this.useGrouping(),
    };
    if (this.mode() === 'currency') {
      options.style = 'currency';
      options.currency = this.currency();
    }
    const minF = this.minFractionDigits();
    const maxF = this.maxFractionDigits();
    if (minF != null) options.minimumFractionDigits = minF;
    if (maxF != null) options.maximumFractionDigits = maxF;
    return new Intl.NumberFormat(this.locale(), options).format(n);
  }

  /** Representación editable: sin agrupación ni símbolo, con el decimal del locale. */
  private toRawString(n: number): string {
    return String(n).replace('.', this.separators().decimal);
  }

  private parse(text: string): number | null {
    if (!text) return null;
    const { decimal, group } = this.separators();
    let cleaned = text.trim();
    // Elimina todo lo que no sea dígito, signo o separadores conocidos.
    cleaned = cleaned
      .split(group).join('')
      .split(decimal).join('.')
      .replace(/[^0-9.\-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  }

  private clamp(n: number): number {
    const min = this.min();
    const max = this.max();
    let r = n;
    if (min != null && r < min) r = min;
    if (max != null && r > max) r = max;
    return r;
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
