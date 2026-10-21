import { TestBed } from '@angular/core/testing';
import { CbProgressBar } from './progress-bar.component';

describe('CbProgressBar', () => {
  it('expone role="progressbar" con el valor acotado entre 0 y 100', () => {
    const fixture = TestBed.createComponent(CbProgressBar);
    fixture.componentRef.setInput('value', 85);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('85');
  });

  it('expone una barra de progreso accesible limitada a 0–100 %', () => {
    const fixture = TestBed.createComponent(CbProgressBar);
    fixture.componentRef.setInput('value', 140);
    fixture.componentRef.setInput('label', 'Meta de ahorro');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const bar = el.querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-label')).toBe('Meta de ahorro');
    expect(el.querySelector<HTMLElement>('.cb-progress-bar__fill')!.style.width).toBe('100%');

    fixture.componentRef.setInput('value', -5);
    fixture.componentRef.setInput('showValue', false);
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(bar.getAttribute('aria-label')).toBeTruthy();
    expect(el.querySelector('.cb-progress-bar__head')).toBeNull();
  });
});
