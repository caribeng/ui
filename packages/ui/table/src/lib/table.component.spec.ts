import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CbTable,
  CbTableCellDirective,
  CbTableRowExpansion,
  type CbTableColumn,
  type CbTableFilterState,
} from './table.component';

interface Row {
  id: number;
  nombre: string;
  ciudad: string;
  precio: number;
}

const COLS: CbTableColumn[] = [
  { field: 'nombre', header: 'Nombre', sortable: true },
  { field: 'precio', header: 'Precio', sortable: true, align: 'right' },
];

const DATA: Row[] = [
  { id: 1, nombre: 'Teclado', ciudad: 'Bogotá', precio: 120 },
  { id: 2, nombre: 'Mouse', ciudad: 'Medellín', precio: 60 },
  { id: 3, nombre: 'Monitor', ciudad: 'Cali', precio: 300 },
];

@Component({
  imports: [CbTable],
  template: `
    <cb-table
      [value]="data"
      [columns]="cols()"
      [paginator]="paginator()"
      [rows]="2"
      [selectionMode]="mode()"
      dataKey="id"
      ariaLabel="Productos"
      [(selection)]="selection"
      [(globalFilter)]="search"
      [globalFilterFields]="globalFields()"
      [resizableColumns]="resizable()"
      (filterChange)="filters = $event"
      (columnResize)="resized = $event"
    />
  `,
})
class HostComponent {
  data = DATA;
  cols = signal<CbTableColumn[]>(COLS);
  paginator = signal(false);
  mode = signal<'single' | 'multiple' | null>(null);
  selection = signal<unknown>(null);
  search = signal('');
  globalFields = signal<string[] | null>(null);
  resizable = signal(false);
  filters: CbTableFilterState | null = null;
  resized: { field: string; width: number } | null = null;
}

