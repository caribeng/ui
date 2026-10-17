import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbFocusTrapDirective } from './focustrap.directive';

@Component({
  imports: [CbFocusTrapDirective],
  template: `
    <div cbFocusTrap>
      <button id="btn-1" type="button">Uno</button>
      <button id="btn-2" type="button">Dos</button>
    </div>
  `,
})
class HostComponent {}

describe('CbFocusTrapDirective', () => {
  it('envuelve el foco del último al primer elemento al pulsar Tab', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trapEl: HTMLElement = fixture.nativeElement.querySelector('[cbFocusTrap]');
    const btn1: HTMLButtonElement = fixture.nativeElement.querySelector('#btn-1');
    const btn2: HTMLButtonElement = fixture.nativeElement.querySelector('#btn-2');

    btn2.focus();
    expect(document.activeElement).toBe(btn2);

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    trapEl.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(btn1);
  });
});
