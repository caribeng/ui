import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbDataGrid } from './datagrid.component';
import { fromTsv, parseCell, toTsv, validateCell, type CbDataGridCellChange, type CbDataGridColumn, type ValidationTexts } from './datagrid-model';

interface Producto {
  id: number;
  nombre: string | null;
  precio: number | null;
  categoria: string | null;
  alta: string | null;
  activo: boolean;
}

const TEXTS: ValidationTexts = { required: 'Obligatorio.', min: 'El mínimo es {0}.', max: 'El máximo es {0}.', number: 'No es un número.', date: 'Fecha mal.', option: 'Opción mal.' };

const COLUMNS: CbDataGridColumn<Producto>[] = [
  { field: 'nombre', header: 'Nombre', required: true },
  { field: 'precio', header: 'Precio', type: 'number', min: 0, decimals: 2 },
  { field: 'categoria', header: 'Categoría', type: 'select', options: [{ label: 'Hogar', value: 'hogar' }, { label: 'Oficina', value: 'oficina' }] },
  { field: 'alta', header: 'Alta', type: 'date' },
  { field: 'activo', header: 'Activo', type: 'checkbox' },
];

const ROWS: Producto[] = [
  { id: 1, nombre: 'Silla', precio: 120, categoria: 'oficina', alta: '2030-01-10', activo: true },
  { id: 2, nombre: 'Lámpara', precio: 35.5, categoria: 'hogar', alta: '2030-02-01', activo: false },
  { id: 3, nombre: 'Mesa', precio: 300, categoria: 'hogar', alta: null, activo: true },
];

afterEach(() => document.body.replaceChildren());

describe('modelo del Data Grid', () => {
  it('interpreta números con coma o punto, fechas, opciones y casillas', () => {
    const num = COLUMNS[1] as CbDataGridColumn<object>;
    expect(parseCell(num, '1.234,5', TEXTS).value).toBe(1234.5);
    expect(parseCell(num, '1,234.5', TEXTS).value).toBe(1234.5);
    expect(parseCell(num, '12,5', TEXTS).value).toBe(12.5);
    expect(parseCell(num, 'abc', TEXTS).error).toBe('No es un número.');
    expect(parseCell(COLUMNS[3] as CbDataGridColumn<object>, '05/03/2030', TEXTS).value).toBe('2030-03-05');
    expect(parseCell(COLUMNS[3] as CbDataGridColumn<object>, '31/02/2030', TEXTS).error).toBe('Fecha mal.');
    expect(parseCell(COLUMNS[2] as CbDataGridColumn<object>, 'oficina', TEXTS).value).toBe('oficina');
    expect(parseCell(COLUMNS[2] as CbDataGridColumn<object>, 'HOGAR', TEXTS).value).toBe('hogar');
    expect(parseCell(COLUMNS[4] as CbDataGridColumn<object>, 'Sí', TEXTS).value).toBe(true);
  });

  it('valida obligatorio, límites y la validación propia', () => {
    const col = { field: 'x', header: 'X', type: 'number', min: 0, max: 10, validate: (v: unknown) => (v === 7 ? 'El 7 no.' : null) } as CbDataGridColumn<object>;
    expect(validateCell(COLUMNS[0] as CbDataGridColumn<object>, '', {}, TEXTS)).toBe('Obligatorio.');
    expect(validateCell(col, -1, {}, TEXTS)).toBe('El mínimo es 0.');
    expect(validateCell(col, 11, {}, TEXTS)).toBe('El máximo es 10.');
    expect(validateCell(col, 7, {}, TEXTS)).toBe('El 7 no.');
    expect(validateCell(col, 5, {}, TEXTS)).toBeNull();
  });

  it('TSV de ida y vuelta con tabuladores, saltos y comillas', () => {
    const m = [['a', 'b\tc'], ['d "e"', 'f\ng']];
    expect(fromTsv(toTsv(m))).toEqual(m);
    expect(fromTsv('1\t2\r\n3\t4\r\n')).toEqual([['1', '2'], ['3', '4']]);
  });
});

