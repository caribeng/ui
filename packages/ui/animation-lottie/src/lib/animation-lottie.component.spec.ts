import { TestBed } from '@angular/core/testing';
import { CbAnimationLottie } from './animation-lottie.component';

describe('CbAnimationLottie', () => {
  it('permite alternar play y pause y expone aria-label', () => {
    const fixture = TestBed.createComponent(CbAnimationLottie);
    fixture.detectChanges();
    fixture.componentInstance.pause();
    expect(fixture.componentInstance.playing()).toBe(false);
    fixture.componentInstance.play();
    expect(fixture.componentInstance.playing()).toBe(true);
  });

  it('es una imagen con nombre accesible y el SVG es decorativo', () => {
    const fixture = TestBed.createComponent(CbAnimationLottie);
    fixture.componentRef.setInput('ariaLabel', 'Transferencia exitosa');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const img = el.querySelector('[role="img"]')!;
    expect(img.getAttribute('aria-label')).toBe('Transferencia exitosa');
    expect(img.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });
});
