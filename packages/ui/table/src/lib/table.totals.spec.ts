import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbTable, type CbTableColumn } from './table.component';

const MOVIMIENTOS = [
  { cuenta: '1105 Caja', tercero: 'Ana', debito: 150000, credito: 0, saldo: 150000 },
  { cuenta: '1105 Caja', tercero: 'Leo', debito: 0, credito: 40000.5, saldo: -40000.5 },
  { cuenta: '1110 Bancos', tercero: 'Banco', debito: 980000, credito: 120000, saldo: 860000 },
];

const COLUMNS: CbTableColumn[] = [
  { field: 'cuenta', header: 'Cuenta' },
  { field: 'tercero', header: 'Tercero', summary: 'count' },
  { field: 'debito', header: 'Débito', type: 'currency', summary: 'sum' },
  { field: 'credito', header: 'Crédito', type: 'currency', summary: 'sum' },
  { field: 'saldo', header: 'Saldo', type: 'currency', summary: 'sum', negative: 'parens' },
];

@Component({
  imports: [CbTable],
  template: `<cb-table [value]="rows" [columns]="columns" currency="COP" [groupRowsBy]="group()" [groupSubtotals]="true" [paginator]="paginator()" [rows]="2" />`,
})
class HostComponent {
  rows = MOVIMIENTOS;
  columns = COLUMNS;
  group = signal<string | null>(null);
  paginator = signal(false);
}

afterEach(() => document.body.replaceChildren());

async function setup(init?: (h: HostComponent) => void) {
  TestBed.configureTestingModule({ providers: [provideCaribeNG({ numberLocale: 'es-CO' })] });
  const fixture = TestBed.createComponent(HostComponent);
  init?.(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const text = (cells: NodeListOf<Element> | Element[]) => Array.from(cells).map((c) => c.textContent!.replace(/\s+/g, ' ').trim());
  return { fixture, el, text };
}

describe('CbTable: importes y totales', () => {
  it('formatea las columnas de moneda, alinea a la derecha y marca los negativos', async () => {
    const { el, text } = await setup();
    const row = el.querySelectorAll('tbody tr')[1];
    expect(text(row.querySelectorAll('td'))).toEqual(['1105 Caja', 'Leo', '$ 0,00', '$ 40.000,50', '($ 40.000,50)']);
    const saldo = row.querySelectorAll('td')[4] as HTMLElement;
    expect(saldo.classList).toContain('cb-is-negative');
    expect(saldo.style.textAlign).toBe('right');
  });

  it('el pie suma todas las filas filtradas (no solo la página) con la etiqueta Total', async () => {
    const { el, text } = await setup((h) => h.paginator.set(true));
    expect(el.querySelectorAll('tbody tr').length).toBe(2);
    const foot = el.querySelector('tfoot tr')!;
    expect(foot.querySelector('th')!.getAttribute('scope')).toBe('row');
    expect(text(foot.children as unknown as Element[])).toEqual(['Total', '3', '$ 1.130.000,00', '$ 160.000,50', '$ 969.999,50']);
  });

  it('con groupSubtotals añade el subtotal de cada grupo tras su última fila', async () => {
    const { el, text } = await setup((h) => h.group.set('cuenta'));
    const subtotals = el.querySelectorAll('.cb-table__subtotal');
    expect(subtotals.length).toBe(2);
    expect(text(subtotals[0].children as unknown as Element[])).toEqual(['Subtotal 1105 Caja', '2', '$ 150.000,00', '$ 40.000,50', '$ 109.999,50']);
    expect(subtotals[0].previousElementSibling!.textContent).toContain('Leo');
  });

  it('toExcelSheet exporta importes como números, subtotales y totales en negrita', async () => {
    const { fixture } = await setup((h) => h.group.set('cuenta'));
    const table = fixture.debugElement.children[0].componentInstance as CbTable;
    const sheet = table.toExcelSheet({ title: ['Libro auxiliar'] });
    expect(sheet.columns.map((c) => [c.type, c.symbol])).toEqual([['text', undefined], ['text', undefined], ['currency', '$'], ['currency', '$'], ['currency', '$']]);
    expect(sheet.columns[4].negative).toBe('parens');
    const rows = sheet.rows as { cells: unknown[]; bold?: boolean }[];
    expect(rows.map((r) => r.cells[0])).toEqual(['1105 Caja', '1105 Caja', 'Subtotal 1105 Caja', '1110 Bancos', 'Subtotal 1110 Bancos']);
    expect(rows[2]).toMatchObject({ bold: true, cells: ['Subtotal 1105 Caja', 2, 150000, 40000.5, 109999.5] });
    expect(sheet.totals).toEqual(['Total', 3, 1130000, 160000.5, 969999.5]);
    expect(sheet.title).toEqual(['Libro auxiliar']);
  });
});
