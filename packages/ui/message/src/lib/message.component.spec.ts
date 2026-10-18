import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbMessage } from './message.component';

@Component({
  imports: [CbMessage],
  template: `
    <cb-message
      [severity]="severity()"
      [closable]="closable()"
      [(visible)]="visible"
      (closed)="closedCount = closedCount + 1"
    >
      Mensaje de prueba
    </cb-message>
  `,
})
class HostComponent {
  severity = signal<'success' | 'warning'>('success');
  closable = signal(false);
  visible = signal(true);
  closedCount = 0;
}

describe('CbMessage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const box = (): HTMLElement | null => el.querySelector('.cb-message');
    return { fixture, el, box };
  }

  it('muestra el contenido, role=alert y la clase de severidad', () => {
    const { box } = setup();
    expect(box()).toBeTruthy();
    expect(box()!.getAttribute('role')).toBe('alert');
    expect(box()!.classList).toContain('cb-message--success');
    expect(box()!.textContent).toContain('Mensaje de prueba');
    expect(box()!.querySelector('cb-icon svg')).toBeTruthy();
  });

  it('sin closable no hay botón de cerrar', () => {
    const { el } = setup();
    expect(el.querySelector('.cb-message__close')).toBeNull();
  });

  it('closable: cerrar oculta el mensaje y emite closed', () => {
    const { fixture, el, box } = setup();
    fixture.componentInstance.closable.set(true);
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.cb-message__close')!.click();
    fixture.detectChanges();
    expect(box()).toBeNull();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(fixture.componentInstance.closedCount).toBe(1);
  });
});
