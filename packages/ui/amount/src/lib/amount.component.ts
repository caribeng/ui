import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input } from '@angular/core';
import { CB_CONFIG, cbFormatAmount, injectCbTranslation, type CbNegativeStyle } from '@caribeng/ui';
import { cbAmountInWords, type CbWordsStyle } from './amount-words';

/** Conversión a otra moneda: el importe se multiplica por `rate` (o se divide, con `divide`). */
export interface CbAmountConversion {
  readonly currency: string;
  /** Tasa de cambio (p. ej. la TRM: pesos por dólar). */
  readonly rate: number;
  /** Divide en vez de multiplicar (de pesos a dólares con la TRM). */
  readonly divide?: boolean;
  /** Texto de la tasa («TRM»). */
  readonly label?: string;
}

/**
 * Importe de CaribeNG: muestra un valor con su moneda, los negativos en rojo (con
 * signo o entre paréntesis), su equivalente en otra moneda y, si se pide, en letras.
 *
 * @example
 * ```html
 * <cb-amount [value]="1250000" currency="COP" words />
 * <cb-amount [value]="1250000" currency="COP" [convert]="{ currency: 'USD', rate: 3950, divide: true, label: 'TRM' }" />
 * ```
 */
@Component({
  selector: 'cb-amount',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-amount',
    '[class.cb-amount--negative]': 'isNegative()',
    '[class.cb-amount--block]': 'words() || !!convert()',
    '[class]': "'cb-amount--' + size()",
  },
  template: `
    <span class="cb-amount__value">{{ text() }}</span>
    @if (showCode() && code()) {
      <span class="cb-amount__code">{{ code() }}</span>
    }
    @if (converted(); as c) {
      <span class="cb-amount__converted">≈ {{ c }}</span>
    }
    @if (words()) {
      <span class="cb-amount__words">{{ inWords() }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0 0.35rem;
        font-variant-numeric: tabular-nums;
      }
      :host(.cb-amount--block) {
        display: inline-grid;
        grid-template-columns: auto auto;
        justify-content: start;
      }
      :host(.cb-amount--negative) .cb-amount__value {
        color: var(--cb-color-danger-text, #dc2626);
      }
      :host(.cb-amount--sm) {
        font-size: var(--cb-text-sm, 0.875rem);
      }
      :host(.cb-amount--lg) .cb-amount__value {
        font-size: var(--cb-text-xl, 1.25rem);
        font-weight: var(--cb-font-weight-semibold, 600);
      }
      :host(.cb-amount--xl) .cb-amount__value {
        font-size: var(--cb-text-3xl, 1.875rem);
        font-weight: var(--cb-font-weight-bold, 700);
        letter-spacing: -0.01em;
      }
      .cb-amount__code {
        color: var(--cb-color-text-muted);
        font-size: 0.8em;
      }
      .cb-amount__converted,
      .cb-amount__words {
        grid-column: 1 / -1;
        color: var(--cb-color-text-muted);
        font-size: var(--cb-text-sm, 0.875rem);
      }
      .cb-amount__words {
        font-variant-numeric: normal;
        letter-spacing: 0.01em;
      }
    `,
  ],
})
export class CbAmount {
  private readonly config = inject(CB_CONFIG);
  private readonly t = injectCbTranslation();

  readonly value = input<number | null>(null);
  /** Código de moneda (si no, el de `provideCaribeNG({ currency })`; `''` sin símbolo). */
  readonly currency = input<string | undefined>(undefined);
  readonly decimals = input<number | undefined>(undefined);
  readonly negative = input<CbNegativeStyle | undefined>(undefined);
  /** Muestra el código de la moneda tras el importe (`COP`). */
  readonly showCode = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Muestra el importe en letras debajo. */
  readonly words = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Estilo de las letras: `check` (mayúsculas, 50/100, M/CTE) o `text`. */
  readonly wordsStyle = input<CbWordsStyle>('check');
  /** Equivalente en otra moneda. */
  readonly convert = input<CbAmountConversion | null>(null);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  protected readonly code = computed(() => {
    const c = this.currency();
    return c === undefined ? (this.config.currency ?? '') : c;
  });
  private readonly locale = computed(() => this.config.numberLocale ?? this.t().intlLocale);
  protected readonly isNegative = computed(() => (this.value() ?? 0) < 0);

  protected readonly text = computed(() =>
    cbFormatAmount(this.value(), this.locale(), { currency: this.code() || null, decimals: this.decimals(), negative: this.negative() ?? this.config.negativeStyle ?? 'minus' }),
  );

  protected readonly converted = computed(() => {
    const c = this.convert();
    const v = this.value();
    if (!c || v === null || !c.rate) return null;
    const amount = c.divide ? v / c.rate : v * c.rate;
    const target = cbFormatAmount(amount, this.locale(), { currency: c.currency, currencyDisplay: 'symbol' });
    const rate = cbFormatAmount(c.rate, this.locale(), { decimals: 2 });
    return c.label ? `${target} (${c.label} ${rate})` : target;
  });

  protected readonly inWords = computed(() => {
    const v = this.value();
    if (v === null) return '';
    const language = this.t().intlLocale.startsWith('en') ? 'en' : 'es';
    return cbAmountInWords(v, { language, currency: this.code() || 'COP', style: this.wordsStyle() });
  });
}
