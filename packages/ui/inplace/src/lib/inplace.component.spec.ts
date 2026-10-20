import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbInplace } from './inplace.component';

@Component({
  imports: [CbInplace],
  template: `
    <cb-inplace [closable]="closable()" [disabled]="disabled()" [(active)]="active">
      <span cb-inplace-display>Editar título</span>
      <input cb-inplace-content value="Nuevo título" />
    </cb-inplace>
  `,
})
class HostComponent {
  closable = signal(true);
  disabled = signal(false);
  active = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const display = () => el.querySelector<HTMLButtonElement>('.cb-inplace__display');
  const closeBtn = () => el.querySelector<HTMLButtonElement>('.cb-inplace__close');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, display, closeBtn, settle };
}

describe('CbInplace', () => {
  it('muestra el contenido al hacer clic en display, le pasa el foco y vuelve al cerrar', async () => {
    const { fixture, el, display, closeBtn, settle } = await setup();
    display()!.click();
    await settle();
    const input = el.querySelector('input')!;
    expect(input.value).toBe('Nuevo título');
    expect(document.activeElement).toBe(input);
    expect(fixture.componentInstance.active()).toBe(true);
    expect(closeBtn()!.getAttribute('aria-label')).toBeTruthy();

    closeBtn()!.click();
    await settle();
    expect(display()).not.toBeNull();
    expect(document.activeElement).toBe(display());
    expect(fixture.componentInstance.active()).toBe(false);
    el.remove();
  });

  it('Escape cierra el contenido cuando es closable', async () => {
    const { el, display, settle } = await setup();
    display()!.click();
    await settle();
    el.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(display()).not.toBeNull();
    el.remove();
  });

  it('sin closable no hay botón de cerrar y Escape no cierra', async () => {
    const { fixture, el, display, closeBtn, settle } = await setup();
    fixture.componentInstance.closable.set(false);
    display()!.click();
    await settle();
    expect(closeBtn()).toBeNull();
    el.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(display()).toBeNull();
    el.remove();
  });

  it('deshabilitado no se abre', async () => {
    const { fixture, el, display, settle } = await setup();
    fixture.componentInstance.disabled.set(true);
    await settle();
    expect(display()!.disabled).toBe(true);
    display()!.click();
    await settle();
    expect(el.querySelector('input')).toBeNull();
    el.remove();
  });

  it('[(active)] permite abrirlo desde fuera', async () => {
    const { fixture, el, settle } = await setup();
    fixture.componentInstance.active.set(true);
    await settle();
    expect(el.querySelector('input')).not.toBeNull();
    el.remove();
  });
});
