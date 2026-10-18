import { TestBed } from '@angular/core/testing';
import { CbInputToken } from './input-token.component';

describe('CbInputToken', () => {
  it('renderiza la cantidad configurada de casillas de token', () => {
    const fixture = TestBed.createComponent(CbInputToken);
    fixture.componentRef.setInput('numInputs', 4);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(4);
  });
});
