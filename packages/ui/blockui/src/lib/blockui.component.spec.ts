import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbBlockUi } from './blockui.component';

@Component({
  imports: [CbBlockUi],
  template: `
    <cb-block-ui [blocked]="blocked()" [message]="message()">
      <button type="button">Guardar</button>
    </cb-block-ui>
  `,
})
class HostComponent {
  blocked = signal(false);
  message = signal<string | undefined>(undefined);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return { fixture, el, host: el.querySelector('cb-block-ui')!, content: el.querySelector('.cb-block-ui__content')! };
}

describe('CbBlockUi', () => {
  it('muestra la máscara y aria-busy cuando blocked es true', () => {
    const { fixture, el, host } = setup();
    expect(el.querySelector('.cb-block-ui__mask')).toBeNull();
    expect(host.getAttribute('aria-busy')).toBe('false');

    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.cb-block-ui__mask')).not.toBeNull();
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.classList).toContain('cb-is-blocked');
  });

  it('hace inerte el contenido bloqueado y lo libera al desbloquear', () => {
    const { fixture, content } = setup();
    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();
    expect(content.hasAttribute('inert')).toBe(true);
    fixture.componentInstance.blocked.set(false);
    fixture.detectChanges();
    expect(content.hasAttribute('inert')).toBe(false);
  });

  it('la máscara es un status con texto para el lector de pantalla (personalizable)', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();
    const mask = el.querySelector('.cb-block-ui__mask')!;
    expect(mask.getAttribute('role')).toBe('status');
    expect(mask.textContent!.trim()).toBe('Cargando');

    fixture.componentInstance.message.set('Guardando cambios');
    fixture.detectChanges();
    expect(mask.textContent!.trim()).toBe('Guardando cambios');
  });
});
