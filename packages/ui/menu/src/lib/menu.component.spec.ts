import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbMenu, type CbMenuItem } from './menu.component';

@Component({
  imports: [CbMenu],
  template: `<button id="trigger" (click)="menu.toggle($event)">Opciones</button><cb-menu #menu [items]="items" (itemSelect)="selected = $event" />`,
})
class HostComponent {
  items: CbMenuItem[] = [
    { label: 'Editar', icon: 'pencil' },
    { label: 'Deshabilitado', disabled: true },
    { label: 'Eliminar', separator: true },
    { label: 'Abrir', url: '/detalle' },
  ];
  selected: CbMenuItem | null = null;
}

describe('CbMenu', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  it('abre un popup accesible y renderiza acciones y separadores', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#trigger').click();
    fixture.detectChanges();
    await Promise.resolve();
    const menu = document.body.querySelector('[role="menu"]')!;
    expect(menu).toBeTruthy();
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(3);
    expect(menu.querySelector('[role="separator"]')).toBeTruthy();
    expect(menu.querySelector('[role="menuitem"]:disabled')).toBeTruthy();
  });

  it('emite selección y cierra el menú al activar una acción', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#trigger').click();
    fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected?.label).toBe('Editar');
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it('cierra con Escape y devuelve el foco al disparador', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('#trigger')!;
    trigger.click();
    fixture.detectChanges();
    const item = document.body.querySelector<HTMLElement>('[role="menuitem"]')!;
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
