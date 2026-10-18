import { TestBed } from '@angular/core/testing';
import { CbInputTokenComponent } from './input-token.component';

describe('CbInputTokenComponent', () => {
  it('renderiza la cantidad configurada de casillas de token', () => {
    const fixture = TestBed.createComponent(CbInputTokenComponent);
    fixture.componentRef.setInput('numInputs', 4);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(4);
  });
});
