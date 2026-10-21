import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbMenubar, type CbMenubarItem } from './menubar.component';

@Component({
  imports: [CbMenubar],
  template: `<cb-menubar [items]="items" (itemSelect)="selected = $event" />`,
})
class HostComponent {
  items: CbMenubarItem[] = [
    { label: 'Inicio', url: '/' },
    { label: 'Productos', items: [{ label: 'Todos', url: '/products' }, { label: 'Nuevo' }] },
    { label: 'Deshabilitado', disabled: true },
  ];
  selected: CbMenubarItem | null = null;
}

describe('CbMenubar', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  it('renderiza navegación accesible con enlaces y submenús', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="menubar"]')).toBeTruthy();
    expect(host.querySelectorAll('[role="menuitem"]')).toHaveLength(3);
    expect(host.querySelector('[aria-haspopup="menu"]')).toBeTruthy();
  });

  it('abre el submenú y emite selección de una acción', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!.click();
    fixture.detectChanges();
    expect(host.querySelector('[role="menu"]')).toBeTruthy();
    host.querySelector<HTMLButtonElement>('.cb-menubar__submenu button')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected?.label).toBe('Nuevo');
    expect(host.querySelector('[role="menu"]')).toBeNull();
  });

  it('ArrowDown abre el submenú y Escape lo cierra', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[aria-haspopup="menu"]') as HTMLButtonElement;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeTruthy();
    fixture.nativeElement.querySelector('[role="menuitem"]:not([aria-haspopup])')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it('ArrowDown mueve el foco al primer elemento del submenú (tras el render)', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const trigger = el.querySelector('[aria-haspopup="menu"]') as HTMLButtonElement;
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement!.textContent!.trim()).toBe('Todos');
    expect(el.querySelector('.cb-menubar__submenu')!.contains(document.activeElement)).toBe(true);
    el.remove();
  });

  it('cierra el submenú al hacer clic fuera', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!.click();
    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });
});
