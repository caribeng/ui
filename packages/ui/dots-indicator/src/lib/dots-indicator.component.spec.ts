import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbDotsIndicator } from './dots-indicator.component';

@Component({
  imports: [CbDotsIndicator],
  template: `<cb-dots-indicator [count]="count()" [(activeIndex)]="active" />`,
})
class HostComponent {
  count = signal(3);
  active = signal(0);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const dots = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const key = (k: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, dots, key, host: fixture.componentInstance };
}

describe('CbDotsIndicator', () => {
  it('renderiza un punto por página dentro de un tablist con nombre', () => {
    const { el, dots } = setup();
    expect(el.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBeTruthy();
    expect(dots()).toHaveLength(3);
    expect(dots()[1].getAttribute('aria-label')).toContain('2');
    el.remove();
  });

  it('marca el activo y solo él entra en el orden de tabulación', () => {
    const { fixture, el, dots, host } = setup();
    expect(dots().map((d) => d.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(dots().map((d) => d.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    dots()[2].click();
    fixture.detectChanges();
    expect(host.active()).toBe(2);
    expect(dots()[2].classList).toContain('cb-dots-indicator__dot--active');
    el.remove();
  });

  it('flechas (circular), Inicio y Fin cambian de página y mueven el foco', () => {
    const { el, dots, key, host } = setup();
    dots()[0].focus();
    key('ArrowRight');
    expect(host.active()).toBe(1);
    expect(document.activeElement).toBe(dots()[1]);
    key('End');
    expect(host.active()).toBe(2);
    key('ArrowRight');
    expect(host.active()).toBe(0);
    key('ArrowLeft');
    expect(host.active()).toBe(2);
    key('Home');
    expect(document.activeElement).toBe(dots()[0]);
    el.remove();
  });

  it('muestra al menos un punto', () => {
    const { fixture, el, dots } = setup();
    fixture.componentInstance.count.set(0);
    fixture.detectChanges();
    expect(dots()).toHaveLength(1);
    el.remove();
  });
});
