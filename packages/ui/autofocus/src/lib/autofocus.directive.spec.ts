import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbAutoFocusDirective } from './autofocus.directive';

@Component({
  imports: [CbAutoFocusDirective],
  template: `<input id="auto-inp" cbAutoFocus />`,
})
class HostComponent {}

describe('CbAutoFocusDirective', () => {
  it('enfoca automáticamente el elemento al montarse', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await Promise.resolve();

    const inp: HTMLInputElement = fixture.nativeElement.querySelector('#auto-inp');
    expect(document.activeElement).toBe(inp);
  });
});
