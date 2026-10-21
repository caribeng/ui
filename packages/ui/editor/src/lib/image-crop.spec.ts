import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbEditor } from './editor.component';
import { clampRect, fitRatio, initialRect, resizeRect } from './image-crop';

describe('cálculo del recorte', () => {
  it('el recuadro no se sale de la imagen ni baja del tamaño mínimo', () => {
    expect(clampRect({ x: 0.9, y: -0.2, w: 0.5, h: 0.01 })).toEqual({ x: 0.5, y: 0, w: 0.5, h: 0.05 });
  });

  it('proporción 1:1 en una imagen de 800 × 400: el mayor cuadrado centrado', () => {
    const r = initialRect(1, 800, 400);
    // 400 px de lado = 0.5 del ancho y todo el alto.
    expect(r.w).toBeCloseTo(0.5);
    expect(r.h).toBeCloseTo(1);
    expect(r.x).toBeCloseTo(0.25);
  });

  it('16:9 se ajusta dentro del recuadro actual y libre lo deja igual', () => {
    const r = fitRatio({ x: 0, y: 0, w: 1, h: 1 }, 16 / 9, 1600, 1600);
    expect((r.w * 1600) / (r.h * 1600)).toBeCloseTo(16 / 9);
    expect(fitRatio({ x: 0.1, y: 0.1, w: 0.3, h: 0.3 }, null, 100, 100)).toEqual({ x: 0.1, y: 0.1, w: 0.3, h: 0.3 });
  });

  it('arrastrar una esquina cambia el tamaño y con proporción el alto sigue al ancho', () => {
    const free = resizeRect({ x: 0.2, y: 0.2, w: 0.4, h: 0.4 }, 'se', 0.1, -0.1, null, 100, 100);
    expect(free).toEqual({ x: 0.2, y: 0.2, w: expect.closeTo(0.5), h: expect.closeTo(0.3) });
    const nw = resizeRect({ x: 0.2, y: 0.2, w: 0.4, h: 0.4 }, 'nw', -0.1, -0.1, null, 100, 100);
    expect(nw.x).toBeCloseTo(0.1);
    expect(nw.w).toBeCloseTo(0.5);
    const square = resizeRect({ x: 0, y: 0, w: 0.4, h: 0.4 }, 'se', 0.2, 0, 1, 100, 100);
    expect(square.w).toBeCloseTo(square.h);
  });
});

@Component({
  imports: [CbEditor],
  template: `<cb-editor [(value)]="html" />`,
})
class HostComponent {
  html = signal('<p><img src="data:image/png;base64,iVBORw0KGgo=" alt="Foto"></p>');
}

describe('panel de recorte', () => {
  afterEach(() => document.body.querySelectorAll('[ng-version]').forEach((n) => n.remove()));

  it('"Recortar" abre el panel con el recuadro enfocable, proporciones y flechas', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await settle();
    el.querySelector<HTMLImageElement>('.cb-editor__surface img')!.click();
    await settle();
    const crop = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.getAttribute('aria-label') === 'Recortar')!;
    crop.click();
    await settle();
    const panel = el.querySelector<HTMLElement>('.cb-editor__crop')!;
    expect(panel.getAttribute('aria-label')).toBe('Recortar');
    const box = panel.querySelector<HTMLElement>('.cb-editor__crop-box')!;
    expect(box.getAttribute('role')).toBe('slider');
    expect(box.getAttribute('aria-describedby')).toBe(panel.querySelector('.cb-editor__crop-help')!.id);
    expect(box.getAttribute('aria-valuetext')).toBe('100 % × 100 %');
    // Mayús + flecha izquierda reduce el ancho desde la esquina inferior derecha.
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, bubbles: true, cancelable: true }));
    await settle();
    expect(box.getAttribute('aria-valuetext')).toBe('98 % × 100 %');
    const ratios = Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).filter((b) => b.hasAttribute('aria-pressed'));
    expect(ratios.map((b) => b.textContent!.trim())).toEqual(['Libre', '1:1', '4:3', '16:9']);
    expect(ratios[0].getAttribute('aria-pressed')).toBe('true');
    ratios[1].click();
    await settle();
    expect(ratios[1].getAttribute('aria-pressed')).toBe('true');
    // Escape cierra el panel sin tocar la imagen.
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(el.querySelector('.cb-editor__crop')).toBeNull();
    expect(fixture.componentInstance.html()).toContain('alt="Foto"');
  });
});
