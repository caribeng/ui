import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CbImageCropper } from './image-cropper.component';
import { outputSize, previewStyle, type CbCropRect } from './crop-geometry';

@Component({
  imports: [CbImageCropper],
  template: `
    <cb-image-cropper
      [src]="src()"
      [(rect)]="rect"
      [(ratio)]="ratio"
      [shape]="shape()"
      [preview]="true"
      [output]="{ maxWidth: 400 }"
      (cropError)="errors = errors + 1"
    />
  `,
})
class HostComponent {
  src = signal('');
  rect = signal<CbCropRect | null>(null);
  ratio = signal<number | null>(null);
  shape = signal<'rect' | 'circle'>('rect');
  errors = 0;
}

describe('CbImageCropper', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const box = () => el.querySelector<HTMLElement>('.cb-cropper__box')!;
    const button = (text: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim() === text)!;
    /** Pone una imagen de `w` × `h` y simula que cargó (jsdom no carga imágenes). */
    const load = (w = 800, h = 400) => {
      fixture.componentInstance.src.set('data:image/png;base64,AAAA');
      fixture.detectChanges();
      const img = el.querySelector('img')!;
      Object.defineProperty(img, 'naturalWidth', { value: w });
      Object.defineProperty(img, 'naturalHeight', { value: h });
      img.dispatchEvent(new Event('load'));
      fixture.detectChanges();
    };
    const key = (k: string, extra: KeyboardEventInit = {}) => {
      box().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...extra }));
      fixture.detectChanges();
    };
    return { fixture, el, host: fixture.componentInstance, box, button, load, key };
  }

  it('sin imagen muestra la zona para soltar y el botón de elegir', () => {
    const { el, button } = setup();
    expect(el.querySelector('.cb-cropper__empty')!.textContent).toContain('Arrastra una imagen aquí');
    expect(button('Elegir imagen')).toBeTruthy();
  });

  it('al cargar, el recuadro es un slider con su tamaño en % y en píxeles', () => {
    const { host, box, load } = setup();
    load();
    expect(box().getAttribute('role')).toBe('slider');
    expect(box().getAttribute('aria-label')).toBe('Área de recorte');
    expect(host.rect()).toEqual({ x: 0, y: 0, w: 1, h: 1 });
    // Con maxWidth 400, el recorte de 800 × 400 sale a 400 × 200.
    expect(box().getAttribute('aria-valuetext')).toBe('100 % × 100 % de la imagen (400 × 200 píxeles)');
    expect(document.getElementById(box().getAttribute('aria-describedby')!)!.textContent).toContain('Mayús + flechas');
  });

  it('una proporción fija ajusta el recuadro y queda marcada', () => {
    const { fixture, host, button, load } = setup();
    load();
    button('1:1').click();
    fixture.detectChanges();
    expect(host.ratio()).toBe(1);
    expect(host.rect()!.w).toBeCloseTo(0.5);
    expect(host.rect()!.h).toBeCloseTo(1);
    expect(button('1:1').getAttribute('aria-pressed')).toBe('true');
    expect(button('Libre').getAttribute('aria-pressed')).toBe('false');
  });

  it('las flechas mueven el recuadro y Mayús + flechas cambian su tamaño', () => {
    const { fixture, host, load, key } = setup();
    load();
    host.rect.set({ x: 0.2, y: 0.2, w: 0.4, h: 0.4 });
    fixture.detectChanges();
    key('ArrowRight');
    expect(host.rect()!.x).toBeCloseTo(0.22);
    key('ArrowDown', { ctrlKey: true });
    expect(host.rect()!.y).toBeCloseTo(0.3);
    key('ArrowLeft', { shiftKey: true });
    expect(host.rect()!.w).toBeCloseTo(0.38);
  });

  it('el recuadro no se sale de la imagen', () => {
    const { fixture, host, load, key } = setup();
    load();
    host.rect.set({ x: 0.55, y: 0, w: 0.4, h: 0.4 });
    fixture.detectChanges();
    key('ArrowRight', { ctrlKey: true });
    expect(host.rect()!.x).toBeCloseTo(0.6);
  });

  it('con forma circular el recorte es cuadrado y no hay proporciones', () => {
    const { fixture, host, el, box, load } = setup();
    host.shape.set('circle');
    fixture.detectChanges();
    load(600, 600);
    expect(box().classList).toContain('cb-cropper__box--circle');
    expect(el.querySelector('.cb-cropper__ratios')).toBeNull();
    expect(el.querySelector('.cb-cropper__preview--circle')).toBeTruthy();
    expect(host.rect()!.w).toBeCloseTo(host.rect()!.h);
  });

  it('si no se puede recortar, avisa con role="alert" y emite cropError', async () => {
    const { fixture, host, el, button, load } = setup();
    load();
    // jsdom no tiene canvas ni carga imágenes: se simula un recorte que falla (p. ej. imagen sin CORS).
    const cropper = fixture.debugElement.query((d) => d.name === 'cb-image-cropper').componentInstance as CbImageCropper;
    vi.spyOn(cropper, 'crop').mockRejectedValue(new Error('SecurityError'));
    button('Recortar').click();
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
    expect(host.errors).toBe(1);
    expect(el.querySelector('.cb-cropper__error')!.getAttribute('role')).toBe('alert');
  });

  it('soltar un archivo que no es imagen lo rechaza', async () => {
    const { fixture, el } = setup();
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [new File(['x'], 'nota.txt', { type: 'text/plain' })] } });
    el.querySelector('.cb-cropper__empty')!.dispatchEvent(drop);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.cb-cropper__error')!.textContent).toBe('El archivo no es una imagen.');
  });
});

describe('geometría del recorte', () => {
  it('outputSize reduce sin ampliar y conserva la proporción', () => {
    expect(outputSize({ x: 0, y: 0, w: 0.5, h: 1 }, 2000, 1000, { maxWidth: 500 })).toEqual({ w: 500, h: 500 });
    expect(outputSize({ x: 0, y: 0, w: 0.1, h: 0.1 }, 1000, 1000, { maxWidth: 500 })).toEqual({ w: 100, h: 100 });
  });

  it('previewStyle encuadra el recorte con el fondo', () => {
    const s = previewStyle('a.png', { x: 0.25, y: 0, w: 0.5, h: 1 });
    expect(s['background-size']).toBe('200% 100%');
    expect(s['background-position']).toBe('50% 0%');
  });
});