@Component({
  imports: [CbDataGrid],
  template: `<cb-data-grid [(rows)]="rows" [columns]="columns" [editable]="editable()" (cellChange)="changes.push($event)" />`,
})
class HostComponent {
  readonly grid = viewChild.required(CbDataGrid);
  rows = signal<readonly Producto[]>(ROWS);
  columns = COLUMNS;
  editable = signal(true);
  changes: CbDataGridCellChange<Producto>[] = [];
}

async function setup(editable = true) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.editable.set(editable);
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const host = fixture.componentInstance;
  const cell = (r: number, c: number) => el.querySelectorAll<HTMLElement>('tbody tr')[r].querySelectorAll<HTMLElement>('td')[c];
  const active = () => el.querySelector<HTMLElement>('td[tabindex="0"]')!;
  const key = async (k: string, init: KeyboardEventInit = {}) => {
    const target = (document.activeElement as HTMLElement | null)?.closest('cb-data-grid') ? (document.activeElement as HTMLElement) : active();
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const click = async (target: HTMLElement, init: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, ...init }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await settle();
  };
  const editor = () => el.querySelector<HTMLInputElement>('.cb-dg__editor')!;
  const type = async (text: string) => {
    editor().value = text;
    editor().dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  const clipboard = async (kind: 'copy' | 'cut' | 'paste', text = '') => {
    // jsdom no tiene DataTransfer: un portapapeles mínimo basta.
    let stored = text;
    const data = { getData: () => stored, setData: (_: string, value: string) => (stored = value) };
    const event = new Event(kind, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: data });
    active().dispatchEvent(event);
    await settle();
    return stored;
  };
  return { fixture, el, settle, host, cell, active, key, click, editor, type, clipboard };
}

