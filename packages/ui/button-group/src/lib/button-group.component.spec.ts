import { TestBed } from '@angular/core/testing';
import { CbButtonGroupComponent } from './button-group.component';

describe('CbButtonGroupComponent', () => {
  it('expone role="group" y aria-label', () => {
    const fixture = TestBed.createComponent(CbButtonGroupComponent);
    fixture.componentRef.setInput('ariaLabel', 'Acciones principales');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Acciones principales');
  });
});
