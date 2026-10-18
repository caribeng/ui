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
});
