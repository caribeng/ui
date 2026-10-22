import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbTable, type CbTableColumn } from './table.component';

const ROWS = [
  { id: 1, cliente: { nombre: 'Zoe' }, total: 30 },
  { id: 2, cliente: { nombre: 'Ana' }, total: 10 },
  { id: 3, 'cliente.nombre': 'Clave con punto', cliente: { nombre: 'Luis' }, total: 20 },
];
const COLS: CbTableColumn[] = [
  { field: 'cliente.nombre', header: 'Cliente', sortable: true, filter: true },
  { field: 'total', header: 'Total' },
];

function setup() {
  TestBed.configureTestingModule({ imports: [CbTable] });
  const fixture = TestBed.createComponent(CbTable);
  fixture.componentRef.setInput('value', ROWS);
  fixture.componentRef.setInput('columns', COLS);
  fixture.detectChanges();
  const firstColumn = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')).map((tr) => tr.querySelector('td')?.textContent?.trim());
  return { fixture, firstColumn };
}

describe('CbTable: campos con ruta (cliente.nombre)', () => {
  it('muestra el valor anidado; una clave que contiene el punto tiene prioridad', () => {
    const { firstColumn } = setup();
    expect(firstColumn()).toEqual(['Zoe', 'Ana', 'Clave con punto']);
  });

  it('ordena y filtra por el valor anidado', () => {
    const { fixture, firstColumn } = setup();
    fixture.componentRef.setInput('value', ROWS.slice(0, 2));
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('th [aria-sort], th button')?.click();
    fixture.detectChanges();
    expect(firstColumn()).toEqual(['Ana', 'Zoe']);

    fixture.componentInstance.filterColumn('cliente.nombre', 'zo');
    fixture.detectChanges();
    expect(firstColumn()).toEqual(['Zoe']);
  });

  it('exporta el valor anidado a CSV', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance.toCSV()).toContain('Ana');
  });
});
