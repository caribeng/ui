import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbRippleDirective } from './ripple.directive';

@Component({
  imports: [CbRippleDirective],
  template: `<button type="button" cbRipple>Pulsar</button>`,
})
class HostComponent {}

describe('CbRippleDirective', () => {
  it('inyecta el elemento .cb-ripple-ink al hacer pointerdown', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(btn.querySelector('.cb-ripple-ink')).not.toBeNull();
  });
});
