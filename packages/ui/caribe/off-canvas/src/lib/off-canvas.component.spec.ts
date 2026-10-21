import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbOffCanvas } from './off-canvas.component';

@Component({
  imports: [CbOffCanvas],
  template: `
    <button id="open" type="button" (click)="open.set(true)">Filtros</button>
    <cb-off-canvas [title]="title()" [position]="position()" [(open)]="open">
      <a href="#a">Opción</a>
    </cb-off-canvas>
  `,
})
class HostComponent {
  open = signal(false);
  title = signal<string | undefined>('Filtros');
  position = signal<'left' | 'right' | 'bottom'>('right');
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const panel = () => el.querySelector<HTMLElement>('[role="dialog"]');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const openPanel = async () => {
    const trigger = el.querySelector<HTMLButtonElement>('#open')!;
    trigger.focus();
    trigger.click();
    await settle();
    return trigger;
  };
  return { fixture, el, panel, settle, openPanel };
}

describe('CbOffCanvas', () => {
  it('abre un panel modal con nombre y la posición indicada', async () => {
    const { fixture, el, panel, openPanel, settle } = await setup();
    expect(panel()).toBeNull();
    await openPanel();
    expect(panel()!.getAttribute('aria-modal')).toBe('true');
    expect(panel()!.getAttribute('aria-label')).toBe('Filtros');
    expect(panel()!.classList).toContain('cb-off-canvas--right');

    fixture.componentInstance.position.set('bottom');
    fixture.componentInstance.title.set(undefined);
    await settle();
    expect(panel()!.classList).toContain('cb-off-canvas--bottom');
    expect(panel()!.getAttribute('aria-label')).toBe('Panel lateral');
    el.remove();
  });

  it('enfoca el botón de cerrar al abrir y devuelve el foco al cerrar', async () => {
    const { el, openPanel, settle } = await setup();
    const trigger = await openPanel();
    const close = el.querySelector<HTMLButtonElement>('.cb-off-canvas__close')!;
    expect(document.activeElement).toBe(close);
    close.click();
    await settle();
    expect(document.activeElement).toBe(trigger);
    el.remove();
  });

  it('Escape cierra el panel', async () => {
    const { fixture, el, panel, openPanel, settle } = await setup();
    await openPanel();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
    el.remove();
  });
});
