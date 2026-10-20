import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTree, CbTreeNodeTemplate, type CbTreeNode } from './tree.component';

const NODES: CbTreeNode[] = [
  {
    key: 'docs',
    label: 'Documentos',
    children: [
      { key: 'work', label: 'Trabajo', children: [{ key: 'cv', label: 'CV.pdf' }] },
      { key: 'home', label: 'Casa', disabled: true },
    ],
  },
  { key: 'pics', label: 'Imágenes' },
];

@Component({
  imports: [CbTree, CbTreeNodeTemplate],
  template: `
    <cb-tree [value]="nodes" [(selection)]="selected" ariaLabel="Archivos">
      @if (custom()) {
        <ng-template cbTreeNode let-node let-level="level">{{ node.label }}·{{ level }}</ng-template>
      }
    </cb-tree>
  `,
})
class HostComponent {
  nodes = NODES;
  selected = signal<CbTreeNode | null>(null);
  custom = signal(false);
}

describe('CbTree', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const items = () => Array.from(el.querySelectorAll<HTMLElement>('[role="treeitem"]'));
    const item = (label: string) => items().find((i) => i.querySelector('.cb-tree__label')!.textContent!.trim().startsWith(label))!;
    const key = (k: string) => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, el, items, item, key };
  }

  it('expone el árbol con nombre accesible y ARIA de cada nodo', () => {
    const { el, item } = setup();
    expect(el.querySelector('[role="tree"]')!.getAttribute('aria-label')).toBe('Archivos');
    const docs = item('Documentos');
    expect(docs.getAttribute('aria-level')).toBe('1');
    expect(docs.getAttribute('aria-setsize')).toBe('2');
    expect(docs.getAttribute('aria-posinset')).toBe('1');
    expect(docs.getAttribute('aria-expanded')).toBe('false');
    expect(item('Imágenes').hasAttribute('aria-expanded')).toBe(false);
  });

  it('muestra niveles ilimitados (nietos incluidos)', () => {
    const { fixture, item } = setup();
    (item('Documentos').querySelector('.cb-tree__toggler') as HTMLElement).click();
    fixture.detectChanges();
    (item('Trabajo').querySelector('.cb-tree__toggler') as HTMLElement).click();
    fixture.detectChanges();
    const cv = item('CV.pdf');
    expect(cv).toBeTruthy();
    expect(cv.getAttribute('aria-level')).toBe('3');
  });

  it('solo el primer nodo es tabulable al inicio (roving tabindex)', () => {
    const { items } = setup();
    expect(items().map((i) => i.getAttribute('tabindex'))).toEqual(['0', '-1']);
  });

  it('navega y expande con el teclado', () => {
    const { item, key } = setup();
    item('Documentos').focus();
    key('ArrowRight'); // expande
    expect(item('Documentos').getAttribute('aria-expanded')).toBe('true');
    key('ArrowRight'); // entra al primer hijo
    expect(document.activeElement).toBe(item('Trabajo'));
    key('ArrowLeft'); // sube al padre
    expect(document.activeElement).toBe(item('Documentos'));
    key('End');
    expect(document.activeElement).toBe(item('Imágenes'));
    key('Home');
    expect(document.activeElement).toBe(item('Documentos'));
    key('ArrowLeft'); // contrae
    expect(item('Documentos').getAttribute('aria-expanded')).toBe('false');
  });

  it('selecciona con clic y con Enter, y respeta disabled', () => {
    const { fixture, item, key } = setup();
    item('Imágenes').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()?.key).toBe('pics');
    expect(item('Imágenes').getAttribute('aria-selected')).toBe('true');

    item('Documentos').focus();
    key('Enter');
    expect(fixture.componentInstance.selected()?.key).toBe('docs');

    key('ArrowRight');
    key('ArrowDown');
    key('ArrowDown'); // Casa (deshabilitado)
    key('Enter');
    expect(fixture.componentInstance.selected()?.key).toBe('docs');
  });

  it('usa la plantilla de nodo con su nivel', () => {
    const { fixture, item } = setup();
    fixture.componentInstance.custom.set(true);
    fixture.detectChanges();
    expect(item('Documentos').querySelector('.cb-tree__label')!.textContent!.trim()).toBe('Documentos·1');
  });
});
