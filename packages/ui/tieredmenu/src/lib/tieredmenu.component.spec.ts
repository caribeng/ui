import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTieredMenu, type CbTieredMenuItem } from './tieredmenu.component';

@Component({ imports: [CbTieredMenu], template: `<cb-tieredmenu [items]="items" (itemSelect)="selected=$event.label" />` })
class HostComponent {
  items: CbTieredMenuItem[] = [{ label: 'Archivo', items: [{ label: 'Nuevo', items: [{ label: 'Proyecto' }] }, { label: 'Abrir' }] }];
  selected = '';
}

@Component({ imports: [CbTieredMenu], template: `<cb-tieredmenu [items]="items" />` })
class KeyboardHost {
  items: CbTieredMenuItem[] = [
    { label: 'Archivo', items: [{ label: 'Nuevo', items: [{ label: 'Proyecto' }] }, { label: 'Abrir' }] },
    { label: 'Editar', disabled: true },
    { label: 'Salir' },
  ];
}

describe('CbTieredMenu', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('opens the popup and cascades into nested levels', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__list > .cb-tieredmenu__entry [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__submenu [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(3);
  });
  it('al tocar una opción con submenú (mouseenter y luego click, como en móvil) el submenú queda abierto', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    const parent = document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__list > .cb-tieredmenu__entry [aria-haspopup="menu"]')!;
    parent.dispatchEvent(new MouseEvent('mouseenter')); fixture.detectChanges();
    parent.click(); fixture.detectChanges();
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.querySelector('.cb-tieredmenu__submenu')).toBeTruthy();
  });
  it('emits a leaf selection and closes the popup', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__list > .cb-tieredmenu__entry [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__submenu [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__submenu--third button')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Proyecto');
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });
  it('patrón menu con teclado: el foco entra, las flechas recorren y abren niveles, Escape lo devuelve', async () => {
    const fixture = TestBed.createComponent(KeyboardHost);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => { fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); };
    const active = () => (document.activeElement as HTMLElement).textContent!.trim();
    const press = async (key: string) => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await settle();
    };
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cb-tieredmenu__trigger')!;
    trigger.focus();
    await press('ArrowDown');
    expect(active()).toBe('Archivo');
    expect(document.body.querySelectorAll('.cb-tieredmenu__list > li[role="none"]').length).toBe(3);
    // Salta el item deshabilitado y es circular.
    await press('ArrowDown');
    expect(active()).toBe('Salir');
    await press('ArrowDown');
    expect(active()).toBe('Archivo');
    await press('End');
    expect(active()).toBe('Salir');
    await press('Home');
    await press('ArrowRight');
    expect(active()).toBe('Nuevo');
    await press('ArrowRight');
    expect(active()).toBe('Proyecto');
    await press('ArrowLeft');
    expect(active()).toBe('Nuevo');
    expect(document.body.querySelector('.cb-tieredmenu__submenu--third')).toBeNull();
    await press('ArrowLeft');
    expect(active()).toBe('Archivo');
    expect(document.body.querySelector('.cb-tieredmenu__submenu')).toBeNull();
    await press('Escape');
    await settle();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fixture.nativeElement.remove();
  });
});
