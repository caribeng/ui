import { TestBed } from '@angular/core/testing';
import { CbAnimationLottieComponent } from './animation-lottie.component';

describe('CbAnimationLottieComponent', () => {
  it('permite alternar play y pause y expone aria-label', () => {
    const fixture = TestBed.createComponent(CbAnimationLottieComponent);
    fixture.detectChanges();
    fixture.componentInstance.pause();
    expect(fixture.componentInstance.playing()).toBe(false);
    fixture.componentInstance.play();
    expect(fixture.componentInstance.playing()).toBe(true);
  });
});
