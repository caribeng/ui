import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbPivot } from './pivot.component';
import { columnKeys, rowTree, type CbPivotField } from './pivot-model';

const DATA = [
  { cuenta: '5135', centro: '100', mes: '2026-09', valor: 300 },
  { cuenta: '5135', centro: '200', mes: '2026-09', valor: 200 },
  { cuenta: '5135', centro: '100', mes: '2026-10', valor: 500 },
  { cuenta: '5105', centro: '100', mes: '2026-10', valor: 1000 },
  { cuenta: '5105', centro: '200', mes: '2026-10', valor: -50 },
];
const FIELDS: CbPivotField[] = [
  { key: 'cuenta', label: 'Cuenta', format: (v) => ({ '5105': '5105 Personal', '5135': '5135 Servicios' })[String(v)] ?? String(v) },
  { key: 'centro', label: 'Centro de costo' },
  { key: 'mes', label: 'Mes' },
];

afterEach(() => document.body.replaceChildren());

describe('modelo de la tabla dinámica', () => {
  it('claves de columna ordenadas y árbol de filas anidado', () => {
    expect(columnKeys(DATA, ['mes'])).toEqual(['2026-09', '2026-10']);
    const tree = rowTree(DATA, ['cuenta', 'centro'], (_, v) => v);
    expect(tree.map((n) => [n.label, n.records.length, n.children.map((c) => c.label)])).toEqual([
      ['5105', 2, ['100', '200']],
      ['5135', 3, ['100', '200']],
    ]);
  });
});

@Component({
  imports: [CbPivot],
  template: `<cb-pivot [data]="data" [fields]="fields" [(rows)]="rows" [(columns)]="columns" [values]="[{ field: 'valor' }]" configurable ariaLabel="Gastos" />`,
})
class HostComponent {
  data = DATA;
  fields = FIELDS;
  rows = signal<readonly string[]>(['cuenta', 'centro']);
  columns = signal<readonly string[]>(['mes']);
}

describe('CbPivot', () => {
  it('cruza filas y columnas con subtotales, totales y filas que se contraen', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ numberLocale: 'es-CO', currency: 'COP' })] });
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = (n: Element) => n.textContent!.replace(/\s+/g, ' ').trim();
    const body = () => Array.from(el.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.children).map(text));
    expect(Array.from(el.querySelectorAll('thead th')).map(text)).toEqual(['Cuenta › Centro de costo', '2026-09', '2026-10', 'Total']);
    expect(body()).toEqual([
      ['5105 Personal', '', '$ 950,00', '$ 950,00'],
      ['100', '', '$ 1.000,00', '$ 1.000,00'],
      ['200', '', '-$ 50,00', '-$ 50,00'],
      ['5135 Servicios', '$ 500,00', '$ 500,00', '$ 1.000,00'],
      ['100', '$ 300,00', '$ 500,00', '$ 800,00'],
      ['200', '$ 200,00', '', '$ 200,00'],
    ]);
    expect(Array.from(el.querySelectorAll('tfoot td')).map(text)).toEqual(['$ 500,00', '$ 1.450,00', '$ 1.950,00']);
    el.querySelector<HTMLButtonElement>('.cb-pv__toggle')!.click();
    fixture.detectChanges();
    expect(body().length).toBe(4);
    expect(el.querySelector('.cb-pv__toggle')!.getAttribute('aria-expanded')).toBe('false');
    const pivot = fixture.debugElement.children[0].componentInstance as CbPivot;
    const sheet = pivot.toExcelSheet();
    expect(sheet.totals).toEqual(['Total', 500, 1450, 1950]);
    expect((sheet.rows[1] as { level: number }).level).toBe(1);
  });
});
