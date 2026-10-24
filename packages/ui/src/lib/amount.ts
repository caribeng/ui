import { inject } from '@angular/core';
import { CB_CONFIG } from './caribeng.config';
import { injectCbTranslation } from './locale.service';

/** Cómo se escriben los negativos: `-1.234,00` o `(1.234,00)` (estilo contable). */
export type CbNegativeStyle = 'minus' | 'parens';

/** Totales de una columna: suma, promedio, cuenta, mínimo o máximo. */
export type CbSummary = 'sum' | 'avg' | 'count' | 'min' | 'max';

/** Opciones de `cbFormatAmount()`. */
export interface CbAmountOptions {
  /** Código ISO 4217 (`COP`, `USD`…); `null` escribe solo el número. */
  readonly currency?: string | null;
  /** Decimales fijos (por defecto 2; 0 en monedas sin centavos como JPY o CLP). */
  readonly decimals?: number;
  readonly negative?: CbNegativeStyle;
  /** `symbol` ($), `narrowSymbol` ($ sin país) o `code` (COP). */
  readonly currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code';
}

const formatters = new Map<string, Intl.NumberFormat>();

/** Monedas sin decimales (ISO 4217); el resto se escribe con 2, igual en todos los navegadores. */
const ZERO_DECIMALS = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'UYI', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);

function formatter(locale: string, options: CbAmountOptions): Intl.NumberFormat {
  const key = `${locale}|${options.currency ?? ''}|${options.decimals ?? ''}|${options.currencyDisplay ?? ''}`;
  let f = formatters.get(key);
  if (!f) {
    const digits = options.decimals ?? (options.currency && ZERO_DECIMALS.has(options.currency.toUpperCase()) ? 0 : 2);
    f = new Intl.NumberFormat(locale, {
      style: options.currency ? 'currency' : 'decimal',
      currency: options.currency ?? undefined,
      currencyDisplay: options.currencyDisplay ?? 'narrowSymbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(key, f);
  }
  return f;
}

/** Número a partir de un valor (número o texto numérico); `null` si no lo es. */
export function cbToNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Importe con el formato del idioma: separadores, decimales, moneda y negativos
 * entre paréntesis si se pide (`(1.234,50)`). Un valor que no es número se
 * devuelve como texto (vacío si es `null`).
 *
 * ```ts
 * cbFormatAmount(-1234.5, 'es-CO', { currency: 'COP', negative: 'parens' }); // "($ 1.234,50)"
 * ```
 */
export function cbFormatAmount(value: unknown, locale: string, options: CbAmountOptions = {}): string {
  const n = cbToNumber(value);
  if (n === null) return value == null ? '' : String(value);
  const f = formatter(locale, options);
  if (options.negative === 'parens' && n < 0) return `(${f.format(-n)})`;
  // Evita "-0,00" al redondear un negativo muy pequeño.
  const text = f.format(n);
  return /^-0([.,]0+)?$/.test(text.replace(/[^\d.,-]/g, '')) ? f.format(0) : text;
}

/**
 * Total de una lista de valores (los que no son número se ignoran, salvo en
 * `count`). Las sumas se redondean para evitar errores de coma flotante
 * (`0.1 + 0.2` da `0.3`).
 */
export function cbSummarize(values: readonly unknown[], kind: CbSummary): number | null {
  if (kind === 'count') return values.filter((v) => v !== null && v !== undefined && v !== '').length;
  const nums = values.map(cbToNumber).filter((n): n is number => n !== null);
  if (!nums.length) return kind === 'sum' ? 0 : null;
  const round = (n: number) => Math.round(n * 1e8) / 1e8;
  switch (kind) {
    case 'sum':
      return round(nums.reduce((a, b) => a + b, 0));
    case 'avg':
      return round(nums.reduce((a, b) => a + b, 0) / nums.length);
    case 'min':
      return Math.min(...nums);
    case 'max':
      return Math.max(...nums);
  }
}

/**
 * Formateador de importes con la moneda y el estilo de negativos de
 * `provideCaribeNG({ currency, negativeStyle, numberLocale })` (o el idioma activo).
 * Debe llamarse en un contexto de inyección.
 */
export function injectCbAmount(): (value: unknown, options?: CbAmountOptions) => string {
  const config = inject(CB_CONFIG);
  const t = injectCbTranslation();
  return (value, options = {}) =>
    cbFormatAmount(value, config.numberLocale ?? t().intlLocale, {
      ...options,
      currency: options.currency === undefined ? (config.currency ?? null) : options.currency,
      negative: options.negative ?? config.negativeStyle ?? 'minus',
    });
}
