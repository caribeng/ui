import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CbInfiniteScroll, type CbLoadMoreSource } from './infinite-scroll.component';

/** IntersectionObserver de prueba: `intersect()` simula que el final de la lista entra en pantalla. */
class FakeObserver {
  static last: FakeObserver | null = null;
  constructor(private readonly cb: IntersectionObserverCallback) {
    FakeObserver.last = this;
  }
  observe(): void {}
  disconnect(): void {}
  intersect(visible = true): void {
    this.cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

@Component({
  imports: [CbInfiniteScroll],
  template: `
    <cb-infinite-scroll
      [loading]="loading()"
      [hasMore]="hasMore()"
      [error]="error()"
      [count]="items().length"
      [mode]="mode()"
      [autoLimit]="2"
      (loadMore)="onLoad($event)"
    >
      <ul>
        @for (i of items(); track i) {
          <li>Elemento {{ i }}</li>
        }
      </ul>
    </cb-infinite-scroll>
  `,
})
class HostComponent {
  items = signal(Array.from({ length: 10 }, (_, i) => i + 1));
  loading = signal(false);
  hasMore = signal(true);
  error = signal(false);
  mode = signal<'auto' | 'button'>('auto');
  sources: CbLoadMoreSource[] = [];
  onLoad(source: CbLoadMoreSource) {
    this.sources.push(source);
    this.loading.set(true);
  }
  /** Termina la carga añadiendo `n` elementos. */
  finish(n = 10) {
    const from = this.items().length;
    this.items.update((l) => [...l, ...Array.from({ length: n }, (_, i) => from + i + 1)]);
    this.loading.set(false);
  }
}

describe('CbInfiniteScroll', () => {
  const original = globalThis.IntersectionObserver;
  beforeEach(() => {
    globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });
  afterEach(() => {
    globalThis.IntersectionObserver = original;
    FakeObserver.last = null;
  });

  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;
    const live = () => el.querySelector('.cb-is__sr')!.textContent!.trim();
    const button = (text: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim() === text);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, el, host, live, button, settle };
  }

  it('al llegar al final pide más, una sola vez mientras carga, y marca aria-busy', async () => {
    const { el, host, live, settle } = await setup();
    FakeObserver.last!.intersect();
    FakeObserver.last!.intersect();
    await settle();
    expect(host.sources).toEqual(['scroll']);
    expect(el.querySelector('cb-infinite-scroll')!.getAttribute('aria-busy')).toBe('true');
    expect(live()).toBe('Cargando más resultados…');
  });

  it('anuncia cuántos elementos llegaron', async () => {
    const { host, live, settle } = await setup();
    FakeObserver.last!.intersect();
    await settle();
    // Los nuevos empujan el final fuera de la pantalla.
    FakeObserver.last!.intersect(false);
    host.finish();
    await settle();
    expect(live()).toBe('10 resultados más, 20 en total');
    expect(host.sources).toEqual(['scroll']);
  });

  it('si el final sigue a la vista vuelve a pedir, hasta autoLimit; luego, el botón', async () => {
    const { host, button, settle } = await setup();
    FakeObserver.last!.intersect();
    await settle();
    host.finish(2);
    await settle();
    expect(host.sources).toEqual(['scroll', 'scroll']);
    host.finish(2);
    await settle();
    // autoLimit = 2: no hay una tercera automática; toca el botón.
    expect(host.sources.length).toBe(2);
    expect(button('Cargar más')).toBeTruthy();
    button('Cargar más')!.click();
    host.finish(2);
    await settle();
    // Tras usar el botón, vuelve a cargar solo.
    expect(host.sources).toEqual(['scroll', 'scroll', 'button', 'scroll']);
  });

  it('con el botón, el foco va al primer elemento nuevo', async () => {
    const { el, host, button, settle } = await setup();
    host.mode.set('button');
    await settle();
    button('Cargar más')!.click();
    await settle();
    expect(host.sources).toEqual(['button']);
    host.finish();
    await settle();
    const first = el.querySelectorAll('li')[10];
    expect(first.textContent).toContain('Elemento 11');
    expect(first.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(first);
  });

  it('si falla, avisa y ofrece reintentar', async () => {
    const { el, host, live, button, settle } = await setup();
    FakeObserver.last!.intersect();
    await settle();
    host.error.set(true);
    host.loading.set(false);
    await settle();
    expect(el.querySelector('.cb-is__error')!.textContent).toBe('No se pudieron cargar más resultados.');
    expect(live()).toBe('No se pudieron cargar más resultados.');
    host.error.set(false);
    button('Reintentar')!.click();
    expect(host.sources).toEqual(['scroll', 'retry']);
  });

  it('sin más elementos muestra el final y no pide nada', async () => {
    const { el, host, settle } = await setup();
    host.hasMore.set(false);
    await settle();
    FakeObserver.last!.intersect();
    expect(host.sources).toEqual([]);
    expect(el.querySelector('.cb-is__end')!.textContent).toBe('No hay más resultados');
  });
});

describe('CbInfiniteScroll sin IntersectionObserver', () => {
  it('muestra el botón como alternativa', async () => {
    const original = globalThis.IntersectionObserver;
    // @ts-expect-error: navegador sin la API
    delete globalThis.IntersectionObserver;
    try {
      TestBed.configureTestingModule({ imports: [HostComponent] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const btn = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Cargar más');
      expect(btn).toBeTruthy();
    } finally {
      globalThis.IntersectionObserver = original;
    }
  });
});
