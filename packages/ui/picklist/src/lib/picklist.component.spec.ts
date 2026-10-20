import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CbPickList, CbPickListItemTemplate, type CbPickListMoveEvent } from './picklist.component';

@Component({
  imports: [CbPickList, CbPickListItemTemplate],
  template: `
    <cb-picklist [(source)]="source" [(target)]="target" (moved)="onMove($event)">
      @if (custom()) {
        <ng-template cbPickListItem let-item let-list="list">{{ list }}:{{ item }}</ng-template>
      }
    </cb-picklist>
  `,
})
class HostComponent {
  source = signal<readonly unknown[]>(['A', 'B', 'C']);
  target = signal<readonly unknown[]>(['X']);
  custom = signal(false);
  onMove = vi.fn<(e: CbPickListMoveEvent) => void>();
}

describe('CbPickList', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const opts = (side: 'source' | 'target') =>
      Array.from(el.querySelectorAll<HTMLElement>(`[data-side="${side}"] [role="option"]`));
    const btn = (label: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
    const key = (k: string) => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, el, opts, btn, key, host: fixture.componentInstance };
  }

  it('transfiere los elementos marcados y emite moved', () => {
    const { fixture, opts, btn, host } = setup();
    expect(btn('Mover a seleccionados').disabled).toBe(true);
    opts('source')[0].click();
    opts('source')[2].click();
    fixture.detectChanges();
    btn('Mover a seleccionados').click();
    fixture.detectChanges();
    expect(host.source()).toEqual(['B']);
    expect(host.target()).toEqual(['X', 'A', 'C']);
    expect(host.onMove).toHaveBeenCalledWith({ to: 'target', items: ['A', 'C'] });
  });

  it('mueve todos en ambos sentidos', () => {
    const { fixture, btn, host } = setup();
    btn('Mover todos a seleccionados').click();
    fixture.detectChanges();
    expect(host.source()).toEqual([]);
    expect(host.target()).toEqual(['X', 'A', 'B', 'C']);
    btn('Devolver todos a disponibles').click();
    fixture.detectChanges();
    expect(host.target()).toEqual([]);
    expect(host.source()).toEqual(['X', 'A', 'B', 'C']);
  });

  it('el doble clic transfiere un elemento', () => {
    const { fixture, opts, host } = setup();
    opts('target')[0].dispatchEvent(new MouseEvent('dblclick'));
    fixture.detectChanges();
    expect(host.target()).toEqual([]);
    expect(host.source()).toEqual(['A', 'B', 'C', 'X']);
  });

  it('marca con Espacio y transfiere con Enter', () => {
    const { opts, key, host } = setup();
    opts('source')[0].focus();
    key('ArrowDown');
    expect(document.activeElement).toBe(opts('source')[1]);
    key(' ');
    expect(opts('source')[1].getAttribute('aria-selected')).toBe('true');
    key('Enter');
    expect(host.target()).toEqual(['X', 'B']);
  });

  it('nombra cada lista con su cabecera y usa la plantilla', () => {
    const { fixture, el, opts, host } = setup();
    const list = el.querySelector('[data-side="source"]')!;
    expect(document.getElementById(list.getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe('Disponibles');
    host.custom.set(true);
    fixture.detectChanges();
    expect(opts('target')[0].textContent!.trim()).toBe('target:X');
  });
});
