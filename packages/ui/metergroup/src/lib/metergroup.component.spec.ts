import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbMeterGroup, CbMeterItem } from './metergroup.component';

@Component({
  imports: [CbMeterGroup],
  template: `<cb-meter-group [values]="items()" [max]="max()" ariaLabel="Almacenamiento" />`,
})
class HostComponent {
  max = signal(100);
  items = signal<CbMeterItem[]>([
    { label: 'Apps', value: 25 },
    { label: 'Datos', value: 40, color: 'rebeccapurple' },
  ]);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return {
    fixture,
    el,
    host: el.querySelector('cb-meter-group')!,
    bars: () => Array.from(el.querySelectorAll<HTMLElement>('.cb-meter-group__bar')),
    values: () => Array.from(el.querySelectorAll('.cb-meter-group__value')).map((v) => v.textContent),
  };
}

describe('CbMeterGroup', () => {
  it('renderiza segmentos y elementos de leyenda', () => {
    const { el, bars } = setup();
    expect(bars().length).toBe(2);
    expect(el.querySelectorAll('.cb-meter-group__item').length).toBe(2);
    expect(bars()[1].style.background).toBe('rebeccapurple');
  });

  it('es un meter válido: nombre, mínimo, máximo, valor actual y desglose legible', () => {
    const { host } = setup();
    expect(host.getAttribute('role')).toBe('meter');
    expect(host.getAttribute('aria-label')).toBe('Almacenamiento');
    expect(host.getAttribute('aria-valuemin')).toBe('0');
    expect(host.getAttribute('aria-valuemax')).toBe('100');
    expect(host.getAttribute('aria-valuenow')).toBe('65');
    expect(host.getAttribute('aria-valuetext')).toBe('Apps 25%, Datos 40%');
  });

  it('calcula los porcentajes respecto a max, también en la leyenda', () => {
    const { fixture, bars, values, host } = setup();
    fixture.componentInstance.max.set(200);
    fixture.detectChanges();
    expect(bars().map((b) => b.style.width)).toEqual(['12.5%', '20%']);
    expect(values()).toEqual(['(12.5%)', '(20%)']);
    expect(host.getAttribute('aria-valuetext')).toBe('Apps 12.5%, Datos 20%');
  });

  it('limita cada segmento entre 0 % y 100 %', () => {
    const { fixture, bars } = setup();
    fixture.componentInstance.items.set([
      { label: 'Negativo', value: -10 },
      { label: 'Excedido', value: 250 },
    ]);
    fixture.detectChanges();
    expect(bars().map((b) => b.style.width)).toEqual(['0%', '100%']);
  });
});
