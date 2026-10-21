import { TestBed } from '@angular/core/testing';
import { CbButtonGroup } from './button-group.component';

describe('CbButtonGroup', () => {
  it('expone role="group" y aria-label', () => {
    const fixture = TestBed.createComponent(CbButtonGroup);
    fixture.componentRef.setInput('ariaLabel', 'Acciones principales');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Acciones principales');
  });

  it('tiene nombre por defecto y aplica la orientación vertical', () => {
    const fixture = TestBed.createComponent(CbButtonGroup);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBeTruthy();
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect(host.classList).toContain('cb-button-group-host--vertical');
    expect(host.querySelector('.cb-button-group')!.classList).toContain('cb-button-group--vertical');
  });
});
