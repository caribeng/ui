import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbInputOtp } from './inputotp.component';

@Component({
  imports: [CbInputOtp],
  template: `<cb-input-otp [length]="4" [integerOnly]="true" [(value)]="code" />`,
})
class HostComponent {
  code = signal('');
}

describe('CbInputOtp', () => {
  it('renderiza N casillas y concatena el código ingresado', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const slots = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(slots.length).toBe(4);

    slots[0].value = '4';
    slots[0].dispatchEvent(new Event('input'));
    slots[1].value = '8';
    slots[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.code()).toBe('48');
  });
});
