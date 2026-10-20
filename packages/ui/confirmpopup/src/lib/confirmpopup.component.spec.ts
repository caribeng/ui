import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CbConfirmPopup } from './confirmpopup.component';

@Component({
  imports: [CbConfirmPopup],
  template: `
    <button type="button" class="trigger" (click)="popup.confirm($event)">Eliminar</button>
    <cb-confirm-popup #popup [(visible)]="visible" message="¿Eliminar el archivo?" (accepted)="ok()" (rejected)="ko()" />
  `,
})
class HostComponent {
  visible = signal(false);
  popup = viewChild.required(CbConfirmPopup);
  ok = vi.fn();
  ko = vi.fn();
}

function setup() {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const panel = () => document.querySelector<HTMLElement>('.cb-confirm-popup');
  const buttons = () => Array.from(panel()!.querySelectorAll<HTMLElement>('button'));
  return { fixture, el, panel, buttons, host: fixture.componentInstance };
}

describe('CbConfirmPopup', () => {
  it('en línea con [(visible)] muestra el mensaje y cancela', () => {
    const { fixture, el, buttons, host } = setup();
    host.visible.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.cb-confirm-popup')!.textContent).toContain('¿Eliminar el archivo?');
    buttons()[0].click();
    fixture.detectChanges();
    expect(host.ko).toHaveBeenCalledOnce();
    expect(host.visible()).toBe(false);
  });

  it('confirm($event) la abre anclada al disparador (fuera del host)', () => {
    const { fixture, el, panel } = setup();
    el.querySelector<HTMLElement>('.trigger')!.click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    expect(el.contains(panel())).toBe(false); // vive en el overlay de CDK
    expect(panel()!.getAttribute('role')).toBe('alertdialog');
    const message = document.getElementById(panel()!.getAttribute('aria-describedby')!);
    expect(message!.textContent).toBe('¿Eliminar el archivo?');
  });

  it('aceptar cierra el overlay y devuelve el foco al disparador', () => {
    const { fixture, el, panel, buttons, host } = setup();
    const trigger = el.querySelector<HTMLElement>('.trigger')!;
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    buttons()[1].click();
    fixture.detectChanges();
    expect(host.ok).toHaveBeenCalledOnce();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape cancela', () => {
    const { fixture, el, panel, host } = setup();
    el.querySelector<HTMLElement>('.trigger')!.click();
    fixture.detectChanges();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.ko).toHaveBeenCalledOnce();
    expect(panel()).toBeNull();
  });
});
