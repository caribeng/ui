import { TestBed } from '@angular/core/testing';
import { CbButtonGroup } from './button-group.component';

describe('CbButtonGroup', () => {
  it('expone role="group" y aria-label', () => {
    const fixture = TestBed.createComponent(CbButtonGroup);
    fixture.componentRef.setInput('ariaLabel', 'Acciones principales');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Acciones principales');
  });
});
