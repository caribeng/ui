import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbFloatLabelComponent } from './floatlabel.component';

@Component({
  imports: [CbFloatLabelComponent],
  template: `
    <cb-float-label>
      <input id="u" type="text" />
      <label for="u">Usuario</label>
    </cb-float-label>
  `,
})
class HostComponent {}

describe('CbFloatLabelComponent', () => {
  it('activa la clase cb-is-active al enfocar o escribir en el input hijo', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('cb-float-label') as HTMLElement;
    const input = host.querySelector('input') as HTMLInputElement;

    expect(host.classList.contains('cb-is-active')).toBe(false);

    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(host.classList.contains('cb-is-active')).toBe(true);

    input.value = 'oscar';
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();
    expect(host.classList.contains('cb-is-active')).toBe(true);
  });
});
