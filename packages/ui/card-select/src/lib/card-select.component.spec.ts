import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardSelect } from './card-select.component';

@Component({
  imports: [CbCardSelect],
  template: `<cb-card-select label="Bancos" [items]="items" [(selected)]="selected" (selectionChange)="changes.push($event)" />`,
})
class HostComponent {
  items = ['Bancolombia', 'Nequi', 'Davivienda'];
  selected = signal<string | null>(null);
  changes: string[] = [];
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const options = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="option"]'));
  const search = () => el.querySelector<HTMLInputElement>('.cb-card-select__search')!;
  const filter = (q: string) => {
    search().value = q;
    search().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const key = (k: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, options, search, filter, key, host: fixture.componentInstance };
}

describe('CbCardSelect', () => {
  it('es un listbox nombrado con un buscador etiquetado', () => {
    const { el, options, search } = setup();
    expect(el.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Bancos');
    expect(search().getAttribute('aria-label')).toBeTruthy();
    expect(options().map((o) => o.textContent!.trim())).toEqual(['Bancolombia', 'Nequi', 'Davivienda']);
    el.remove();
  });

  it('elegir una opción la marca, actualiza el modelo y emite selectionChange', () => {
    const { fixture, el, options, host } = setup();
    options()[1].click();
    fixture.detectChanges();
    expect(host.selected()).toBe('Nequi');
    expect(host.changes).toEqual(['Nequi']);
    expect(options()[1].getAttribute('aria-selected')).toBe('true');
    expect(options()[0].getAttribute('aria-selected')).toBe('false');
    el.remove();
  });

  it('filtra sin distinguir mayúsculas y avisa cuando no hay resultados', () => {
    const { el, options, filter } = setup();
    filter('DAVI');
    expect(options().map((o) => o.textContent!.trim())).toEqual(['Davivienda']);
    filter('zzz');
    expect(options()).toHaveLength(0);
    expect(el.querySelector('.cb-card-select__empty')!.textContent!.trim()).toBe('Sin resultados');
    el.remove();
  });

  it('solo una opción entra en el orden de tabulación: la elegida o la primera', () => {
    const { fixture, el, options, host } = setup();
    expect(options().map((o) => o.tabIndex)).toEqual([0, -1, -1]);
    host.selected.set('Davivienda');
    fixture.detectChanges();
    expect(options().map((o) => o.tabIndex)).toEqual([-1, -1, 0]);
    el.remove();
  });

  it('flechas (circular), Inicio y Fin mueven el foco entre las opciones', () => {
    const { el, options, key } = setup();
    options()[0].focus();
    key('ArrowDown');
    expect(document.activeElement).toBe(options()[1]);
    expect(options()[1].tabIndex).toBe(0);
    key('End');
    expect(document.activeElement).toBe(options()[2]);
    key('ArrowDown');
    expect(document.activeElement).toBe(options()[0]);
    key('ArrowUp');
    expect(document.activeElement).toBe(options()[2]);
    key('Home');
    expect(document.activeElement).toBe(options()[0]);
    el.remove();
  });
});
