import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbTreeSelect, CbTreeSelectNode } from './treeselect.component';

@Component({
  imports: [CbTreeSelect],
  template: `<cb-tree-select [nodes]="nodes()" [(value)]="selected" />`,
})
class HostComponent {
  selected = signal<string | null>(null);
  nodes = signal<CbTreeSelectNode[]>([
    {
      key: 'docs',
      label: 'Documentos',
      children: [{ key: 'spec', label: 'SPEC.md' }],
    },
  ]);
}

describe('CbTreeSelect', () => {
  it('abre el árbol, expande nodos hijos y selecciona un valor', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.cb-tree-select__trigger')!.click();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.cb-tree-select__expander')!.click();
    fixture.detectChanges();

    const btns = el.querySelectorAll<HTMLButtonElement>('.cb-tree-select__node-btn');
    expect(btns.length).toBe(2);
    btns[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe('spec');
    expect(el.querySelector('.cb-tree-select__label')?.textContent?.trim()).toBe('SPEC.md');
  });
});
