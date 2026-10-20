import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTreeTable, CbTreeTableCellTemplate, type CbTreeTableNode } from './treetable.component';

const NODES: CbTreeTableNode[] = [
  {
    key: 'src',
    data: { name: 'src', size: '120 KB' },
    children: [
      { key: 'app', data: { name: 'app', size: '80 KB' }, children: [{ key: 'main', data: { name: 'main.ts', size: '2 KB' } }] },
    ],
  },
  { key: 'readme', data: { name: 'README.md', size: '4 KB' } },
];

@Component({
  imports: [CbTreeTable, CbTreeTableCellTemplate],
  template: `
    <cb-treetable [value]="nodes" [columns]="columns" ariaLabel="Archivos">
      @if (custom()) {
        <ng-template cbTreeTableCell="size" let-value let-level="level">[{{ value }}·{{ level }}]</ng-template>
      }
    </cb-treetable>
  `,
})
class HostComponent {
  nodes = NODES;
  columns = [
    { field: 'name', header: 'Nombre' },
    { field: 'size', header: 'Tamaño' },
  ];
  custom = signal(false);
}

describe('CbTreeTable', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const rows = () => Array.from(el.querySelectorAll<HTMLElement>('tbody tr'));
    const row = (name: string) => rows().find((r) => r.querySelector('td')!.textContent!.trim() === name)!;
    const key = (k: string) => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, el, rows, row, key };
  }

  it('cada celda muestra solo su columna (sin duplicar datos)', () => {
    const { rows } = setup();
    const cells = Array.from(rows()[0].querySelectorAll('td')).map((td) => td.textContent!.trim());
    expect(cells).toEqual(['src', '120 KB']);
  });

  it('es un treegrid accesible con nivel y estado de cada fila', () => {
    const { el, row } = setup();
    expect(el.querySelector('table')!.getAttribute('role')).toBe('treegrid');
    expect(el.querySelector('table')!.getAttribute('aria-label')).toBe('Archivos');
    expect(row('src').getAttribute('aria-level')).toBe('1');
    expect(row('src').getAttribute('aria-expanded')).toBe('false');
    expect(row('README.md').hasAttribute('aria-expanded')).toBe(false);
  });

  it('muestra niveles ilimitados', () => {
    const { fixture, row } = setup();
    (row('src').querySelector('button') as HTMLElement).click();
    fixture.detectChanges();
    (row('app').querySelector('button') as HTMLElement).click();
    fixture.detectChanges();
    expect(row('main.ts').getAttribute('aria-level')).toBe('3');
  });

  it('navega y expande con el teclado', () => {
    const { row, key } = setup();
    row('src').focus();
    key('ArrowRight');
    expect(row('src').getAttribute('aria-expanded')).toBe('true');
    key('ArrowDown');
    expect(document.activeElement).toBe(row('app'));
    key('ArrowLeft'); // vuelve al padre
    expect(document.activeElement).toBe(row('src'));
    key('End');
    expect(document.activeElement).toBe(row('README.md'));
  });

  it('usa la plantilla de celda por columna', () => {
    const { fixture, rows } = setup();
    fixture.componentInstance.custom.set(true);
    fixture.detectChanges();
    expect(rows()[0].querySelectorAll('td')[1].textContent!.trim()).toBe('[120 KB·1]');
  });
});
