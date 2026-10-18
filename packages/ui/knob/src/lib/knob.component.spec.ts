import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbKnob } from './knob.component';

@Component({
  imports: [ReactiveFormsModule, CbKnob],
  template: `<cb-knob [formControl]="control" [min]="0" [max]="100" [step]="5" ariaLabel="Volumen" />`,
})
class HostComponent {
  control = new FormControl(0);
}

describe('CbKnob', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const svg = (): SVGElement => el.querySelector('svg')!;
    const text = (): string => el.querySelector('.cb-knob__text')!.textContent!.trim();
    return { fixture, el, svg, text };
  }

  it('es un slider con aria min/max/now', () => {
    const { svg } = setup();
    expect(svg().getAttribute('role')).toBe('slider');
    expect(svg().getAttribute('aria-valuemin')).toBe('0');
    expect(svg().getAttribute('aria-valuemax')).toBe('100');
    expect(svg().getAttribute('aria-valuenow')).toBe('0');
  });

  it('refleja el valor del FormControl (writeValue)', () => {
    const { fixture, svg, text } = setup();
    fixture.componentInstance.control.setValue(40);
    fixture.detectChanges();
    expect(svg().getAttribute('aria-valuenow')).toBe('40');
    expect(text()).toBe('40');
  });

  it('las flechas cambian el valor por step (con clamp)', () => {
    const { fixture, svg } = setup();
    fixture.componentInstance.control.setValue(10);
    fixture.detectChanges();
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(fixture.componentInstance.control.value).toBe(15);
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(fixture.componentInstance.control.value).toBe(100);
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(fixture.componentInstance.control.value).toBe(0);
  });
});
