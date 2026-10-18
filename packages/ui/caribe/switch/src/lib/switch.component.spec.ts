import { TestBed } from '@angular/core/testing';
import { CbSwitch } from './switch.component';

describe('CbSwitch', () => {
  it('alterna aria-checked al hacer clic', () => {
    const fixture = TestBed.createComponent(CbSwitch);
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });
});
