import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbMultiSelect } from './multiselect.component';

const PAISES = [
  { label: 'Colombia', items: [{ label: 'Bogotá' }, { label: 'Medellín' }, { label: 'Cali', disabled: true }] },
  { label: 'México', items: [{ label: 'Monterrey' }, { label: 'Guadalajara' }] },
];

@Component({
  imports: [CbMultiSelect],
  template: `
    <cb-multiselect
      [options]="options()"
      [group]="group()"
      [filter]="filter()"
      [virtualScroll]="virtual()"
      [virtualScrollItemSize]="32"
      scrollHeight="160px"
      optionValue="label"
      ariaLabel="Ciudades"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  options = signal<readonly unknown[]>(PAISES);
  group = signal(true);
  filter = signal(false);
  virtual = signal(false);
  value = signal<unknown[]>([]);
}

function setup(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const trigger = () => el.querySelector<HTMLElement>('.cb-multiselect__trigger')!;
  const options = () => Array.from(document.querySelectorAll<HTMLElement>('.cb-multiselect__option'));
  const key = (k: string, target: HTMLElement = trigger()) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const activeOf = (combobox: HTMLElement) => document.getElementById(combobox.getAttribute('aria-activedescendant') ?? '');
  const open = () => {
    trigger().focus();
    trigger().click();
    fixture.detectChanges();
  };
  return { fixture, el, trigger, options, key, activeOf, open, host: fixture.componentInstance };
}

describe('CbMultiSelect · grupos, teclado y scroll virtual', () => {
  afterEach(() => document.body.querySelectorAll('[ng-version], .cdk-overlay-container').forEach((n) => n.remove()));

  it('el disparador anuncia la opción activa con aria-activedescendant al usar las flechas', () => {
    const { trigger, key, activeOf, open } = setup();
    open();
    expect(activeOf(trigger())!.textContent!.trim()).toBe('Bogotá');
    key('ArrowDown');
    expect(activeOf(trigger())!.textContent!.trim()).toBe('Medellín');
  });

  it('muestra los grupos con role="group" y "Seleccionar todo" marca todas las opciones habilitadas', () => {
    const { fixture, host, open } = setup();
    open();
    const groups = Array.from(document.querySelectorAll<HTMLElement>('[role="group"]'));
    expect(groups.map((g) => document.getElementById(g.getAttribute('aria-labelledby')!)!.textContent!.trim())).toEqual([
      'Colombia',
      'México',
    ]);
    const all = document.querySelector<HTMLButtonElement>('.cb-multiselect__all')!;
    expect(all.getAttribute('aria-pressed')).toBe('false');
    all.click();
    fixture.detectChanges();
    expect(host.value()).toEqual(['Bogotá', 'Medellín', 'Monterrey', 'Guadalajara']);
    expect(all.getAttribute('aria-pressed')).toBe('true');
  });

  it('Espacio y Enter marcan la opción activa sin cerrar; End salta a la última habilitada', () => {
    const { trigger, key, activeOf, host, open } = setup();
    open();
    key(' ');
    key('End');
    expect(activeOf(trigger())!.textContent!.trim()).toBe('Guadalajara');
    key('Enter');
    expect(host.value()).toEqual(['Bogotá', 'Guadalajara']);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('en el filtro, Espacio escribe en lugar de marcar y el campo es el combobox activo', () => {
    const { fixture, key, activeOf, host, open } = setup((h) => h.filter.set(true));
    open();
    const input = document.querySelector<HTMLInputElement>('.cb-multiselect__filter-input')!;
    expect(input.getAttribute('role')).toBe('combobox');
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    input.dispatchEvent(space);
    fixture.detectChanges();
    expect(space.defaultPrevented).toBe(false);
    expect(host.value()).toEqual([]);

    input.value = 'guada';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    key('ArrowDown', input);
    expect(activeOf(input)!.textContent!.trim()).toBe('Guadalajara');
  });

  it('teclear sobre el disparador salta a la opción que empieza por lo escrito', () => {
    const { trigger, key, activeOf } = setup();
    trigger().focus();
    key('m');
    expect(activeOf(trigger())!.textContent!.trim()).toBe('Medellín');
    key('m');
    expect(activeOf(trigger())!.textContent!.trim()).toBe('Monterrey');
  });

  it('con scroll virtual pinta solo las opciones visibles y conserva la selección', () => {
    const { fixture, options, key, trigger, activeOf, host, open } = setup((h) => {
      h.group.set(false);
      h.virtual.set(true);
      h.options.set(Array.from({ length: 3000 }, (_, i) => ({ label: `Ciudad ${i + 1}` })));
    });
    open();
    expect(options().length).toBeLessThan(20);
    expect(options()[0].getAttribute('aria-setsize')).toBe('3000');
    expect(document.querySelector<HTMLElement>('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('true');
    key('End');
    key('Enter');
    fixture.detectChanges();
    expect(activeOf(trigger())!.getAttribute('aria-posinset')).toBe('3000');
    expect(host.value()).toEqual(['Ciudad 3000']);
  });
});
