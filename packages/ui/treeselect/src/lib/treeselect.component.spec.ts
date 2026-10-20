import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbTreeSelect, CbTreeSelectNode } from './treeselect.component';

const NODES: CbTreeSelectNode[] = [
  {
    key: 'docs',
    label: 'Documentos',
    children: [
      { key: 'spec', label: 'SPEC.md' },
      { key: 'old', label: 'Antiguo.md', disabled: true },
    ],
  },
  { key: 'pics', label: 'Imágenes' },
];

@Component({
  imports: [CbTreeSelect],
  template: `<cb-tree-select [nodes]="nodes()" [(value)]="selected" [disabled]="disabled()" placeholder="Archivo" />`,
})
class HostComponent {
  selected = signal<string | null>(null);
  disabled = signal(false);
  nodes = signal<CbTreeSelectNode[]>(NODES);
}

@Component({
  imports: [CbTreeSelect, ReactiveFormsModule],
  template: `<cb-tree-select [nodes]="nodes" [formControl]="ctrl" />`,
})
class FormHostComponent {
  nodes = NODES;
  ctrl = new FormControl<string | null>('spec');
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const trigger = () => el.querySelector<HTMLButtonElement>('.cb-tree-select__trigger')!;
  const items = () => Array.from(el.querySelectorAll<HTMLElement>('[role="treeitem"]'));
  const nodeBtn = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-tree-select__node-btn')).find(
      (b) => b.textContent!.trim() === label,
    )!;
  const click = (b: HTMLElement) => {
    b.click();
    fixture.detectChanges();
  };
  return { fixture, el, trigger, items, nodeBtn, click };
}

describe('CbTreeSelect', () => {
  it('abre el árbol, expande nodos hijos y selecciona un valor', () => {
    const { fixture, el, trigger, nodeBtn, click } = setup();
    click(trigger());
    click(el.querySelector<HTMLButtonElement>('.cb-tree-select__expander')!);
    click(nodeBtn('SPEC.md'));

    expect(fixture.componentInstance.selected()).toBe('spec');
    expect(el.querySelector('.cb-tree-select__label')?.textContent?.trim()).toBe('SPEC.md');
    expect(el.querySelector('[role="tree"]')).toBeNull();
  });

  it('expone ARIA de árbol: aria-expanded en ramas y aria-selected en el elegido', () => {
    const { fixture, el, trigger, items, click } = setup();
    fixture.componentInstance.selected.set('pics');
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-haspopup')).toBe('tree');
    click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    const [docs, pics] = items();
    expect(docs.getAttribute('aria-expanded')).toBe('false');
    expect(pics.hasAttribute('aria-expanded')).toBe(false);
    expect(pics.getAttribute('aria-selected')).toBe('true');
    expect(docs.getAttribute('aria-selected')).toBe('false');

    click(el.querySelector<HTMLButtonElement>('.cb-tree-select__expander')!);
    expect(items()[0].getAttribute('aria-expanded')).toBe('true');
    expect(items()).toHaveLength(4);
  });

  it('el expansor tiene nombre accesible y contrae la rama al volver a pulsarlo', () => {
    const { el, trigger, items, click } = setup();
    click(trigger());
    const expander = el.querySelector<HTMLButtonElement>('.cb-tree-select__expander')!;
    expect(expander.getAttribute('aria-label')).toContain('Documentos');
    click(expander);
    expect(items()).toHaveLength(4);
    click(expander);
    expect(items()).toHaveLength(2);
  });

  it('no permite seleccionar un nodo deshabilitado', () => {
    const { fixture, el, trigger, nodeBtn, click } = setup();
    click(trigger());
    click(el.querySelector<HTMLButtonElement>('.cb-tree-select__expander')!);
    expect(nodeBtn('Antiguo.md').disabled).toBe(true);
    expect(fixture.componentInstance.selected()).toBeNull();
  });

  it('se cierra con Escape y devuelve el foco al disparador', () => {
    const { fixture, el, trigger, nodeBtn, click } = setup();
    document.body.appendChild(el);
    click(trigger());
    nodeBtn('Imágenes').focus();
    nodeBtn('Imágenes').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelector('[role="tree"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });

  it('no se abre si está deshabilitado', () => {
    const { fixture, el, trigger, click } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    click(trigger());
    expect(el.querySelector('[role="tree"]')).toBeNull();
    expect(el.querySelector('cb-tree-select')!.classList).toContain('cb-is-disabled');
  });

  it('se integra con Reactive Forms: busca la etiqueta en niveles anidados y actualiza el control', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-tree-select__label')!.textContent!.trim()).toBe('SPEC.md');

    el.querySelector<HTMLButtonElement>('.cb-tree-select__trigger')!.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.cb-tree-select__node-btn')[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ctrl.value).toBe('pics');
    expect(fixture.componentInstance.ctrl.touched).toBe(true);

    fixture.componentInstance.ctrl.disable();
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('.cb-tree-select__trigger')!.disabled).toBe(true);
  });
});
