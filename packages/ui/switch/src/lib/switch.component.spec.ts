import { TestBed } from '@angular/core/testing';
import { CbSwitchComponent } from './switch.component';

describe('CbSwitchComponent', () => {
  it('alterna aria-checked al hacer clic', () => {
    const fixture = TestBed.createComponent(CbSwitchComponent);
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[role="switch"]');
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });
});
