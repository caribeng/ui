import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSignaturePad } from './signature-pad.component';
import { isSignatureEmpty, signatureToSvg, strokeSegments, typedFontSize, type CbSignatureData } from './signature-model';

@Component({
  imports: [CbSignaturePad],
  template: `
    <cb-signature-pad
      [(value)]="value"
      format="svg"
      [readonly]="readonly()"
      (signEnd)="ends = ends + 1"
      (cleared)="clears = clears + 1"
    />
  `,
})
class HostComponent {
  value = signal('');
  readonly = signal(false);
  ends = 0;
  clears = 0;
}

@Component({
  imports: [CbSignaturePad, ReactiveFormsModule],
  template: `<cb-signature-pad format="svg" [formControl]="firma" />`,
})
class FormHostComponent {
  firma = new FormControl('', { nonNullable: true, validators: Validators.required });
}

/** Dibuja un trazo con eventos de puntero (en jsdom las coordenadas van tal cual). */
function draw(svg: Element, points: [number, number][], id = 1) {
  const ev = (type: string, [x, y]: [number, number], t: number) =>
    new PointerEvent(type, { pointerId: id, pointerType: 'mouse', button: 0, clientX: x, clientY: y, bubbles: true, pressure: 0.5 });
  svg.dispatchEvent(ev('pointerdown', points[0], 0));
  points.slice(1).forEach((p, i) => svg.dispatchEvent(ev('pointermove', p, i + 1)));
  svg.dispatchEvent(ev('pointerup', points[points.length - 1], points.length));
}

describe('CbSignaturePad', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent, FormHostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const svg = () => el.querySelector('svg.cb-sig__svg')!;
    const btn = (label: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
    const mode = (text: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-sig__mode')).find((b) => b.textContent!.trim() === text)!;
    return { fixture, el, host: fixture.componentInstance, svg, btn, mode };
  }

  it('el área es una imagen con nombre que dice si está vacía o firmada', () => {
    const { fixture, svg } = setup();
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe('Área de firma: vacía');
    draw(svg(), [[10, 10], [40, 30], [80, 20]]);
    fixture.detectChanges();
    expect(svg().getAttribute('aria-label')).toBe('Área de firma: firmada');
    expect(document.getElementById(svg().getAttribute('aria-describedby')!)!.textContent).toContain('Escribir');
  });

  it('dibujar pinta el trazo y emite la firma como SVG', () => {
    const { fixture, host, svg } = setup();
    draw(svg(), [[10, 10], [40, 30], [80, 20], [120, 40]]);
    fixture.detectChanges();
    expect(svg().querySelectorAll('path').length).toBe(3);
    expect(host.ends).toBe(1);
    expect(host.value()).toMatch(/^data:image\/svg\+xml/);
    const svgText = decodeURIComponent(host.value().split(',')[1]);
    expect(svgText).toContain('<path');
    expect(svgText).toContain('fill="#ffffff"');
  });

  it('deshacer quita el último trazo y borrar deja el valor vacío', async () => {
    const { fixture, host, svg, btn, el } = setup();
    expect(btn('Deshacer trazo').disabled).toBe(true);
    draw(svg(), [[10, 10], [40, 30]]);
    draw(svg(), [[60, 60], [90, 70]], 2);
    fixture.detectChanges();
    btn('Deshacer trazo').click();
    fixture.detectChanges();
    expect(svg().querySelectorAll('path').length).toBe(1);
    btn('Borrar firma').click();
    fixture.detectChanges();
    expect(host.value()).toBe('');
    expect(host.clears).toBe(1);
    expect(btn('Borrar firma').disabled).toBe(true);
    expect(el.querySelector('[aria-live]')!.textContent!.trim()).toBe('Firma borrada');
  });

  it('el modo escrito es la alternativa con teclado: el nombre se pinta en letra manuscrita', async () => {
    const { fixture, host, svg, mode, el } = setup();
    const group = el.querySelector('.cb-sig__modes')!;
    expect(group.getAttribute('role')).toBe('group');
    mode('Escribir').click();
    fixture.detectChanges();
    expect(mode('Escribir').getAttribute('aria-pressed')).toBe('true');
    const input = el.querySelector<HTMLInputElement>('.cb-sig__input')!;
    expect(input.closest('label')!.textContent).toContain('Escribe tu nombre');
    input.value = 'Ana López';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(svg().querySelector('text')!.textContent).toBe('Ana López');
    expect(decodeURIComponent(host.value().split(',')[1])).toContain('>Ana López</text>');
  });

  it('en solo lectura no se dibuja ni hay herramientas', () => {
    const { fixture, host, svg, el } = setup();
    host.readonly.set(true);
    fixture.detectChanges();
    draw(svg(), [[10, 10], [40, 30]]);
    fixture.detectChanges();
    expect(svg().querySelectorAll('path').length).toBe(0);
    expect(el.querySelector('.cb-sig__tool')).toBeNull();
  });

  it('una firma que llega de fuera se muestra de fondo', () => {
    const { fixture, host, svg } = setup();
    host.value.set('data:image/png;base64,AAAA');
    fixture.detectChanges();
    expect(svg().querySelector('image')!.getAttribute('href')).toBe('data:image/png;base64,AAAA');
    expect(svg().getAttribute('aria-label')).toBe('Área de firma: firmada');
  });

  it('con Angular Forms, required se cumple al firmar', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const ctrl = fixture.componentInstance.firma;
    expect(ctrl.valid).toBe(false);
    draw((fixture.nativeElement as HTMLElement).querySelector('svg.cb-sig__svg')!, [[10, 10], [50, 40]]);
    fixture.detectChanges();
    expect(ctrl.valid).toBe(true);
    expect(ctrl.touched).toBe(true);
    ctrl.disable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('cb-signature-pad')!.classList).toContain('cb-is-disabled');
  });
});

describe('modelo de firma', () => {
  const pt = (x: number, y: number, t: number) => ({ x, y, t, p: 0.5 });

  it('un trazo rápido es más fino que uno lento', () => {
    const slow = strokeSegments([pt(0, 0, 0), pt(5, 0, 100), pt(10, 0, 200), pt(15, 0, 300)], 1, 3);
    const fast = strokeSegments([pt(0, 0, 0), pt(50, 0, 5), pt(100, 0, 10), pt(150, 0, 15)], 1, 3);
    expect(fast[fast.length - 1].width).toBeLessThan(slow[slow.length - 1].width);
  });

  it('un toque es un punto', () => {
    expect(strokeSegments([pt(5, 5, 0)], 1, 3)).toEqual([{ d: 'M5 5l0 0.01', width: 3.3 }]);
  });

  it('el SVG escapa el texto y respeta el fondo transparente', () => {
    const data: CbSignatureData = { width: 300, height: 100, strokes: [], text: '<Ana & "Luis">', color: '#000' };
    const svg = signatureToSvg(data, { minWidth: 1, maxWidth: 3, background: 'transparent' });
    expect(svg).not.toContain('<rect');
    expect(svg).toContain('&lt;Ana &amp; &quot;Luis&quot;&gt;');
    expect(isSignatureEmpty({ ...data, text: '  ' })).toBe(true);
  });

  it('el nombre escrito cabe en el lienzo', () => {
    expect(typedFontSize('Ana', 600, 200)).toBe(84);
    expect(typedFontSize('María Fernanda Rodríguez Gómez', 600, 200)).toBeLessThan(40);
  });
});