describe('CbDataGrid', () => {
  it('pinta las celdas con su formato y la tabla con semántica de grid', async () => {
    const { el, cell } = await setup();
    expect(el.querySelector('table')!.getAttribute('role')).toBe('grid');
    expect(el.querySelectorAll('thead th[scope="col"]').length).toBe(6);
    expect(cell(1, 1).textContent!.trim()).toBe('35,50');
    expect(cell(0, 2).textContent!.trim()).toBe('Oficina');
    expect(cell(0, 4).textContent!.trim()).toBe('Sí');
    expect(cell(0, 0).getAttribute('tabindex')).toBe('0');
  });

  it('se mueve con las flechas, edita con Enter y confirma bajando a la fila siguiente', async () => {
    const { key, active, editor, type, host, changes } = await setup().then((s) => ({ ...s, changes: s.host.changes }));
    await key('ArrowRight');
    expect(active().getAttribute('aria-colindex')).toBe('3');
    await key('Enter');
    expect(editor().value).toBe('120');
    await type('99,9');
    await key('Enter');
    expect(host.rows()[0].precio).toBe(99.9);
    expect(changes[0]).toMatchObject({ field: 'precio', value: 99.9, previous: 120 });
    expect(active().closest('tr')!.getAttribute('aria-rowindex')).toBe('3');
    expect(active().classList).not.toContain('cb-dg__cell--dirty');
    expect(document.querySelector('.cb-dg__dirty')!.textContent).toContain('1 celdas cambiadas');
  });

  it('escribir reemplaza el valor; un número mal escrito no se confirma y Escape cancela', async () => {
    const { key, editor, type, host, el } = await setup();
    await key('ArrowRight');
    await key('x');
    expect(editor().value).toBe('x');
    await key('Enter');
    expect(el.querySelector('.cb-dg__editor-error')!.textContent).toBe('No es un número.');
    await key('Escape');
    expect(el.querySelector('.cb-dg__editor')).toBeNull();
    expect(host.rows()[0].precio).toBe(120);
  });

  it('marca los errores de validación y los cuenta en la barra', async () => {
    const { key, host, el, cell } = await setup();
    await key('Delete');
    expect(host.rows()[0].nombre).toBeNull();
    expect(cell(0, 0).getAttribute('aria-invalid')).toBe('true');
    expect(cell(0, 0).textContent).toContain('Obligatorio.');
    expect(el.querySelector('.cb-dg__errors')!.textContent).toContain('1 error');
    expect(host.grid().isValid()).toBe(false);
  });

  it('selecciona con Mayús + flechas, copia en TSV y pega un bloque', async () => {
    const { key, clipboard, host, el } = await setup();
    await key('ArrowDown', { shiftKey: true });
    await key('ArrowRight', { shiftKey: true });
    expect(el.querySelectorAll('td[aria-selected="true"]').length).toBe(4);
    expect(await clipboard('copy')).toBe('Silla\t120\nLámpara\t35.5');
    await key('ArrowDown');
    await key('ArrowDown');
    await key('ArrowLeft');
    await clipboard('paste', 'Sofá\t450\nBanco\tabc');
    expect(host.rows().length).toBe(4);
    expect(host.rows()[2]).toMatchObject({ nombre: 'Sofá', precio: 450 });
    expect(host.rows()[3]).toMatchObject({ nombre: 'Banco', precio: 'abc' });
    expect(host.grid().errors()).toEqual([{ key: host.rows()[3].id, field: 'precio', message: 'No es un número.' }]);
  });

  it('un único valor pegado rellena todo el rango; Ctrl + D rellena hacia abajo', async () => {
    const { key, clipboard, host } = await setup();
    await key('ArrowRight');
    await key('ArrowRight');
    await key('ArrowDown', { shiftKey: true });
    await key('ArrowDown', { shiftKey: true });
    await clipboard('paste', 'Oficina');
    expect(host.rows().map((r) => r.categoria)).toEqual(['oficina', 'oficina', 'oficina']);
    await key('ArrowLeft');
    await key('ArrowUp', { ctrlKey: true });
    await key('ArrowDown', { shiftKey: true });
    await key('d', { ctrlKey: true });
    expect(host.rows()[1].precio).toBe(120);
  });

  it('deshace y rehace, añade y elimina filas', async () => {
    const { key, host, el, settle } = await setup();
    await key('Delete');
    await key('z', { ctrlKey: true });
    expect(host.rows()[0].nombre).toBe('Silla');
    await key('y', { ctrlKey: true });
    expect(host.rows()[0].nombre).toBeNull();
    const [add, del] = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-dg__btn'));
    add.click();
    await settle();
    expect(host.rows().length).toBe(4);
    expect(host.grid().getChanges().added.length).toBe(1);
    del.click();
    await settle();
    expect(host.rows().length).toBe(3);
    await key('ArrowUp', { ctrlKey: true });
    await key('ArrowDown', { shiftKey: true });
    del.click();
    await settle();
    expect(host.rows().map((r) => r.id)).toEqual([3]);
    expect(host.grid().getChanges().removed.map((r) => (r as Producto).id)).toEqual([1, 2]);
  });

  it('las casillas cambian con Espacio y ordena al pulsar la cabecera', async () => {
    const { key, host, el, settle, cell } = await setup();
    await key('End');
    await key(' ');
    expect(host.rows()[0].activo).toBe(false);
    const sort = el.querySelectorAll<HTMLButtonElement>('.cb-dg__sort')[1];
    sort.click();
    await settle();
    expect(el.querySelectorAll('thead th')[2].getAttribute('aria-sort')).toBe('ascending');
    expect(cell(0, 0).textContent!.trim()).toBe('Lámpara');
    sort.click();
    await settle();
    expect(cell(0, 0).textContent!.trim()).toBe('Mesa');
  });

  it('con el ratón: clic activa, Mayús + clic selecciona un rango y doble clic edita', async () => {
    const { click, cell, el, settle, editor } = await setup();
    await click(cell(1, 0));
    await click(cell(2, 1), { shiftKey: true });
    expect(el.querySelectorAll('td[aria-selected="true"]').length).toBe(4);
    cell(2, 0).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await settle();
    expect(editor().value).toBe('Mesa');
  });

  it('sin edición se navega y se copia, pero no cambia nada', async () => {
    const { key, host, el, clipboard } = await setup(false);
    await key('Delete');
    await key('a');
    await clipboard('paste', 'Nada');
    expect(host.rows()).toBe(ROWS);
    expect(el.querySelector('.cb-dg__btn')).toBeNull();
    expect(await clipboard('copy')).toBe('Silla');
  });
});

