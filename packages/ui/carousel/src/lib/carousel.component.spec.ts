import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCarousel, CbCarouselItem } from './carousel.component';

@Component({
  imports: [CbCarousel],
  template: `<cb-carousel [items]="items()" [(page)]="page" [circular]="circular()" ariaLabel="Ofertas" />`,
})
class HostComponent {
  page = signal(0);
  circular = signal(true);
  items = signal<CbCarouselItem[]>([
    { title: 'Slide 1', description: 'Uno', badge: 'Nuevo' },
    { title: 'Slide 2', description: 'Dos' },
    { title: 'Slide 2', description: 'Título repetido' },
  ]);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const title = () => el.querySelector('.cb-carousel__title')?.textContent;
  const prev = () => el.querySelector<HTMLButtonElement>('.cb-carousel__nav--prev')!;
  const next = () => el.querySelector<HTMLButtonElement>('.cb-carousel__nav--next')!;
  const dots = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-carousel__dot'));
  const click = (b: HTMLElement) => {
    b.click();
    fixture.detectChanges();
  };
  const key = (k: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, title, prev, next, dots, click, key };
}

describe('CbCarousel', () => {
  it('navega entre diapositivas con los botones siguiente y anterior', () => {
    const { fixture, el, title, next, prev, click } = setup();
    expect(title()).toBe('Slide 1');
    click(next());
    expect(fixture.componentInstance.page()).toBe(1);
    expect(title()).toBe('Slide 2');
    click(prev());
    expect(title()).toBe('Slide 1');
    el.remove();
  });

  it('es una región con nombre y cada diapositiva se nombra por su posición', () => {
    const { el, click, next } = setup();
    const host = el.querySelector('cb-carousel')!;
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-roledescription')).toBe('carousel');
    expect(host.getAttribute('aria-label')).toBe('Ofertas');
    const slide = () => el.querySelector('.cb-carousel__slide')!;
    expect(slide().getAttribute('aria-roledescription')).toBe('slide');
    expect(slide().getAttribute('aria-label')).toBe('1 de 3');
    click(next());
    expect(slide().getAttribute('aria-label')).toBe('2 de 3');
    el.remove();
  });

  it('circular da la vuelta; sin circular deshabilita los extremos', () => {
    const { fixture, el, title, prev, next, click } = setup();
    click(prev());
    expect(fixture.componentInstance.page()).toBe(2);

    fixture.componentInstance.circular.set(false);
    fixture.componentInstance.page.set(0);
    fixture.detectChanges();
    expect(prev().disabled).toBe(true);
    click(next());
    click(next());
    expect(next().disabled).toBe(true);
    expect(title()).toBe('Slide 2');
    el.remove();
  });

  it('los indicadores son pestañas con un solo tabindex activo y admiten títulos repetidos', () => {
    const { el, dots, click } = setup();
    expect(dots()).toHaveLength(3);
    expect(dots().map((d) => d.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    expect(dots()[0].getAttribute('aria-selected')).toBe('true');
    click(dots()[2]);
    expect(el.querySelector('.cb-carousel__desc')!.textContent).toBe('Título repetido');
    expect(dots().map((d) => d.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    el.remove();
  });

  it('flechas, Inicio y Fin en los indicadores cambian de diapositiva y mueven el foco', () => {
    const { fixture, el, dots, key } = setup();
    dots()[0].focus();
    key('ArrowRight');
    expect(fixture.componentInstance.page()).toBe(1);
    expect(document.activeElement).toBe(dots()[1]);
    key('End');
    expect(document.activeElement).toBe(dots()[2]);
    key('ArrowRight');
    expect(fixture.componentInstance.page()).toBe(0);
    key('ArrowLeft');
    expect(fixture.componentInstance.page()).toBe(2);
    key('Home');
    expect(document.activeElement).toBe(dots()[0]);
    el.remove();
  });

  it('con una sola diapositiva no muestra indicadores', () => {
    const { fixture, el, dots } = setup();
    fixture.componentInstance.items.set([{ title: 'Única' }]);
    fixture.detectChanges();
    expect(dots()).toHaveLength(0);
    el.remove();
  });
});
