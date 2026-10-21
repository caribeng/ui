import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbModal } from './modal.component';

@Component({
  imports: [CbModal],
  template: `
    <button id="open" type="button" (click)="visible.set(true)">Abrir</button>
    <cb-modal
      title="Confirmar transferencia"
      confirmLabel="Transferir"
      [(visible)]="visible"
      (confirm)="confirmed = confirmed + 1"
      (closed)="closed = closed + 1"
    >
      <p>¿Transferir $50.000?</p>
    </cb-modal>
  `,
})
class HostComponent {
  visible = signal(false);
  confirmed = 0;
  closed = 0;
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const dialog = () => el.querySelector<HTMLElement>('[role="dialog"]');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const open = async () => {
    const trigger = el.querySelector<HTMLButtonElement>('#open')!;
    trigger.focus();
    trigger.click();
    await settle();
    return trigger;
  };
  return { fixture, el, dialog, settle, open, host: fixture.componentInstance };
}

describe('CbModal', () => {
  it('no renderiza nada cerrado y abre un diálogo modal nombrado por el título', async () => {
    const { el, dialog, open } = await setup();
    expect(dialog()).toBeNull();
    await open();
    expect(dialog()!.getAttribute('aria-modal')).toBe('true');
    const title = el.querySelector('.cb-modal__title')!;
    expect(dialog()!.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent).toBe('Confirmar transferencia');
    expect(el.querySelector('.cb-modal__body')!.textContent).toContain('$50.000');
    el.remove();
  });

  it('al abrir enfoca el botón de cerrar y al cerrar devuelve el foco al disparador', async () => {
    const { el, open, settle } = await setup();
    const trigger = await open();
    const close = el.querySelector<HTMLButtonElement>('.cb-modal__close')!;
    expect(close.getAttribute('aria-label')).toBe('Cerrar');
    expect(document.activeElement).toBe(close);
    close.click();
    await settle();
    expect(document.activeElement).toBe(trigger);
    el.remove();
  });

  it('Escape y el fondo cierran y emiten closed; un clic dentro no cierra', async () => {
    const { el, dialog, open, settle, host } = await setup();
    await open();
    dialog()!.click();
    await settle();
    expect(dialog()).not.toBeNull();

    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(dialog()).toBeNull();
    expect(host.visible()).toBe(false);

    await open();
    el.querySelector<HTMLElement>('.cb-modal__backdrop')!.click();
    await settle();
    expect(dialog()).toBeNull();
    expect(host.closed).toBe(2);
    el.remove();
  });

  it('los botones del pie cancelan o confirman', async () => {
    const { el, open, settle, host } = await setup();
    await open();
    const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-modal__foot button'));
    expect(buttons().map((b) => b.textContent!.trim())).toEqual(['Cancelar', 'Transferir']);
    buttons()[1].click();
    await settle();
    expect(host.confirmed).toBe(1);
    buttons()[0].click();
    await settle();
    expect(host.visible()).toBe(false);
    el.remove();
  });
});