@Component({
  imports: [CbDataGrid],
  template: `<cb-data-grid [(rows)]="rows" [columns]="columns" currency="COP" negativeStyle="parens" />`,
})
class TotalsHostComponent {
  rows = signal<readonly { id: number; cuenta: string; debito: number | null; credito: number | null }[]>([
    { id: 1, cuenta: '1105', debito: 150000, credito: null },
    { id: 2, cuenta: '4135', debito: null, credito: 150000.5 },
    { id: 3, cuenta: '5195', debito: -20, credito: null },
  ]);
  columns: CbDataGridColumn<{ id: number; cuenta: string; debito: number | null; credito: number | null }>[] = [
    { field: 'cuenta', header: 'Cuenta' },
    { field: 'debito', header: 'Débito', type: 'number', currency: true, summary: 'sum' },
    { field: 'credito', header: 'Crédito', type: 'number', currency: true, summary: 'sum' },
  ];
}

describe('CbDataGrid: importes y totales', () => {
  it('formatea la moneda, marca negativos y suma en el pie (y recalcula al editar)', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ locale: 'es', numberLocale: 'es-CO' })] });
    const fixture = TestBed.createComponent(TotalsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const text = (nodes: Iterable<Element>) => Array.from(nodes).map((n) => n.textContent!.replace(/\s+/g, ' ').trim());
    const cell = el.querySelectorAll('tbody tr')[2].querySelectorAll('td')[1];
    expect(cell.textContent!.trim().replace(/\s/g, ' ')).toBe('($ 20,00)');
    expect(cell.classList).toContain('cb-dg__cell--negative');
    expect(text(el.querySelector('tfoot tr')!.children)).toEqual(['', 'Total', '$ 149.980,00', '$ 150.000,50']);
    fixture.componentInstance.rows.update((rows) => rows.map((r) => (r.id === 3 ? { ...r, debito: 20 } : r)));
    fixture.detectChanges();
    expect(text(el.querySelector('tfoot tr')!.children)[2]).toBe('$ 150.020,00');
  });
});

interface Linea {
  id: number;
  cuenta: string | null;
  debito: number | null;
  credito: number | null;
}

@Component({
  imports: [CbDataGrid],
  template: `<cb-data-grid [(rows)]="rows" [columns]="columns" />`,
})
class LookupHostComponent {
  rows = signal<readonly Linea[]>([{ id: 1, cuenta: null, debito: null, credito: 5000 }]);
  columns: CbDataGridColumn<Linea>[] = [
    {
      field: 'cuenta',
      header: 'Cuenta',
      type: 'autocomplete',
      options: [
        { label: '11 Disponible', value: '11', disabled: true },
        { label: '110505 Caja general', value: '110505', description: 'Activo › Disponible › Caja' },
        { label: '111005 Bancos nacionales', value: '111005', description: 'Activo › Disponible › Bancos' },
        { label: '413505 Ventas de mercancía', value: '413505' },
      ],
    },
    { field: 'debito', header: 'Débito', type: 'number', onEdit: (v) => (v ? { credito: null } : null) },
    { field: 'credito', header: 'Crédito', type: 'number', onEdit: (v) => (v ? { debito: null } : null) },
  ];
}

describe('CbDataGrid: autocomplete y onEdit', () => {
  it('busca por código o nombre (sin tildes), salta las deshabilitadas y elige con Enter', async () => {
    const fixture = TestBed.createComponent(LookupHostComponent);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const cell = el.querySelector<HTMLElement>('td')!;
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true, cancelable: true }));
    await settle();
    const input = el.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    input.value = 'bancos';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    const options = () => Array.from(document.querySelectorAll('.cb-dg__option')).map((o) => o.querySelector('.cb-dg__option-label')?.textContent);
    expect(options()).toEqual(['111005 Bancos nacionales']);
    input.value = '11';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(options()).toEqual(['11 Disponible', '110505 Caja general', '111005 Bancos nacionales']);
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await settle();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await settle();
    expect(fixture.componentInstance.rows()[0].cuenta).toBe('111005');
    expect(cell.textContent).toContain('111005 Bancos nacionales');
  });

  it('pegar un código encuentra la opción y onEdit limpia el campo contrario en el mismo paso', async () => {
    const fixture = TestBed.createComponent(LookupHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const paste = (target: HTMLElement, text: string) => {
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
      target.dispatchEvent(event);
    };
    paste(el.querySelector<HTMLElement>('td')!, '413505\t7000');
    fixture.detectChanges();
    expect(fixture.componentInstance.rows()[0]).toMatchObject({ cuenta: '413505', debito: 7000, credito: null });
  });
});
