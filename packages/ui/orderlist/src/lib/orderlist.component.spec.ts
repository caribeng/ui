import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CbOrderList, CbOrderListItemTemplate, type CbOrderListReorderEvent } from './orderlist.component';

@Component({
  imports: [CbOrderList, CbOrderListItemTemplate],
  template: `
    <cb-orderlist [(value)]="items" [header]="header()" (reorder)="onReorder($event)">
      @if (custom()) {
        <ng-template cbOrderListItem let-item let-i="index">{{ i + 1 }}. {{ item }}</ng-template>
      }
    </cb-orderlist>
  `,
})
class HostComponent {
  items = signal<readonly unknown[]>(['A', 'B', 'C', 'B']);
  header = signal('');
  custom = signal(false);
  onReorder = vi.fn<(e: CbOrderListReorderEvent) => void>();
}

describe('CbOrderList', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const options = () => Array.from(el.querySelectorAll<HTMLElement>('[role="option"]'));
    const btn = (label: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
    const key = async (k: string, altKey = false) => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, altKey, bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, el, options, btn, key, host: fixture.componentInstance };
  }

  it('mueve el elemento seleccionado con los botones y emite reorder', () => {
    const { fixture, options, btn, host } = setup();
    expect(btn('Subir').disabled).toBe(true);
    options()[2].click(); // C
    fixture.detectChanges();
    btn('Subir').click();
    fixture.detectChanges();
    expect(host.items()).toEqual(['A', 'C', 'B', 'B']);
    expect(host.onReorder).toHaveBeenCalledWith(expect.objectContaining({ from: 2, to: 1 }));
    btn('Mover al inicio').click();
    fixture.detectChanges();
    expect(host.items()).toEqual(['C', 'A', 'B', 'B']);
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    btn('Mover al final').click();
    fixture.detectChanges();
    expect(host.items()).toEqual(['A', 'B', 'B', 'C']);
  });

  it('distingue elementos repetidos (selección por posición)', () => {
    const { fixture, options, btn, host } = setup();
    options()[3].click(); // la segunda "B"
    fixture.detectChanges();
    btn('Mover al inicio').click();
    fixture.detectChanges();
    expect(host.items()).toEqual(['B', 'A', 'B', 'C']);
    expect(host.onReorder).toHaveBeenCalledWith(expect.objectContaining({ from: 3, to: 0 }));
  });

  it('navega, selecciona y mueve con el teclado (el foco sigue al elemento movido)', async () => {
    const { options, key, host } = setup();
    options()[0].focus();
    await key('ArrowDown');
    expect(document.activeElement).toBe(options()[1]);
    await key(' ');
    expect(options()[1].getAttribute('aria-selected')).toBe('true');
    await key('ArrowDown', true); // Alt + ↓
    expect(host.items()).toEqual(['A', 'C', 'B', 'B']);
    expect(options()[2].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(options()[2]);
  });

  it('se nombra con header o con la etiqueta del idioma', () => {
    const { fixture, el, host } = setup();
    expect(el.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Lista ordenable');
    host.header.set('Prioridades');
    fixture.detectChanges();
    const list = el.querySelector('[role="listbox"]')!;
    expect(document.getElementById(list.getAttribute('aria-labelledby')!)!.textContent).toBe('Prioridades');
  });

  it('usa la plantilla de elemento', () => {
    const { fixture, options, host } = setup();
    host.custom.set(true);
    fixture.detectChanges();
    expect(options()[0].textContent!.trim()).toBe('1. A');
  });
});
