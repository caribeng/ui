import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { cbOverlayFocus } from './overlay-focus';

@Component({
  template: `
    <button id="trigger" type="button" (click)="open.set(true)">Abrir</button>
    @if (open()) {
      <div role="dialog"><button #closeBtn id="close" type="button" (click)="open.set(false)">Cerrar</button></div>
    }
  `,
})
class HostComponent {
  readonly open = signal(false);
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  constructor() {
    cbOverlayFocus({ open: this.open, initialFocus: () => this.closeBtn()?.nativeElement });
  }
}

describe('cbOverlayFocus', () => {
  it('enfoca el elemento inicial al abrir y devuelve el foco al cerrar', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    document.body.appendChild(el);
    const trigger = el.querySelector<HTMLButtonElement>('#trigger')!;

    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement!.id).toBe('close');

    el.querySelector<HTMLButtonElement>('#close')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
    el.remove();
  });

  it('no mueve el foco si el overlay empieza cerrado', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const outside = document.createElement('input');
    document.body.appendChild(outside);
    outside.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });
});
