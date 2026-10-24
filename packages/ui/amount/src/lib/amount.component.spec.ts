import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbAmount, type CbAmountConversion } from './amount.component';
import { cbAmountInWords, esInteger } from './amount-words';

afterEach(() => document.body.replaceChildren());

describe('importe en letras', () => {
  it('enteros en español con apócope, cien/ciento, mil, millones y billones', () => {
    expect([0, 1, 15, 16, 21, 30, 31, 100, 101, 115, 200, 555, 999].map((n) => esInteger(n))).toEqual([
      'cero', 'uno', 'quince', 'dieciséis', 'veintiuno', 'treinta', 'treinta y uno', 'cien', 'ciento uno', 'ciento quince', 'doscientos', 'quinientos cincuenta y cinco', 'novecientos noventa y nueve',
    ]);
    expect(esInteger(1000)).toBe('mil');
    expect(esInteger(21000)).toBe('veintiún mil');
    expect(esInteger(1001001)).toBe('un millón mil uno');
    expect(esInteger(2500000000)).toBe('dos mil quinientos millones');
    expect(esInteger(1e12)).toBe('un billón');
  });

  it('cheques en pesos, texto, otras monedas e inglés', () => {
    expect(cbAmountInWords(1250000.5)).toBe('UN MILLÓN DOSCIENTOS CINCUENTA MIL PESOS CON 50/100 M/CTE');
    expect(cbAmountInWords(3000000)).toBe('TRES MILLONES DE PESOS M/CTE');
    expect(cbAmountInWords(1)).toBe('UN PESO M/CTE');
    expect(cbAmountInWords(21, { style: 'text' })).toBe('veintiún pesos');
    expect(cbAmountInWords(301.01, { currency: 'USD', style: 'text' })).toBe('trescientos un dólares con un centavo');
    expect(cbAmountInWords(201, { currency: 'GBP', style: 'text' })).toBe('doscientas una libras');
    expect(cbAmountInWords(1234.56, { language: 'en', currency: 'USD', style: 'text' })).toBe('one thousand two hundred thirty-four dollars and fifty-six cents');
    expect(cbAmountInWords(-40, { style: 'text' })).toBe('menos cuarenta pesos');
  });
});

@Component({
  imports: [CbAmount],
  template: `<cb-amount [value]="value()" [words]="true" [convert]="convert" negative="parens" />`,
})
class HostComponent {
  value = signal<number | null>(1250000.5);
  convert: CbAmountConversion = { currency: 'USD', rate: 4000, divide: true, label: 'TRM' };
}

describe('CbAmount', () => {
  it('muestra el importe, su equivalente y las letras; los negativos en rojo y entre paréntesis', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ numberLocale: 'es-CO', currency: 'COP' })] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = (s: string) => el.querySelector(s)!.textContent!.replace(/\s/g, ' ').trim();
    expect(text('.cb-amount__value')).toBe('$ 1.250.000,50');
    expect(text('.cb-amount__converted')).toBe('≈ US$ 312,50 (TRM 4.000,00)');
    expect(text('.cb-amount__words')).toBe('UN MILLÓN DOSCIENTOS CINCUENTA MIL PESOS CON 50/100 M/CTE');
    fixture.componentInstance.value.set(-5000);
    fixture.detectChanges();
    expect(text('.cb-amount__value')).toBe('($ 5.000,00)');
    expect(el.querySelector('cb-amount')!.classList).toContain('cb-amount--negative');
  });
});
