import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbPopOver } from './pop-over.component';

@Component({
  imports: [CbPopOver],
  template: `<cb-pop-over triggerLabel="¿Qué es el CVV?" [(visible)]="visible"><p>Código de 3 dígitos.</p></cb-pop-over>`,
})
class HostComponent {
  visible = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const trigger = () => el.querySelector<HTMLButtonElement>('.cb-pop-over__trigger')!;
  const panel = () => el.querySelector<HTMLElement>('[role="dialog"]');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, trigger, panel, settle };
}

describe('CbPopOver', () => {
  it('el disparador alterna el panel y refleja aria-expanded y aria-controls', async () => {
    const { el, trigger, panel, settle } = await setup();
    expect(trigger().textContent!.trim()).toBe('¿Qué es el CVV?');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);

    trigger().click();
    await settle();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(panel()!.id);
    expect(panel()!.getAttribute('aria-label')).toBe('¿Qué es el CVV?');
    expect(panel()!.textContent).toContain('Código de 3 dígitos.');

    trigger().click();
    await settle();
    expect(panel()).toBeNull();
    el.remove();
  });

  it('al abrir enfoca el botón de cerrar; cerrar devuelve el foco al disparador', async () => {
    const { el, trigger, settle } = await setup();
    trigger().focus();
    trigger().click();
    await settle();
    const close = el.querySelector<HTMLButtonElement>('.cb-pop-over__close')!;
    expect(document.activeElement).toBe(close);
    close.click();
    await settle();
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });

  it('Escape cierra el panel y devuelve el foco al disparador', async () => {
    const { fixture, el, trigger, panel, settle } = await setup();
    trigger().focus();
    trigger().click();
    await settle();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });
});
