import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CbMenu, type CbMenuItem } from './menu.component';

const nuevo = vi.fn();

@Component({
  imports: [CbMenu],
  template: `<button id="trigger" (click)="menu.toggle($event)">Opciones</button><cb-menu #menu [items]="items" (itemSelect)="selected = $event" />`,
})
class HostComponent {
  items: CbMenuItem[] = [
    { label: 'Nuevo', icon: 'plus', command: nuevo },
    { label: 'Solo administradores', visible: false },
    { label: 'Abrir', url: '/detalle' },
  ];
  selected: CbMenuItem | null = null;
}

describe('CbMenu: command y visible', () => {
  beforeEach(() => {
    nuevo.mockClear();
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function open() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#trigger').click();
    fixture.detectChanges();
    return { fixture, items: () => Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')) };
  }

  it('no muestra los items con visible: false', () => {
    const { items } = open();
    expect(items().map((i) => i.textContent?.trim())).toEqual(['Nuevo', 'Abrir']);
  });

  it('ejecuta command al elegir y además emite itemSelect con el item original', () => {
    const { fixture, items } = open();
    items()[0].click();
    fixture.detectChanges();
    expect(nuevo).toHaveBeenCalledOnce();
    expect(nuevo.mock.calls[0][0].item).toBe(fixture.componentInstance.items[0]);
    expect(fixture.componentInstance.selected).toBe(fixture.componentInstance.items[0]);
  });
});
