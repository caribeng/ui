import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbSlider, type CbSliderRange } from './slider.component';

@Component({
  imports: [CbSlider],
  template: `
    <cb-slider
      range
      [(rangeValue)]="precio"
      [min]="0"
      [max]="1000"
      [step]="50"
      [showValue]="showValue()"
      [valueFormat]="{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }"
      locale="en-US"
      ariaLabel="Precio"
    />
  `,
})
class HostComponent {
  precio = signal<CbSliderRange>([200, 600]);
  showValue = signal(false);
}

@Component({
  imports: [CbSlider, ReactiveFormsModule],
  template: `<cb-slider range [formControl]="ctrl" [min]="0" [max]="100" [step]="10" ariaLabel="Edad" />`,
})
class FormHostComponent {
  ctrl = new FormControl<CbSliderRange>([70, 20]);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const thumbs = () => Array.from(el.querySelectorAll<HTMLElement>('[role="slider"]'));
  const key = (i: number, k: string) => {
    thumbs()[i].dispatchEvent(new KeyboardEvent('keydown', { key: k, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, thumbs, key, host: fixture.componentInstance };
}

describe('CbSlider · rango', () => {
  it('dos tiradores con nombre "mínimo" / "máximo" y límites que dependen del otro', () => {
    const { thumbs } = setup();
    const [lo, hi] = thumbs();
    expect(lo.getAttribute('aria-label')).toBe('Precio mínimo');
    expect(hi.getAttribute('aria-label')).toBe('Precio máximo');
    expect([lo.getAttribute('aria-valuemin'), lo.getAttribute('aria-valuemax')]).toEqual(['0', '600']);
    expect([hi.getAttribute('aria-valuemin'), hi.getAttribute('aria-valuemax')]).toEqual(['200', '1000']);
  });

  it('anuncia el valor formateado con aria-valuetext y la banda va entre los dos', () => {
    const { el, thumbs } = setup();
    expect(thumbs()[0].getAttribute('aria-valuetext')).toBe('$200');
    const band = el.querySelector<HTMLElement>('.cb-slider__range')!;
    expect(band.style.left).toBe('20%');
    expect(band.style.width).toBe('40%');
  });

  it('el teclado mueve cada tirador sin cruzar al otro', () => {
    const { key, host } = setup();
    key(0, 'ArrowRight');
    expect(host.precio()).toEqual([250, 600]);
    key(0, 'End');
    expect(host.precio()).toEqual([600, 600]);
    key(1, 'Home');
    expect(host.precio()).toEqual([600, 600]);
    key(1, 'PageUp');
    expect(host.precio()).toEqual([600, 1000]);
  });

  it('showValue muestra el valor de cada tirador (oculto al lector, que ya tiene aria-valuetext)', () => {
    const { fixture, el, host } = setup();
    host.showValue.set(true);
    fixture.detectChanges();
    const values = Array.from(el.querySelectorAll('.cb-slider__value'));
    expect(values.map((v) => v.textContent!.trim())).toEqual(['$200', '$600']);
    expect(values.every((v) => v.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('al pulsar la pista se mueve el tirador más cercano', () => {
    const { fixture, el, host } = setup();
    const track = el.querySelector<HTMLElement>('.cb-slider__track')!;
    track.getBoundingClientRect = () => ({ left: 0, width: 1000, top: 0, height: 6 }) as DOMRect;
    track.dispatchEvent(new PointerEvent('pointerdown', { clientX: 900, bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(host.precio()).toEqual([200, 900]);
    window.dispatchEvent(new PointerEvent('pointerup'));
    track.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(host.precio()).toEqual([100, 900]);
    window.dispatchEvent(new PointerEvent('pointerup'));
  });

  it('con Angular Forms recibe y emite el par [mínimo, máximo] (ordenado)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const thumbs = Array.from(el.querySelectorAll<HTMLElement>('[role="slider"]'));
    expect(thumbs.map((t) => t.getAttribute('aria-valuenow'))).toEqual(['20', '70']);
    thumbs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    expect(fixture.componentInstance.ctrl.value).toEqual([20, 80]);
  });
});
