import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbAnimateOnScrollDirective } from './animateonscroll.directive';

@Component({
  imports: [CbAnimateOnScrollDirective],
  template: `<div cbAnimateOnScroll enterClass="fade-in" leaveClass="fade-out">Tarjeta</div>`,
})
class HostComponent {
  readonly dir = viewChild.required(CbAnimateOnScrollDirective);
}

describe('CbAnimateOnScrollDirective', () => {
  it('aplica enterClass y leaveClass en el elemento anfitrión', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    fixture.componentInstance.dir().applyEnter();
    fixture.detectChanges();
    expect(el.classList.contains('fade-in')).toBe(true);
    expect(el.classList.contains('cb-is-in-view')).toBe(true);

    fixture.componentInstance.dir().applyLeave();
    fixture.detectChanges();
    expect(el.classList.contains('fade-out')).toBe(true);
    expect(el.classList.contains('fade-in')).toBe(false);
  });
});
