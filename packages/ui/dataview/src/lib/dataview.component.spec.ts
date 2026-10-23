import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDataView, CbDataViewHeader, CbDataViewItemTemplate, type CbDataViewItem, type CbDataViewLayout } from './dataview.component';

const ITEMS = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, title: `Producto ${i + 1}`, category: 'Ahorro' }));

@Component({
  imports: [CbDataView, CbDataViewItemTemplate, CbDataViewHeader],
  template: `
    <cb-dataview
      [value]="items()"
      [rows]="rows()"
      [(layout)]="layout"
      [(selection)]="selected"
      [showLayoutToggle]="toggle()"
    >
      @if (header()) {
        <h3 cbDataViewHeader>Catálogo</h3>
      }
      @if (custom()) {
        <ng-template cbDataViewItem let-item let-layout="layout" let-i="index">{{ i }}:{{ item.title }}:{{ layout }}</ng-template>
      }
    </cb-dataview>
  `,
})
class HostComponent {
  items = signal<readonly CbDataViewItem[]>(ITEMS);
  rows = signal(0);
  layout = signal<CbDataViewLayout>('grid');
  selected = signal<CbDataViewItem | null>(null);
  toggle = signal(false);
  header = signal(false);
  custom = signal(false);
}

describe('CbDataView', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const cells = () => Array.from(el.querySelectorAll<HTMLElement>('[role="listitem"]'));
    return { fixture, el, cells, host: fixture.componentInstance };
  }

  it('muestra la presentación por defecto y actualiza la selección', () => {
    const { fixture, cells, host } = setup();
    expect(cells().length).toBe(7);
    expect(cells()[0].textContent).toContain('Producto 1');
    (cells()[1].querySelector('button') as HTMLElement).click();
    fixture.detectChanges();
    expect(host.selected()?.id).toBe(2);
    expect(cells()[1].querySelector('button')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('usa la plantilla de elemento con la vista y el índice', () => {
    const { fixture, cells, host } = setup();
    host.custom.set(true);
    fixture.detectChanges();
    expect(cells()[0].textContent!.trim()).toBe('0:Producto 1:grid');
  });

  it('cambia de vista con los botones y actualiza el modelo', () => {
    const { fixture, el, host } = setup();
    host.toggle.set(true);
    fixture.detectChanges();
    const [list] = Array.from(el.querySelectorAll<HTMLElement>('.cb-dataview__layout-btn'));
    expect(list.getAttribute('aria-label')).toBe('Vista de lista');
    list.click();
    fixture.detectChanges();
    expect(host.layout()).toBe('list');
    expect(el.querySelector('.cb-dataview')!.getAttribute('data-layout')).toBe('list');
    expect(list.getAttribute('aria-pressed')).toBe('true');
  });

  it('pagina cuando se indica rows y vuelve a la primera página si cambian los datos', () => {
    const { fixture, el, cells, host } = setup();
    host.rows.set(3);
    fixture.detectChanges();
    expect(cells().length).toBe(3);
    expect(el.querySelector('cb-paginator')).toBeTruthy();
    host.items.set(ITEMS.slice(0, 2));
    fixture.detectChanges();
    expect(cells().length).toBe(2);
    expect(el.querySelector('cb-paginator')).toBeNull();
  });

  it('muestra la cabecera proyectada', () => {
    const { fixture, el, host } = setup();
    expect(el.querySelector('.cb-dataview__header')).toBeNull();
    host.header.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.cb-dataview__header')!.textContent).toContain('Catálogo');
  });

  it('muestra el mensaje vacío del idioma activo', () => {
    const { fixture, el, host } = setup();
    host.items.set([]);
    fixture.detectChanges();
    expect(el.querySelector('.cb-dataview__empty')!.textContent!.trim()).toBe('Sin resultados');
  });

  it('cada botón de seleccionar se nombra con su elemento', () => {
    const { el } = setup();
    const select = el.querySelector<HTMLButtonElement>('.cb-dataview__select')!;
    expect(select.getAttribute('aria-label')).toBe('Seleccionar Producto 1');
    expect(select.getAttribute('aria-pressed')).toBe('false');
  });
});
