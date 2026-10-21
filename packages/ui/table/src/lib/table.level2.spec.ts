import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CbTable, CbTableGroupHeader, type CbTableColumn, type CbTableLazyLoadEvent } from './table.component';

interface Mov {
  id: number;
  fecha: string;
  tipo: string;
  descripcion: string;
  valor: number;
}

const MOVS: Mov[] = [
  { id: 1, fecha: '2026-10-01', tipo: 'Ingreso', descripcion: 'Nómina', valor: 5000 },
  { id: 2, fecha: '2026-10-02', tipo: 'Gasto', descripcion: 'Mercado, "Éxito"', valor: -320 },
  { id: 3, fecha: '2026-10-03', tipo: 'Ingreso', descripcion: 'Intereses', valor: 12 },
  { id: 4, fecha: '2026-10-04', tipo: 'Gasto', descripcion: 'Arriendo', valor: -1800 },
];

const COLS: CbTableColumn[] = [
  { field: 'descripcion', header: 'Descripción', sortable: true, filter: true },
  { field: 'fecha', header: 'Fecha', frozen: true },
  { field: 'valor', header: 'Valor', sortable: true, align: 'right' },
  { field: 'acciones', header: 'Acciones', exportable: false },
];

@Component({
  imports: [CbTable, CbTableGroupHeader],
  template: `
    <cb-table
      [value]="rows()"
      [columns]="cols"
      dataKey="id"
      [paginator]="true"
      [rows]="2"
      [lazy]="lazy()"
      [totalRecords]="total()"
      [loading]="loading()"
      [scrollHeight]="scrollHeight()"
      [groupRowsBy]="group()"
      selectionMode="multiple"
      [(selection)]="selection"
      (lazyLoad)="requests.push($event)"
    >
      @if (customGroup()) {
        <ng-template cbTableGroupHeader let-tipo let-count="count">{{ tipo }} · {{ count }} movimientos</ng-template>
      }
    </cb-table>
  `,
})
class HostComponent {
  cols = COLS;
  rows = signal<Mov[]>(MOVS);
  lazy = signal(false);
  total = signal<number | null>(null);
  loading = signal(false);
  scrollHeight = signal<string | null>(null);
  group = signal<string | null>(null);
  customGroup = signal(false);
  selection = signal<unknown>([]);
  requests: CbTableLazyLoadEvent[] = [];
}

async function setup(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const table = () => fixture.debugElement.query((d) => d.name === 'cb-table').componentInstance as CbTable;
  const bodyRows = () => Array.from(el.querySelectorAll<HTMLElement>('tbody .cb-table__row'));
  const firstTexts = () => bodyRows().map((r) => r.querySelectorAll('.cb-table__td')[0].textContent!.trim());
  return { fixture, el, table, bodyRows, firstTexts, host: fixture.componentInstance };
}

