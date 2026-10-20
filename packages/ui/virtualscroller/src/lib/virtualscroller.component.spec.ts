import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbVirtualItemTemplate, CbVirtualScroller } from './virtualscroller.component';

@Component({
  imports: [CbVirtualScroller, CbVirtualItemTemplate],
  template: `
    <cb-virtualscroller [items]="items" [itemSize]="40" [viewportHeight]="200" [buffer]="2" ariaLabel="Filas">
      @if (custom()) {
        <ng-template cbVirtualItem let-item let-i="index">#{{ i }} {{ item }}</ng-template>
      }
    </cb-virtualscroller>
  `,
})
class HostComponent {
  items = Array.from({ length: 1000 }, (_, i) => `Fila ${i + 1}`);
  custom = signal(false);
}

describe('CbVirtualScroller', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const items = () => Array.from(el.querySelectorAll<HTMLElement>('[role="listitem"]'));
    const viewport = el.querySelector<HTMLElement>('[role="list"]')!;
    return { fixture, items, viewport };
  }

  it('pinta solo lo visible más el margen, no los 1000 elementos', () => {
    const { items } = setup();
    // 200 / 40 = 5 visibles + 2 de margen inferior.
    expect(items().length).toBe(7);
    expect(items()[0].textContent!.trim()).toBe('Fila 1');
  });

  it('expone el total y la posición de cada elemento', () => {
    const { items, viewport } = setup();
    expect(viewport.getAttribute('aria-label')).toBe('Filas');
    expect(items()[0].getAttribute('aria-setsize')).toBe('1000');
    expect(items()[0].getAttribute('aria-posinset')).toBe('1');
  });

  it('actualiza la ventana al hacer scroll', () => {
    const { fixture, items, viewport } = setup();
    viewport.scrollTop = 4000; // fila 101 arriba
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(items()[0].getAttribute('aria-posinset')).toBe('99'); // 100 - 2 de margen + 1
    expect(items().some((i) => i.textContent!.trim() === 'Fila 101')).toBe(true);
  });

  it('usa la plantilla con el índice real del elemento', () => {
    const { fixture, items } = setup();
    fixture.componentInstance.custom.set(true);
    fixture.detectChanges();
    expect(items()[0].textContent!.trim()).toBe('#0 Fila 1');
  });
});
