import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbFloatMenu, type CbFloatMenuItem } from './float-menu.component';

const ITEMS: CbFloatMenuItem[] = [
  { id: 'home', label: 'Inicio' },
  { id: 'cards', label: 'Tarjetas' },
];

function setup() {
  const fixture = TestBed.createComponent(CbFloatMenu);
  fixture.componentRef.setInput('items', ITEMS);
  fixture.componentRef.setInput('activeId', 'cards');
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-float-menu__item'));
  return { fixture, el, buttons };
}

describe('CbFloatMenu', () => {
  it('renderiza los botones del menú flotante', () => {
    const { buttons } = setup();
    expect(buttons().map((b) => b.textContent!.trim())).toEqual(['Inicio', 'Tarjetas']);
  });

  it('es una navegación con nombre y marca la opción activa con aria-current', () => {
    const { fixture, el, buttons } = setup();
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Menú flotante');
    expect(buttons()[1].getAttribute('aria-current')).toBe('true');
    expect(buttons()[1].classList).toContain('cb-float-menu__item--active');
    expect(buttons()[0].hasAttribute('aria-current')).toBe(false);

    fixture.componentRef.setInput('ariaLabel', 'Navegación principal');
    fixture.detectChanges();
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Navegación principal');
  });

  it('emite select con la opción pulsada', () => {
    const { fixture, buttons } = setup();
    const selected: CbFloatMenuItem[] = [];
    fixture.componentInstance.select.subscribe((item) => selected.push(item));
    buttons()[0].click();
    expect(selected).toEqual([ITEMS[0]]);
  });
});
