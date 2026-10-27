import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbFabMenu, type CbFabMenuItem } from './fab-menu.component';

@Component({
  imports: [CbFabMenu],
  template: `<cb-fab-menu [items]="items" [(open)]="open" (itemSelected)="selected = $event.id" />`,
})
class HostComponent {
  open = signal(false);
  selected = '';
  items: CbFabMenuItem[] = [
    { id: 'share', label: 'Compartir' },
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar' },
  ];
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const trigger = () => el.querySelector<HTMLButtonElement>('.cb-fab-menu__trigger')!;
  const menu = () => el.querySelector<HTMLElement>('[role="menu"]');
  const items = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const openMenu = async () => {
    trigger().focus();
    trigger().click();
    await settle();
  };
  const key = async (k: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await settle();
  };
  return { fixture, el, trigger, menu, items, settle, openMenu, key };
}

describe('CbFabMenu', () => {
  it('el botón flotante anuncia que abre un menú y lo controla', async () => {
    const { el, trigger, menu, openMenu } = await setup();
    expect(trigger().getAttribute('aria-label')).toBe('Menú de acciones rápidas');
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(menu()).toBeNull();

    await openMenu();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(menu()!.id);
    expect(menu()!.getAttribute('aria-label')).toBe('Menú de acciones rápidas');
    el.remove();
  });

  it('al abrir enfoca la primera acción; las acciones no entran en el orden de tabulación', async () => {
    const { el, items, openMenu } = await setup();
    await openMenu();
    expect(document.activeElement).toBe(items()[0]);
    expect(items().every((i) => i.getAttribute('tabindex') === '-1')).toBe(true);
    el.remove();
  });

  it('flechas (circular), Inicio y Fin recorren las acciones', async () => {
    const { el, items, openMenu, key } = await setup();
    await openMenu();
    await key('ArrowDown');
    expect(document.activeElement).toBe(items()[1]);
    await key('End');
    expect(document.activeElement).toBe(items()[2]);
    await key('ArrowDown');
    expect(document.activeElement).toBe(items()[0]);
    await key('ArrowUp');
    expect(document.activeElement).toBe(items()[2]);
    await key('Home');
    expect(document.activeElement).toBe(items()[0]);
    el.remove();
  });

  it('Escape cierra el menú y devuelve el foco al botón flotante', async () => {
    const { el, trigger, menu, openMenu, key, fixture } = await setup();
    await openMenu();
    await key('Escape');
    expect(menu()).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });

  it('elegir una acción la emite, cierra el menú y devuelve el foco', async () => {
    const { fixture, el, trigger, menu, items, openMenu, settle } = await setup();
    await openMenu();
    items()[1].click();
    await settle();
    expect(fixture.componentInstance.selected).toBe('edit');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });
});
