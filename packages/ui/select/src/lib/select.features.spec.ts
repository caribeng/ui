import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbSelect } from './select.component';

const PAISES = [
  { label: 'Colombia', items: [{ label: 'Bogotá' }, { label: 'Medellín' }, { label: 'Cali', disabled: true }] },
  { label: 'México', items: [{ label: 'Monterrey' }, { label: 'Guadalajara' }] },
];

const MUCHAS = Array.from({ length: 5000 }, (_, i) => ({ label: `Cliente ${i + 1}`, id: i + 1 }));

@Component({
  imports: [CbSelect],
  template: `
    <cb-select
      [options]="options()"
      [group]="group()"
      [filter]="filter()"
      [showClear]="showClear()"
      [virtualScroll]="virtual()"
      [virtualScrollItemSize]="32"
      scrollHeight="160px"
      [optionValue]="optionValue()"
      ariaLabel="Ciudad"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  options = signal<readonly unknown[]>(PAISES);
  group = signal(true);
  filter = signal(false);
  showClear = signal(false);
  virtual = signal(false);
  optionValue = signal<string | null>('label');
  value = signal<unknown>(null);
}

function setup(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const trigger = () => el.querySelector<HTMLElement>('.cb-select__trigger')!;
  const options = () => Array.from(document.querySelectorAll<HTMLElement>('.cb-select__option'));
  const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
  const key = (k: string, target: HTMLElement = trigger()) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const active = () => document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '');
  return { fixture, el, trigger, options, listbox, key, active, host: fixture.componentInstance };
}

describe('CbSelect · grupos, búsqueda al teclear, limpiar y scroll virtual', () => {
  afterEach(() => document.body.querySelectorAll('[ng-version], .cdk-overlay-container').forEach((n) => n.remove()));

  describe('grupos', () => {
    it('muestra cada grupo como role="group" nombrado por su título', () => {
      const { fixture, trigger, listbox } = setup();
      trigger().click();
      fixture.detectChanges();
      const groups = Array.from(listbox()!.querySelectorAll<HTMLElement>('[role="group"]'));
      expect(groups).toHaveLength(2);
      const label = document.getElementById(groups[0].getAttribute('aria-labelledby')!)!;
      expect(label.textContent!.trim()).toBe('Colombia');
      expect(label.getAttribute('role')).toBe('presentation');
      expect(Array.from(groups[1].querySelectorAll('[role="option"]')).map((o) => o.textContent!.trim())).toEqual([
        'Monterrey',
        'Guadalajara',
      ]);
    });

    it('las flechas recorren todas las opciones entre grupos y saltan las deshabilitadas', () => {
      const { trigger, key, active } = setup();
      trigger().focus();
      key('ArrowDown');
      expect(active()!.textContent!.trim()).toBe('Bogotá');
      key('ArrowDown');
      key('ArrowDown');
      expect(active()!.textContent!.trim()).toBe('Monterrey');
      key('End');
      expect(active()!.textContent!.trim()).toBe('Guadalajara');
    });

    it('elegir una opción agrupada muestra su etiqueta', () => {
      const { fixture, el, options, host } = setup();
      el.querySelector<HTMLElement>('.cb-select__trigger')!.click();
      fixture.detectChanges();
      options()[3].click();
      fixture.detectChanges();
      expect(host.value()).toBe('Monterrey');
      expect(el.querySelector('.cb-select__label')!.textContent!.trim()).toBe('Monterrey');
    });

    it('el filtro oculta los grupos sin coincidencias e ignora tildes', () => {
      const { fixture, trigger } = setup((h) => h.filter.set(true));
      trigger().click();
      fixture.detectChanges();
      const input = document.querySelector<HTMLInputElement>('.cb-select__filter-input')!;
      input.value = 'medellin';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(document.querySelectorAll('[role="group"]')).toHaveLength(1);
      expect(Array.from(document.querySelectorAll('.cb-select__option')).map((o) => o.textContent!.trim())).toEqual([
        'Medellín',
      ]);
    });
  });

  it('con filtro, el campo de búsqueda es el combobox que anuncia la opción activa', () => {
    const { fixture, trigger, key } = setup((h) => h.filter.set(true));
    trigger().click();
    fixture.detectChanges();
    const input = document.querySelector<HTMLInputElement>('.cb-select__filter-input')!;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')!.id);
    expect(trigger().hasAttribute('aria-activedescendant')).toBe(false);
    key('ArrowDown', input);
    const activeId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)!.textContent!.trim()).toBe('Medellín');
  });

  describe('búsqueda al teclear', () => {
    it('teclear abre la lista y salta a la opción que empieza por lo escrito', () => {
      const { trigger, key, active } = setup();
      trigger().focus();
      key('g');
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(active()!.textContent!.trim()).toBe('Guadalajara');
    });

    it('varias letras seguidas refinan; repetir la primera letra pasa a la siguiente coincidencia', () => {
      const { trigger, key, active } = setup((h) => {
        h.group.set(false);
        h.options.set([{ label: 'Medellín' }, { label: 'Montería' }, { label: 'Manizales' }, { label: 'Monterrey' }]);
      });
      trigger().focus();
      key('m');
      expect(active()!.textContent!.trim()).toBe('Medellín');
      key('o');
      key('n');
      key('t');
      key('e');
      key('r');
      key('r');
      expect(active()!.textContent!.trim()).toBe('Monterrey');
    });

    it('con filtro, teclear sobre el disparador empieza a escribir en el filtro', () => {
      const { fixture, trigger, key } = setup((h) => h.filter.set(true));
      trigger().focus();
      key('b');
      fixture.detectChanges();
      expect(document.querySelector<HTMLInputElement>('.cb-select__filter-input')!.value).toBe('b');
      expect(Array.from(document.querySelectorAll('.cb-select__option')).map((o) => o.textContent!.trim())).toEqual([
        'Bogotá',
      ]);
    });
  });

  describe('showClear', () => {
    it('solo aparece con un valor, lo vacía y devuelve el foco al disparador', () => {
      const { fixture, el, trigger, host } = setup((h) => h.showClear.set(true));
      expect(el.querySelector('.cb-select__clear')).toBeNull();
      host.value.set('Bogotá');
      fixture.detectChanges();
      const clear = el.querySelector<HTMLButtonElement>('.cb-select__clear')!;
      expect(clear.getAttribute('aria-label')).toBe('Limpiar');
      clear.click();
      fixture.detectChanges();
      expect(host.value()).toBeNull();
      expect(el.querySelector('.cb-select__clear')).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });
  });

  describe('scroll virtual', () => {
    function setupVirtual() {
      return setup((h) => {
        h.group.set(false);
        h.virtual.set(true);
        h.optionValue.set('id');
        h.options.set(MUCHAS);
      });
    }

    it('con 5000 opciones solo pinta las visibles y expone setsize / posinset', () => {
      const { fixture, trigger, options, listbox } = setupVirtual();
      trigger().click();
      fixture.detectChanges();
      expect(listbox()!.style.height).toBe('160px');
      expect(options().length).toBeLessThan(20);
      expect(options()[0].getAttribute('aria-setsize')).toBe('5000');
      expect(options()[0].getAttribute('aria-posinset')).toBe('1');
    });

    it('al desplazarse pinta la ventana correspondiente', () => {
      const { fixture, trigger, options, listbox } = setupVirtual();
      trigger().click();
      fixture.detectChanges();
      listbox()!.scrollTop = 32 * 1000;
      listbox()!.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      const labels = options().map((o) => o.textContent!.trim());
      expect(labels).toContain('Cliente 1001');
      expect(labels).not.toContain('Cliente 1');
    });

    it('End lleva la última opción a la vista y queda como opción activa', () => {
      const { trigger, key, active, listbox } = setupVirtual();
      trigger().focus();
      key('ArrowDown');
      key('End');
      expect(active()!.textContent!.trim()).toBe('Cliente 5000');
      expect(listbox()!.scrollTop).toBe(5000 * 32 - 160);
    });

    it('elegir una opción virtual escribe su valor', () => {
      const { fixture, trigger, key, host } = setupVirtual();
      trigger().focus();
      key('ArrowDown');
      key('ArrowDown');
      key('Enter');
      fixture.detectChanges();
      expect(host.value()).toBe(2);
    });
  });
});
