import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbDocument, documentTotals, type CbDocumentLine } from './document.component';

const LINES: CbDocumentLine[] = [
  { code: 'P-01', description: 'Silla ergonómica', quantity: 2, unitPrice: 450000, tax: 0.19 },
  { code: 'P-02', description: 'Escritorio', quantity: 1, unitPrice: 1200000, discount: 0.1, tax: 0.19 },
  { code: 'S-01', description: 'Instalación', quantity: 1, unitPrice: 150000 },
];

afterEach(() => document.body.replaceChildren());

describe('totales del documento', () => {
  it('subtotal, descuentos, impuestos por tarifa, retenciones y total', () => {
    const t = documentTotals(LINES, [{ label: 'Retención en la fuente 2,5 %', amount: -48750 }]);
    expect(t).toMatchObject({ subtotal: 2250000, discount: 120000, net: 2130000, taxTotal: 376200, total: 2457450 });
    expect(t.taxes).toEqual([{ rate: 0.19, base: 1980000, amount: 376200 }]);
  });
});

@Component({
  imports: [CbDocument],
  template: `<cb-document title="Factura de venta" number="FV-1252" [date]="date" [issuer]="{ name: 'CaribeNG S.A.S.', taxId: '901.234.567-1' }" [party]="{ name: 'Ferretería Bolívar', taxId: '800.123.456-7' }" [lines]="lines" [adjustments]="[{ label: 'Retención', amount: -48750 }]" [signatures]="['Elaboró', 'Recibí conforme']" />`,
})
class HostComponent {
  date = new Date(2026, 9, 20);
  lines = LINES;
}

describe('CbDocument', () => {
  it('pinta cabecera, líneas, totales y el total en letras', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ numberLocale: 'es-CO', currency: 'COP' })] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = (n: Element) => n.textContent!.replace(/\s+/g, ' ').trim();
    expect(text(el.querySelector('.cb-doc__title')!)).toBe('Factura de venta');
    expect(Array.from(el.querySelectorAll('.cb-doc__lines thead th')).map(text)).toEqual(['Código', 'Descripción', 'Cant.', 'Valor unitario', 'Descuento', 'Impuesto', 'Valor']);
    expect(Array.from(el.querySelectorAll('.cb-doc__lines tbody tr')[1].children).map(text)).toEqual(['P-02', 'Escritorio', '1', '$ 1.200.000,00', '10%', '19%', '$ 1.080.000,00']);
    // En móvil cada celda muestra su encabezado (data-label) y la tabla conserva sus roles.
    expect(Array.from(el.querySelectorAll('.cb-doc__lines tbody tr')[1].children).map((td) => td.getAttribute('data-label'))).toEqual(['Código', null, 'Cant.', 'Valor unitario', 'Descuento', 'Impuesto', 'Valor']);
    expect(el.querySelector('.cb-doc__lines')!.getAttribute('role')).toBe('table');
    expect(Array.from(el.querySelector('.cb-doc__grand')!.children).map(text)).toEqual(['Total a pagar', '$ 2.457.450,00']);
    expect(text(el.querySelector('.cb-doc__words')!)).toBe('DOS MILLONES CUATROCIENTOS CINCUENTA Y SIETE MIL CUATROCIENTOS CINCUENTA PESOS M/CTE');
    expect(el.querySelectorAll('.cb-doc__sign').length).toBe(2);
  });
});
