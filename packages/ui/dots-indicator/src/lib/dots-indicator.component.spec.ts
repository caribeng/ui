import { TestBed } from '@angular/core/testing';
import { CbDotsIndicatorComponent } from './dots-indicator.component';

describe('CbDotsIndicatorComponent', () => {
  it('renderiza la cantidad indicada de puntos', () => {
    const fixture = TestBed.createComponent(CbDotsIndicatorComponent);
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]').length).toBe(5);
  });
});
