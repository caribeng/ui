import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbAlert } from './alert.component';

@Component({
  imports: [CbAlert],
  template: `
    <cb-alert title="Pago rechazado" [severity]="severity()" [closable]="closable()" [(visible)]="visible" (closed)="closed = closed + 1">
      Revisa el saldo de tu cuenta.
    </cb-alert>
  `,
})
class HostComponent {
  severity = signal<'success' | 'warning' | 'error' | 'info'>('error');
  closable = signal(true);
  visible = signal(true);
  closed = 0;
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return { fixture, el, alert: () => el.querySelector<HTMLElement>('[role="alert"]'), host: fixture.componentInstance };
}

describe('CbAlert', () => {
  it('es un role="alert" con título, contenido e icono decorativo', () => {
    const { alert } = setup();
    expect(alert()!.querySelector('.cb-alert__title')!.textContent).toBe('Pago rechazado');
    expect(alert()!.querySelector('.cb-alert__body')!.textContent!.trim()).toBe('Revisa el saldo de tu cuenta.');
    expect(alert()!.querySelector('.cb-alert__icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('aplica la clase de severidad', () => {
    const { fixture, alert } = setup();
    expect(alert()!.classList).toContain('cb-alert--error');
    fixture.componentInstance.severity.set('success');
    fixture.detectChanges();
    expect(alert()!.classList).toContain('cb-alert--success');
  });

  it('el botón de cerrar tiene nombre, oculta la alerta y emite closed', () => {
    const { fixture, el, alert, host } = setup();
    const close = el.querySelector<HTMLButtonElement>('.cb-alert__close')!;
    expect(close.getAttribute('aria-label')).toBe('Cerrar');
    close.click();
    fixture.detectChanges();
    expect(alert()).toBeNull();
    expect(host.visible()).toBe(false);
    expect(host.closed).toBe(1);
  });

  it('sin closable no muestra el botón de cerrar', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.closable.set(false);
    fixture.detectChanges();
    expect(el.querySelector('.cb-alert__close')).toBeNull();
  });
});
