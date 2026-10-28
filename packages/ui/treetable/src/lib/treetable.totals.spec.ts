import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbTreeTable, type CbTreeTableColumn, type CbTreeTableNode } from './treetable.component';

const PUC: CbTreeTableNode[] = [
  {
    key: '11',
    data: { cuenta: '11 Disponible' },
    children: [
      { key: '1105', data: { cuenta: '1105 Caja', saldo: 1500000 } },
      {
        key: '1110',
        data: { cuenta: '1110 Bancos' },
        children: [
          { key: '111005', data: { cuenta: '111005 Nacionales', saldo: 8200000.25 } },
          { key: '111010', data: { cuenta: '111010 Extranjeros', saldo: -200000 } },
        ],
      },
    ],
  },
  { key: '13', data: { cuenta: '13 Deudores', saldo: 999 }, children: [{ key: '1305', data: { cuenta: '1305 Clientes', saldo: 4300000 } }] },
];

const COLUMNS: CbTreeTableColumn[] = [
  { field: 'cuenta', header: 'Cuenta' },
  { field: 'saldo', header: 'Saldo', type: 'currency', summary: 'sum' },
];

@Component({
  imports: [CbTreeTable],
  template: `<cb-treetable [value]="nodes" [columns]="columns" rollup currency="COP" negativeStyle="parens" ariaLabel="Plan de cuentas" />`,
})
class HostComponent {
  nodes = PUC;
  columns = COLUMNS;
}

afterEach(() => document.body.replaceChildren());

describe('CbTreeTable: totales jerárquicos', () => {
  it('las cuentas padre suman a sus auxiliares y el pie suma todas las hojas', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ locale: 'es', numberLocale: 'es-CO' })] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const tree = fixture.debugElement.children[0].componentInstance as CbTreeTable;
    tree.expandAll();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const rows = Array.from(el.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.replace(/\s+/g, ' ').trim()));
    expect(rows).toEqual([
      ['11 Disponible', '$ 9.500.000,25'],
      ['1105 Caja', '$ 1.500.000,00'],
      ['1110 Bancos', '$ 8.000.000,25'],
      ['111005 Nacionales', '$ 8.200.000,25'],
      ['111010 Extranjeros', '($ 200.000,00)'],
      ['13 Deudores', '$ 4.300.000,00'],
      ['1305 Clientes', '$ 4.300.000,00'],
    ]);
    expect(el.querySelector('tbody tr')!.classList).toContain('cb-treetable__row--parent');
    expect(el.querySelectorAll('tbody tr')[4].querySelectorAll('td')[1].classList).toContain('cb-is-negative');
    const foot = Array.from(el.querySelector('tfoot tr')!.children).map((c) => c.textContent!.replace(/\s+/g, ' ').trim());
    expect(foot).toEqual(['Total', '$ 13.800.000,25']);
  });

  it('toExcelSheet exporta todo el árbol con niveles, sangría y totales', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ locale: 'es', numberLocale: 'es-CO' })] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const tree = fixture.debugElement.children[0].componentInstance as CbTreeTable;
    const sheet = tree.toExcelSheet();
    const rows = sheet.rows as { cells: unknown[]; level?: number; bold?: boolean }[];
    expect(rows.map((r) => [r.cells[0], r.level, r.bold])).toEqual([
      ['11 Disponible', 0, true],
      ['1105 Caja', 1, false],
      ['1110 Bancos', 1, true],
      ['111005 Nacionales', 2, false],
      ['111010 Extranjeros', 2, false],
      ['13 Deudores', 0, true],
      ['1305 Clientes', 1, false],
    ]);
    expect(rows[0].cells[1]).toBe(9500000.25);
    expect(sheet.totals).toEqual(['Total', 13800000.25]);
    expect(sheet.name).toBe('Plan de cuentas');
  });
});

