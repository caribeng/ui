import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbGalleria, CbGalleriaItem } from './galleria.component';

@Component({
  imports: [CbGalleria],
  template: `<cb-galleria [value]="images()" [(activeIndex)]="idx" [circular]="circular()" />`,
})
class HostComponent {
  idx = signal(0);
  circular = signal(true);
  images = signal<CbGalleriaItem[]>([
    { itemImageSrc: 'img1.jpg', title: 'Foto 1' },
    { itemImageSrc: 'img2.jpg', title: 'Foto 2', alt: 'Playa al atardecer' },
    { itemImageSrc: 'img2.jpg' },
  ]);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const thumbs = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-galleria__thumb'));
  const prev = () => el.querySelector<HTMLButtonElement>('.cb-galleria__nav--prev');
  const next = () => el.querySelector<HTMLButtonElement>('.cb-galleria__nav--next');
  const main = () => el.querySelector<HTMLImageElement>('.cb-galleria__main-img')!;
  const click = (b: HTMLElement) => {
    b.click();
    fixture.detectChanges();
  };
  const key = (k: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, thumbs, prev, next, main, click, key };
}

describe('CbGalleria', () => {
  it('cambia la imagen activa al hacer clic en una miniatura', () => {
    const { fixture, el, thumbs, click } = setup();
    expect(thumbs().length).toBe(3);
    click(thumbs()[1]);
    expect(fixture.componentInstance.idx()).toBe(1);
    expect(el.querySelector('.cb-galleria__caption')?.textContent).toBe('Foto 2');
    el.remove();
  });

  it('la imagen principal usa alt o title; las miniaturas se nombran una sola vez', () => {
    const { el, thumbs, main, click } = setup();
    expect(main().alt).toBe('Foto 1');
    click(thumbs()[1]);
    expect(main().alt).toBe('Playa al atardecer');
    expect(thumbs().map((t) => t.getAttribute('aria-label'))).toEqual(['Foto 1', 'Foto 2', 'Miniatura 3']);
    expect(thumbs().every((t) => t.querySelector('img')!.getAttribute('alt') === '')).toBe(true);
    el.remove();
  });

  it('las flechas navegan y dan la vuelta en modo circular', () => {
    const { fixture, el, prev, next, click } = setup();
    expect(prev()!.getAttribute('aria-label')).toBeTruthy();
    click(prev()!);
    expect(fixture.componentInstance.idx()).toBe(2);
    click(next()!);
    expect(fixture.componentInstance.idx()).toBe(0);
    el.remove();
  });

  it('sin circular deshabilita las flechas en los extremos', () => {
    const { fixture, el, prev, next, click } = setup();
    fixture.componentInstance.circular.set(false);
    fixture.detectChanges();
    expect(prev()!.disabled).toBe(true);
    click(next()!);
    click(next()!);
    expect(next()!.disabled).toBe(true);
    el.remove();
  });

  it('miniaturas con un solo tabindex activo, flechas, Inicio y Fin', () => {
    const { fixture, el, thumbs, key } = setup();
    expect(thumbs().map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    thumbs()[0].focus();
    key('ArrowRight');
    expect(fixture.componentInstance.idx()).toBe(1);
    expect(document.activeElement).toBe(thumbs()[1]);
    key('End');
    expect(document.activeElement).toBe(thumbs()[2]);
    key('ArrowRight');
    expect(fixture.componentInstance.idx()).toBe(0);
    key('ArrowLeft');
    expect(fixture.componentInstance.idx()).toBe(2);
    key('Home');
    expect(thumbs()[0].getAttribute('aria-selected')).toBe('true');
    el.remove();
  });

  it('con una sola imagen no muestra flechas ni miniaturas', () => {
    const { fixture, el, thumbs, prev } = setup();
    fixture.componentInstance.images.set([{ itemImageSrc: 'solo.jpg', alt: 'Sola' }]);
    fixture.detectChanges();
    expect(prev()).toBeNull();
    expect(thumbs()).toHaveLength(0);
    el.remove();
  });
});
