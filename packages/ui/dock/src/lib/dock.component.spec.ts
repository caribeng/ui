import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDock, type CbDockItem } from './dock.component';

@Component({ imports: [CbDock], template: `<cb-dock [items]="items" position="left" (itemSelect)="selected=$event.label" />` })
class HostComponent { items: CbDockItem[] = [{ label: 'Inicio', icon: 'house' }, { label: 'Ayuda', icon: 'info', disabled: true }]; selected = ''; }

@Component({ imports: [CbDock], template: `<cb-dock [items]="items" />` })
class KeyboardHost {
  items: CbDockItem[] = [
    { label: 'Inicio', icon: 'house' },
    { label: 'Ayuda', icon: 'info', disabled: true },
    { label: 'Ajustes', icon: 'settings' },
    { label: 'Perfil', icon: 'user', url: '#perfil' },
  ];
}

describe('CbDock', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('exposes vertical orientation for side dock positions', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="toolbar"]').getAttribute('aria-orientation')).toBe('vertical');
  });
  it('emits enabled application actions', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cb-dock__item')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Inicio');
  });
  it('un solo tabindex activo; flechas, Inicio y Fin recorren las acciones sin pasar por las deshabilitadas', () => {
    const fixture = TestBed.createComponent(KeyboardHost); fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const items = Array.from(el.querySelectorAll<HTMLElement>('.cb-dock__item'));
    const toolbar = el.querySelector<HTMLElement>('[role="toolbar"]')!;
    const press = (key: string) => { toolbar.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); fixture.detectChanges(); };
    expect(el.querySelectorAll('li[role="none"]').length).toBe(4);
    expect(items.map((i) => i.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    items[0].focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(items[2]);
    expect(items.map((i) => i.getAttribute('tabindex'))).toEqual(['-1', '-1', '0', '-1']);
    press('End');
    expect(document.activeElement).toBe(items[3]);
    press('ArrowRight');
    expect(document.activeElement).toBe(items[0]);
    press('ArrowLeft');
    expect(document.activeElement).toBe(items[3]);
    press('Home');
    expect(document.activeElement).toBe(items[0]);
    // En horizontal, las flechas verticales no hacen nada.
    press('ArrowDown');
    expect(document.activeElement).toBe(items[0]);
    el.remove();
  });
});
