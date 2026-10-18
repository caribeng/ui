import { TestBed } from '@angular/core/testing';
import { CbDotsIndicator } from './dots-indicator.component';

describe('CbDotsIndicator', () => {
  it('renderiza la cantidad indicada de puntos', () => {
    const fixture = TestBed.createComponent(CbDotsIndicator);
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]').length).toBe(5);
  });
});
