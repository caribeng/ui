import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbQrcode } from './qrcode.component';

describe('CbQrcode', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbQrcode] });
  });

  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbQrcode);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('dibuja un SVG con nombre accesible, margen y color', () => {
    const { el, fixture } = setup({ value: 'HELLO WORLD', size: 120, color: '#123456' });
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Código QR');
    // 21 módulos + 4 de margen por lado.
    expect(svg.getAttribute('viewBox')).toBe('0 0 29 29');
    expect(svg.getAttribute('width')).toBe('120');
    expect(el.querySelector('path')!.getAttribute('fill')).toBe('#123456');
    expect(el.querySelector('path')!.getAttribute('d')).toMatch(/^M4 4h7v1h-7z/);
    expect(fixture.componentInstance.matrix()!.version).toBe(1);
  });

  it('no dibuja nada con el valor vacío o demasiado largo', () => {
    const { el, fixture } = setup({ value: '' });
    expect(el.querySelector('svg')).toBeNull();
    fixture.componentRef.setInput('value', 'x'.repeat(3000));
    fixture.componentRef.setInput('errorCorrection', 'H');
    fixture.detectChanges();
    expect(el.querySelector('svg')).toBeNull();
  });

  it('centra el logo sobre un fondo y usa ariaLabel', () => {
    const { el } = setup({ value: 'https://caribeng.dev', image: 'logo.svg', errorCorrection: 'H', ariaLabel: 'Pagar con QR' });
    expect(el.querySelector('svg')!.getAttribute('aria-label')).toBe('Pagar con QR');
    const image = el.querySelector('image')!;
    expect(image.getAttribute('href')).toBe('logo.svg');
    const x = Number(image.getAttribute('x'));
    const w = Number(image.getAttribute('width'));
    const extent = Number(el.querySelector('svg')!.getAttribute('viewBox')!.split(' ')[2]);
    expect(x + w / 2).toBeCloseTo(extent / 2, 5);
  });

  it('toSvg devuelve un SVG independiente con el mismo path', () => {
    const { el, fixture } = setup({ value: 'abc', background: '#fff' });
    const markup = fixture.componentInstance.toSvg();
    expect(markup.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(markup).toContain(`d="${el.querySelector('path')!.getAttribute('d')}"`);
    expect(markup).toContain('fill="#fff"');
  });
});
