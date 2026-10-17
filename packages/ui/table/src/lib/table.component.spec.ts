import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTableCellDirective, CbTableComponent, type CbTableColumn } from './table.component';

interface Row {
  id: number;
  nombre: string;
  precio: number;
}

const COLS: CbTableColumn[] = [
  { field: 'nombre', header: 'Nombre', sortable: true },
  { field: 'precio', header: 'Precio', sortable: true, align: 'right' },
];

const DATA: Row[] = [
  { id: 1, nombre: 'Teclado', precio: 120 },
  { id: 2, nombre: 'Mouse', precio: 60 },
  { id: 3, nombre: 'Monitor', precio: 300 },
];

@Component({
  imports: [CbTableComponent],
  template: `
    <cb-table
      [value]="data"
      [columns]="cols"
      [paginator]="paginator()"
      [rows]="2"
      [selectionMode]="mode()"
      dataKey="id"
      [(selection)]="selection"
    />
  `,
})
class HostComponent {
  data = DATA;
  cols = COLS;
  paginator = signal(false);
  mode = signal<'single' | 'multiple' | null>(null);
  selection = signal<unknown>(null);
}

@Component({
  imports: [CbTableComponent, CbTableCellDirective],
  template: `
    <cb-table [value]="data" [columns]="cols">
      <ng-template cbTableCell="nombre" let-row let-value="value" let-col="col">
        <span class="custom-cell">{{ row.nombre }} · {{ value }} · {{ col.header }}</span>
      </ng-template>
    </cb-table>
  `,
})
class TemplateHostComponent {
  data = DATA;
  cols = COLS;
}

describe('CbTableComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent, TemplateHostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const headers = (): HTMLElement[] => Array.from(el.querySelectorAll('.cb-table__th'));
    const rows = (): HTMLElement[] => Array.from(el.querySelectorAll('tbody .cb-table__row'));
    const firstCol = (): string[] =>
      rows().map((r) => r.querySelectorAll('.cb-table__td')[0].textContent!.trim());
    return { fixture, el, headers, rows, firstCol };
  }

  it('renderiza encabezados y filas', () => {
    const { headers, rows } = setup();
    expect(headers().map((h) => h.textContent!.trim())).toContain('Nombre');
    expect(rows().length).toBe(3);
  });

  it('renders a custom cell template with row, value and column context', () => {
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    const customCell = fixture.nativeElement.querySelector('.custom-cell') as HTMLElement;
    expect(customCell.textContent).toContain('Teclado · Teclado · Nombre');
  });

  it('ordena al hacer clic en un encabezado sortable (asc/desc)', () => {
    const { fixture, headers, firstCol } = setup();
    headers()[0].click(); // Nombre asc
    fixture.detectChanges();
    expect(firstCol()).toEqual(['Monitor', 'Mouse', 'Teclado']);
    headers()[0].click(); // Nombre desc
    fixture.detectChanges();
    expect(firstCol()).toEqual(['Teclado', 'Mouse', 'Monitor']);
  });

  it('con paginator muestra solo las filas de la página', () => {
    const { fixture, rows } = setup();
    fixture.componentInstance.paginator.set(true);
    fixture.detectChanges();
    expect(rows().length).toBe(2);
    expect(fixture.nativeElement.querySelector('cb-paginator')).toBeTruthy();
  });

  it('selección múltiple: clic en fila acumula y seleccionar-todo', () => {
    const { fixture, el, rows } = setup();
    fixture.componentInstance.mode.set('multiple');
    fixture.detectChanges();
    rows()[0].click();
    rows()[2].click();
    fixture.detectChanges();
    expect((fixture.componentInstance.selection() as Row[]).map((r) => r.id)).toEqual([1, 3]);

    const headerCheck = el.querySelector<HTMLElement>('thead .cb-table__check')!;
    headerCheck.click(); // seleccionar todo
    fixture.detectChanges();
    expect((fixture.componentInstance.selection() as Row[]).length).toBe(3);
  });
});
