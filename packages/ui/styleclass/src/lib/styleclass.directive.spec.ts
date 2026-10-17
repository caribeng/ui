import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbStyleClassDirective } from './styleclass.directive';

@Component({
  imports: [CbStyleClassDirective],
  template: `
    <button type="button" cbStyleClass="@next" toggleClass="cb-hidden">Alternar</button>
    <div id="panel">Contenido</div>
  `,
})
class HostComponent {}

describe('CbStyleClassDirective', () => {
  it('alterna toggleClass en el elemento @next al hacer clic', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const panel: HTMLElement = fixture.nativeElement.querySelector('#panel');

    expect(panel.classList.contains('cb-hidden')).toBe(false);
    btn.click();
    expect(panel.classList.contains('cb-hidden')).toBe(true);
    btn.click();
    expect(panel.classList.contains('cb-hidden')).toBe(false);
  });
});
