import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbDataTable } from './data-table.component';

describe('CbDataTable', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbDataTable] }).compileComponents();
    const fixture = TestBed.createComponent(CbDataTable);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza cabeceras con scope="col", filas y nombre accesible', () => {
    const fixture = TestBed.createComponent(CbDataTable);
    fixture.componentRef.setInput('columns', ['fecha', 'valor']);
    fixture.componentRef.setInput('rows', [
      { fecha: '20/10', valor: '$10.000' },
      { fecha: '21/10', valor: '$5.000' },
    ]);
    fixture.componentRef.setInput('ariaLabel', 'Movimientos');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('table')!.getAttribute('aria-label')).toBe('Movimientos');
    const ths = Array.from(el.querySelectorAll('th'));
    expect(ths.map((th) => th.textContent)).toEqual(['fecha', 'valor']);
    expect(ths.every((th) => th.getAttribute('scope') === 'col')).toBe(true);
    const cells = Array.from(el.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent));
    expect(cells).toEqual([['20/10', '$10.000'], ['21/10', '$5.000']]);
  });

  it('sin filas muestra el mensaje vacío ocupando todas las columnas', () => {
    const fixture = TestBed.createComponent(CbDataTable);
    fixture.componentRef.setInput('columns', ['a', 'b', 'c']);
    fixture.detectChanges();
    const empty = (fixture.nativeElement as HTMLElement).querySelector('.cb-data-table__empty')!;
    expect(empty.getAttribute('colspan')).toBe('3');
    expect(empty.textContent!.trim()).toBeTruthy();
    fixture.componentRef.setInput('emptyMessage', 'Aún no hay movimientos');
    fixture.detectChanges();
    expect(empty.textContent!.trim()).toBe('Aún no hay movimientos');
  });
});