describe('CbTable · nivel 2', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('lazy (datos desde el servidor)', () => {
    it('pide la primera página al montarse y muestra value tal cual, con totalRecords en el paginador', async () => {
      const { el, host, bodyRows } = await setup((h) => {
        h.lazy.set(true);
        h.rows.set(MOVS.slice(0, 2));
        h.total.set(40);
      });
      expect(host.requests).toEqual([{ first: 0, rows: 2, sortField: null, sortOrder: 1, globalFilter: '', filters: {} }]);
      expect(bodyRows()).toHaveLength(2);
      expect(el.querySelector('cb-paginator')!.textContent).toContain('40');
    });

    it('ordenar, filtrar y cambiar de página emiten lazyLoad sin tocar los datos', async () => {
      const { fixture, el, host, firstTexts } = await setup((h) => {
        h.lazy.set(true);
        h.rows.set(MOVS.slice(0, 2));
        h.total.set(40);
      });
      const sortBtn = el.querySelector<HTMLButtonElement>('.cb-table__sort-btn')!;
      sortBtn.click();
      fixture.detectChanges();
      expect(host.requests.at(-1)).toMatchObject({ first: 0, sortField: 'descripcion', sortOrder: 1 });
      // En lazy no se reordena en el cliente.
      expect(firstTexts()).toEqual(['2026-10-01', '2026-10-02']);

      const filter = el.querySelector<HTMLInputElement>('.cb-table__filter')!;
      filter.value = 'nóm';
      filter.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(host.requests.at(-1)).toMatchObject({ first: 0, filters: { descripcion: 'nóm' } });
      expect(firstTexts()).toHaveLength(2);

      const next = Array.from(el.querySelectorAll<HTMLButtonElement>('cb-paginator button')).find((b) =>
        /siguiente|next/i.test(b.getAttribute('aria-label') ?? ''),
      )!;
      next.click();
      fixture.detectChanges();
      expect(host.requests.at(-1)).toMatchObject({ first: 2, rows: 2 });
    });

    it('al llegar la página siguiente no vuelve a la primera', async () => {
      const { fixture, el, host } = await setup((h) => {
        h.lazy.set(true);
        h.rows.set(MOVS.slice(0, 2));
        h.total.set(4);
      });
      Array.from(el.querySelectorAll<HTMLButtonElement>('cb-paginator button'))
        .find((b) => /siguiente|next/i.test(b.getAttribute('aria-label') ?? ''))!
        .click();
      fixture.detectChanges();
      host.rows.set(MOVS.slice(2, 4));
      fixture.detectChanges();
      expect(el.querySelector('cb-paginator [aria-current="page"]')?.textContent?.trim()).toBe('2');
    });

    it('loading muestra la capa de carga y marca aria-busy', async () => {
      const { el } = await setup((h) => h.loading.set(true));
      expect(el.querySelector('table')!.getAttribute('aria-busy')).toBe('true');
      expect(el.querySelector('.cb-table__loading')!.getAttribute('role')).toBe('status');
    });
  });

  it('scrollHeight limita el alto y fija la cabecera', async () => {
    const { el } = await setup((h) => h.scrollHeight.set('240px'));
    const wrap = el.querySelector<HTMLElement>('.cb-table__wrap')!;
    expect(wrap.style.maxHeight).toBe('240px');
    expect(wrap.classList).toContain('cb-table__wrap--scroll');
    expect(el.querySelector('table')!.classList).toContain('cb-table--scroll');
  });

  it('las columnas frozen se muestran primero y fijas, junto con la de selección', async () => {
    const { el } = await setup();
    const headers = Array.from(el.querySelectorAll<HTMLElement>('thead tr:first-child th'));
    expect(headers.map((h) => h.dataset['key'])).toEqual(['__sel', 'fecha', 'descripcion', 'valor', 'acciones']);
    expect(headers[0].classList).toContain('cb-is-frozen');
    expect(headers[1].classList).toContain('cb-is-frozen');
    expect(headers[1].classList).toContain('cb-is-frozen-last');
    expect(headers[2].classList).not.toContain('cb-is-frozen');
    expect(headers[1].style.left).toMatch(/px$/);
    const firstCells = Array.from(el.querySelectorAll('tbody .cb-table__row')[0].children);
    expect(firstCells[1].classList).toContain('cb-is-frozen');
  });

  describe('agrupación', () => {
    it('ordena por el campo del grupo y añade una cabecera con el recuento total', async () => {
      const { el } = await setup((h) => h.group.set('tipo'));
      const groups = Array.from(el.querySelectorAll<HTMLElement>('tbody .cb-table__group th'));
      // Página 1 (2 filas): ambas son "Gasto" → una sola cabecera, con el total del grupo (2).
      expect(groups).toHaveLength(1);
      expect(groups[0].getAttribute('scope')).toBe('rowgroup');
      expect(groups[0].textContent!.replace(/\s+/g, ' ').trim()).toBe('Gasto (2)');
      expect(groups[0].getAttribute('colspan')).toBe('5');
    });

    it('acepta una plantilla cbTableGroupHeader', async () => {
      const { el } = await setup((h) => {
        h.group.set('tipo');
        h.customGroup.set(true);
      });
      expect(el.querySelector('.cb-table__group th')!.textContent!.trim()).toBe('Gasto · 2 movimientos');
    });
  });

  describe('exportación', () => {
    it('toCSV: todas las filas filtradas, columnas exportables, comillas y separadores escapados', async () => {
      const { table } = await setup();
      const csv = table().toCSV();
      expect(csv.split('\r\n')).toEqual([
        'Fecha,Descripción,Valor',
        '2026-10-01,Nómina,5000',
        '2026-10-02,"Mercado, ""Éxito""",-320',
        '2026-10-03,Intereses,12',
        '2026-10-04,Arriendo,-1800',
      ]);
      // Con ";" la coma ya no obliga a entrecomillar, pero las comillas sí (RFC 4180).
      const semicolon = table().toCSV({ separator: ';' }).split('\r\n');
      expect(semicolon[3]).toBe('2026-10-03;Intereses;12');
      expect(semicolon[2]).toBe('2026-10-02;"Mercado, ""Éxito""";-320');
    });

    it('selectionOnly exporta solo las filas seleccionadas', async () => {
      const { fixture, table, host } = await setup();
      host.selection.set([MOVS[3]]);
      fixture.detectChanges();
      expect(table().toCSV({ selectionOnly: true }).split('\r\n')).toEqual(['Fecha,Descripción,Valor', '2026-10-04,Arriendo,-1800']);
    });

    it('exportCSV descarga un archivo .csv con BOM para Excel', async () => {
      const { table } = await setup();
      const blobs: Blob[] = [];
      vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => {
        blobs.push(b as Blob);
        return 'blob:csv';
      });
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('movimientos.csv');
        expect(this.href).toBe('blob:csv');
      });
      table().exportCSV('movimientos');
      expect(click).toHaveBeenCalledTimes(1);
      const buffer = await new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(blobs[0]);
      });
      const bytes = new Uint8Array(buffer);
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    });
  });
});
