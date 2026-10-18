import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbBlockUi } from './blockui.component';

@Component({
  imports: [CbBlockUi],
  template: `
    <cb-block-ui [blocked]="blocked()">
      <p>Contenido protegido</p>
    </cb-block-ui>
  `,
})
class HostComponent {
  blocked = signal(false);
}

describe('CbBlockUi', () => {
  it('muestra la máscara y aria-busy cuando blocked es true', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('cb-block-ui') as HTMLElement;
    expect(host.querySelector('.cb-block-ui__mask')).toBeNull();

    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();

    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('.cb-block-ui__mask')).not.toBeNull();
  });
});
