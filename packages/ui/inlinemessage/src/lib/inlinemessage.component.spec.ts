import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbInlineMessageComponent } from './inlinemessage.component';

@Component({
  imports: [CbInlineMessageComponent],
  template: `<cb-inline-message severity="danger" text="Campo obligatorio" />`,
})
class HostComponent {}

describe('CbInlineMessageComponent', () => {
  it('renderiza role="alert", clase de severidad y texto', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('cb-inline-message') as HTMLElement;
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.classList.contains('cb-inline-message--danger')).toBe(true);
    expect(host.textContent).toContain('Campo obligatorio');
  });
});
