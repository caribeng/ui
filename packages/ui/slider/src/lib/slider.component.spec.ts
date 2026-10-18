import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSlider } from './slider.component';

@Component({
  imports: [ReactiveFormsModule, CbSlider],
  template: `<cb-slider [formControl]="control" [min]="0" [max]="100" [step]="10" ariaLabel="Volumen" />`,
})
class HostComponent {
  control = new FormControl(0);
}

describe('CbSlider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const thumb = (): HTMLElement => el.querySelector('.cb-slider__thumb')!;
    const range = (): HTMLElement => el.querySelector('.cb-slider__range')!;
    return { fixture, el, thumb, range };
  }

  it('el thumb es role=slider con aria min/max', () => {
    const { thumb } = setup();
    expect(thumb().getAttribute('role')).toBe('slider');
    expect(thumb().getAttribute('aria-valuemin')).toBe('0');
    expect(thumb().getAttribute('aria-valuemax')).toBe('100');
  });

  it('refleja el valor del FormControl en aria y en el relleno (writeValue)', () => {
    const { fixture, thumb, range } = setup();
    fixture.componentInstance.control.setValue(50);
    fixture.detectChanges();
    expect(thumb().getAttribute('aria-valuenow')).toBe('50');
    expect(range().style.width).toBe('50%');
  });

  it('las flechas cambian el valor por step', () => {
    const { fixture, thumb } = setup();
    fixture.componentInstance.control.setValue(20);
    fixture.detectChanges();
    thumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(fixture.componentInstance.control.value).toBe(30);
    thumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(fixture.componentInstance.control.value).toBe(20);
  });

  it('Home/End van al mínimo/máximo', () => {
    const { fixture, thumb } = setup();
    thumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(fixture.componentInstance.control.value).toBe(100);
    thumb().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(fixture.componentInstance.control.value).toBe(0);
  });
});