@Component({
  imports: [CbTable, CbTableCellDirective],
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

@Component({
  imports: [CbTable, CbTableRowExpansion],
  template: `
    <cb-table
      [value]="data"
      [columns]="cols"
      dataKey="id"
      [(expandedRowKeys)]="expanded"
      (rowExpand)="events.push('expand:' + $any($event).id)"
      (rowCollapse)="events.push('collapse:' + $any($event).id)"
    >
      <ng-template cbTableRowExpansion let-row let-index="index">
        <p class="detail">{{ index }} · {{ row.nombre }} en {{ row.ciudad }}</p>
      </ng-template>
    </cb-table>
  `,
})
class ExpansionHostComponent {
  data = DATA;
  cols = COLS;
  expanded = signal<readonly unknown[]>([]);
  events: string[] = [];
}

describe('CbTable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent, TemplateHostComponent, ExpansionHostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const headers = (): HTMLElement[] => Array.from(el.querySelectorAll('.cb-table__th'));
    const sortBtn = (i: number) => headers()[i].querySelector<HTMLButtonElement>('.cb-table__sort-btn')!;
    const rows = (): HTMLElement[] => Array.from(el.querySelectorAll('tbody .cb-table__row'));
    const firstCol = (): string[] => rows().map((r) => r.querySelectorAll('.cb-table__td')[0].textContent!.trim());
    const click = (node: HTMLElement) => {
      node.click();
      fixture.detectChanges();
    };
    const host = fixture.componentInstance;
    return { fixture, el, headers, sortBtn, rows, firstCol, click, host };
  }

  it('renderiza encabezados con scope="col", filas y nombre accesible', () => {
    const { el, headers, rows } = setup();
    expect(el.querySelector('table')!.getAttribute('aria-label')).toBe('Productos');
    expect(headers().map((h) => h.textContent!.trim())).toEqual(['Nombre', 'Precio']);
    expect(headers().every((h) => h.getAttribute('scope') === 'col')).toBe(true);
    expect(rows().length).toBe(3);
    el.remove();
  });

  it('renders a custom cell template with row, value and column context', () => {
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    const customCell = fixture.nativeElement.querySelector('.custom-cell') as HTMLElement;
    expect(customCell.textContent).toContain('Teclado · Teclado · Nombre');
  });

  describe('ordenación', () => {
    it('ordena con el botón del encabezado (asc/desc) y refleja aria-sort', () => {
      const { el, headers, sortBtn, firstCol, click } = setup();
      expect(headers()[0].getAttribute('aria-sort')).toBe('none');
      click(sortBtn(0));
      expect(firstCol()).toEqual(['Monitor', 'Mouse', 'Teclado']);
      expect(headers()[0].getAttribute('aria-sort')).toBe('ascending');
      click(sortBtn(0));
      expect(firstCol()).toEqual(['Teclado', 'Mouse', 'Monitor']);
      expect(headers()[0].getAttribute('aria-sort')).toBe('descending');
      el.remove();
    });

    it('el botón de ordenar es un botón nativo con nombre (accesible con teclado)', () => {
      const { el, sortBtn } = setup();
      expect(sortBtn(0).tagName).toBe('BUTTON');
      expect(sortBtn(0).getAttribute('aria-label')).toBe('Ordenar por Nombre');
      el.remove();
    });

    it('las columnas no ordenables no tienen botón ni aria-sort', () => {
      const { fixture, el, headers } = setup();
      fixture.componentInstance.cols.set([{ field: 'nombre', header: 'Nombre' }]);
      fixture.detectChanges();
      expect(headers()[0].querySelector('button')).toBeNull();
      expect(headers()[0].hasAttribute('aria-sort')).toBe(false);
      el.remove();
    });
  });

  it('con paginator muestra solo las filas de la página', () => {
    const { fixture, rows, el } = setup();
    fixture.componentInstance.paginator.set(true);
    fixture.detectChanges();
    expect(rows().length).toBe(2);
    expect(el.querySelector('cb-paginator')).toBeTruthy();
    el.remove();
  });

  describe('selección', () => {
    it('múltiple: clic en fila acumula y el checkbox de cabecera selecciona todo', () => {
      const { fixture, el, rows, click, host } = setup();
      host.mode.set('multiple');
      fixture.detectChanges();
      click(rows()[0]);
      click(rows()[2]);
      expect((host.selection() as Row[]).map((r) => r.id)).toEqual([1, 3]);

      const headerCheck = el.querySelector<HTMLElement>('thead .cb-table__check')!;
      expect(headerCheck.getAttribute('aria-checked')).toBe('mixed');
      click(headerCheck);
      expect((host.selection() as Row[]).length).toBe(3);
      expect(headerCheck.getAttribute('aria-checked')).toBe('true');
      expect(headerCheck.getAttribute('aria-label')).toBe('Seleccionar todas las filas');
      el.remove();
    });

    it('cada fila tiene un checkbox enfocable con nombre que se marca con Espacio', () => {
      const { fixture, el, host } = setup();
      host.mode.set('multiple');
      fixture.detectChanges();
      const checks = () => Array.from(el.querySelectorAll<HTMLElement>('tbody .cb-table__check'));
      expect(checks()[1].getAttribute('role')).toBe('checkbox');
      expect(checks()[1].getAttribute('tabindex')).toBe('0');
      expect(checks()[1].getAttribute('aria-label')).toBe('Seleccionar fila 2');
      checks()[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect((host.selection() as Row[]).map((r) => r.id)).toEqual([2]);
      expect(checks()[1].getAttribute('aria-checked')).toBe('true');
      el.remove();
    });

    it('simple: cada fila tiene un radio y elegir otra fila reemplaza la selección', () => {
      const { fixture, el, rows, click, host } = setup();
      host.mode.set('single');
      fixture.detectChanges();
      const radios = () => Array.from(el.querySelectorAll<HTMLElement>('tbody [role="radio"]'));
      expect(radios()).toHaveLength(3);
      click(rows()[0]);
      click(rows()[1]);
      expect((host.selection() as Row).id).toBe(2);
      expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
      el.remove();
    });
  });

  describe('filtros', () => {
    it('el filtro global busca en las columnas sin distinguir mayúsculas ni tildes', () => {
      const { fixture, el, firstCol, host } = setup();
      host.search.set('MONÍ');
      fixture.detectChanges();
      expect(firstCol()).toEqual(['Monitor']);
      host.search.set('');
      fixture.detectChanges();
      expect(firstCol()).toHaveLength(3);
      el.remove();
    });

    it('globalFilterFields limita los campos de búsqueda (aunque no sean columnas)', () => {
      const { fixture, el, firstCol, host } = setup();
      host.globalFields.set(['ciudad']);
      host.search.set('medellin');
      fixture.detectChanges();
      expect(firstCol()).toEqual(['Mouse']);
      host.search.set('mouse');
      fixture.detectChanges();
      expect(firstCol()).toEqual([]);
      expect(el.querySelector('.cb-table__empty')).not.toBeNull();
      el.remove();
    });

    it('filtro por columna con su modo de comparación, nombre accesible y filterChange', () => {
      const { fixture, el, firstCol, host } = setup();
      host.cols.set([
        { field: 'nombre', header: 'Nombre', filter: true, filterMatchMode: 'startsWith' },
        { field: 'precio', header: 'Precio', filter: true, filterMatchMode: 'equals' },
      ]);
      fixture.detectChanges();
      const inputs = () => Array.from(el.querySelectorAll<HTMLInputElement>('.cb-table__filter'));
      expect(inputs()[0].getAttribute('aria-label')).toBe('Filtrar por Nombre');
      const type = (i: number, v: string) => {
        inputs()[i].value = v;
        inputs()[i].dispatchEvent(new Event('input'));
        fixture.detectChanges();
      };
      type(0, 'mo');
      expect(firstCol()).toEqual(['Mouse', 'Monitor']);
      type(0, 'nitor');
      expect(firstCol()).toEqual([]);
      type(0, '');
      type(1, '60');
      expect(firstCol()).toEqual(['Mouse']);
      expect(host.filters).toEqual({ global: '', columns: { nombre: '', precio: '60' } });
      el.remove();
    });

    it('anuncia la cantidad de resultados mientras hay filtros y vuelve a la primera página', () => {
      const { fixture, el, host } = setup();
      host.paginator.set(true);
      fixture.detectChanges();
      expect(el.querySelector('[aria-live="polite"]')).toBeNull();
      host.search.set('o');
      fixture.detectChanges();
      expect(el.querySelector('[aria-live="polite"]')!.textContent).toBe('3 resultados');
      el.remove();
    });

    it('filterGlobal() y clearFilters() controlan los filtros por código', () => {
      const fixture = TestBed.createComponent(CbTable);
      fixture.componentRef.setInput('value', DATA);
      fixture.componentRef.setInput('columns', [{ field: 'nombre', header: 'Nombre', filter: true }]);
      fixture.detectChanges();
      const rowsCount = () => (fixture.nativeElement as HTMLElement).querySelectorAll('tbody .cb-table__row').length;
      fixture.componentInstance.filterGlobal('tecl');
      fixture.detectChanges();
      expect(rowsCount()).toBe(1);
      fixture.componentInstance.filterColumn('nombre', 'zzz');
      fixture.detectChanges();
      expect(rowsCount()).toBe(0);
      fixture.componentInstance.clearFilters();
      fixture.detectChanges();
      expect(rowsCount()).toBe(3);
    });
  });

  describe('columnas redimensionables', () => {
    it('cada encabezado tiene un separador con nombre que cambia el ancho con flechas', () => {
      const { fixture, el, headers, host } = setup();
      host.resizable.set(true);
      fixture.detectChanges();
      const resizer = headers()[0].querySelector<HTMLElement>('.cb-table__resizer')!;
      expect(resizer.getAttribute('role')).toBe('separator');
      expect(resizer.getAttribute('aria-label')).toBe('Redimensionar columna Nombre');
      expect(el.querySelector('table')!.classList).toContain('cb-table--resizable');

      resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(headers()[0].style.width).toBe('130px');
      expect(resizer.getAttribute('aria-valuenow')).toBe('130');
      expect(host.resized).toEqual({ field: 'nombre', width: 130 });

      resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(headers()[0].style.width).toBe('80px');
      el.remove();
    });

    it('arrastrar el separador cambia el ancho y no baja del mínimo', () => {
      const { fixture, el, headers, host } = setup();
      host.resizable.set(true);
      fixture.detectChanges();
      const resizer = headers()[1].querySelector<HTMLElement>('.cb-table__resizer')!;
      resizer.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, bubbles: true, cancelable: true }));
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: 160 }));
      fixture.detectChanges();
      expect(headers()[1].style.width).toBe('180px');
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: -500 }));
      document.dispatchEvent(new PointerEvent('pointerup', {}));
      fixture.detectChanges();
      expect(headers()[1].style.width).toBe('48px');
      expect(host.resized).toEqual({ field: 'precio', width: 48 });

      document.dispatchEvent(new PointerEvent('pointermove', { clientX: 400 }));
      fixture.detectChanges();
      expect(headers()[1].style.width).toBe('48px');
      el.remove();
    });

    it('sin resizableColumns no hay separadores', () => {
      const { el } = setup();
      expect(el.querySelector('.cb-table__resizer')).toBeNull();
      el.remove();
    });
  });

  describe('filas expandibles', () => {
    function setupExpansion() {
      const fixture = TestBed.createComponent(ExpansionHostComponent);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const toggles = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-table__expander'));
      const click = (b: HTMLElement) => {
        b.click();
        fixture.detectChanges();
      };
      return { fixture, el, toggles, click, host: fixture.componentInstance };
    }

    it('añade un botón por fila que muestra la plantilla de detalle', () => {
      const { el, toggles, click, host } = setupExpansion();
      expect(toggles()).toHaveLength(3);
      expect(toggles()[1].getAttribute('aria-expanded')).toBe('false');
      expect(toggles()[1].getAttribute('aria-label')).toBe('Detalle de la fila 2');
      click(toggles()[1]);
      const detail = el.querySelector('.cb-table__expansion')!;
      expect(detail.querySelector('.detail')!.textContent).toBe('1 · Mouse en Medellín');
      expect(toggles()[1].getAttribute('aria-expanded')).toBe('true');
      expect(toggles()[1].getAttribute('aria-controls')).toBe(detail.id);
      expect(detail.querySelector('td')!.getAttribute('colspan')).toBe('3');
      expect(host.expanded()).toEqual([2]);
      expect(host.events).toEqual(['expand:2']);
    });

    it('volver a pulsar contrae; [(expandedRowKeys)] expande desde fuera', () => {
      const { fixture, el, toggles, click, host } = setupExpansion();
      click(toggles()[0]);
      click(toggles()[0]);
      expect(el.querySelector('.cb-table__expansion')).toBeNull();
      expect(host.events).toEqual(['expand:1', 'collapse:1']);

      host.expanded.set([1, 3]);
      fixture.detectChanges();
      expect(el.querySelectorAll('.cb-table__expansion')).toHaveLength(2);
    });

    it('expandir no selecciona la fila', () => {
      const fixture = TestBed.createComponent(ExpansionHostComponent);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      el.querySelector<HTMLButtonElement>('.cb-table__expander')!.click();
      fixture.detectChanges();
      expect(el.querySelector('.cb-table__row.cb-is-selected')).toBeNull();
    });
  });
});
