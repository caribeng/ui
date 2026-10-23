import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbInlineMessage } from './inlinemessage.component';

@Component({
  imports: [CbInlineMessage],
  template: `<cb-inline-message severity="danger" text="Campo obligatorio" />`,
})
class HostComponent {}

describe('CbInlineMessage', () => {
  it('renderiza role="alert", clase de severidad y texto', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('cb-inline-message') as HTMLElement;
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.classList.contains('cb-inline-message--danger')).toBe(true);
    expect(host.textContent).toContain('Campo obligatorio');
  });

  it('cada severidad usa su clase y su icono decorativo', () => {
    const fixture = TestBed.createComponent(CbInlineMessage);
    const host = fixture.nativeElement as HTMLElement;
    for (const [severity, icon] of [['info', 'info'], ['success', 'circle-check'], ['warn', 'triangle-alert'], ['danger', 'circle-x']]) {
      fixture.componentRef.setInput('severity', severity);
      fixture.detectChanges();
      expect(host.classList).toContain(`cb-inline-message--${severity}`);
      const cbIcon = host.querySelector('cb-icon')!;
      expect(cbIcon.getAttribute('aria-hidden')).toBe('true');
      expect(fixture.debugElement.query((d) => d.name === 'cb-icon').componentInstance.name()).toBe(icon);
    }
  });

  it('muestra el texto indicado', () => {
    const fixture = TestBed.createComponent(CbInlineMessage);
    fixture.componentRef.setInput('text', 'Revisa ');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.cb-inline-message__text')!.textContent).toBe('Revisa ');
  });
  it('info y success usan role="status"; warn y danger, role="alert"', () => {
    const fixture = TestBed.createComponent(CbInlineMessage);
    const host = fixture.nativeElement as HTMLElement;
    for (const [severity, role] of [['info', 'status'], ['success', 'status'], ['warn', 'alert'], ['danger', 'alert']]) {
      fixture.componentRef.setInput('severity', severity);
      fixture.detectChanges();
      expect(host.getAttribute('role')).toBe(role);
    }
  });
});
