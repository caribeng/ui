import { describe, expect, it } from 'vitest';
import { cbFormatAmount, cbSummarize, cbToNumber } from './amount';

const nb = (s: string) => s.replace(/\s/g, ' ');

describe('importes', () => {
  it('formatea con moneda, decimales y negativos con signo o entre paréntesis', () => {
    expect(nb(cbFormatAmount(1234.5, 'es-CO', { currency: 'COP' }))).toBe('$ 1.234,50');
    expect(nb(cbFormatAmount(-1234.5, 'es-CO', { currency: 'COP', negative: 'parens' }))).toBe('($ 1.234,50)');
    expect(cbFormatAmount(-1234.5, 'en-US', { currency: 'USD' })).toBe('-$1,234.50');
    expect(cbFormatAmount(1234.567, 'es', { decimals: 1 })).toBe('1234,6');
    expect(cbFormatAmount(12.3, 'en-US')).toBe('12.30');
    expect(cbFormatAmount(-0.001, 'en-US')).toBe('0.00');
    expect(cbFormatAmount(null, 'es')).toBe('');
    expect(cbFormatAmount('abc', 'es')).toBe('abc');
  });

  it('suma sin errores de coma flotante y calcula promedio, cuenta, mínimo y máximo', () => {
    expect(cbSummarize([0.1, 0.2], 'sum')).toBe(0.3);
    expect(cbSummarize([10, '20', null, 'x'], 'sum')).toBe(30);
    expect(cbSummarize([10, 20, 60], 'avg')).toBe(30);
    expect(cbSummarize([10, null, '', 0], 'count')).toBe(2);
    expect(cbSummarize([5, -3, 8], 'min')).toBe(-3);
    expect(cbSummarize([5, -3, 8], 'max')).toBe(8);
    expect(cbSummarize([], 'sum')).toBe(0);
    expect(cbSummarize([], 'avg')).toBeNull();
    expect(cbToNumber('12.5')).toBe(12.5);
    expect(cbToNumber('')).toBeNull();
  });
});
