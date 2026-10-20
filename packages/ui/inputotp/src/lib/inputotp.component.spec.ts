import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInputOtp } from './inputotp.component';

@Component({
  imports: [CbInputOtp],
  template: `<cb-input-otp [length]="4" [integerOnly]="true" [mask]="mask()" [(value)]="code" />`,
})
class HostComponent {
  code = signal('');
  mask = signal(false);
}

@Component({
  imports: [CbInputOtp, ReactiveFormsModule],
  template: `<cb-input-otp [length]="4" [formControl]="ctrl" />`,
})
class FormHostComponent {
  ctrl = new FormControl('ab');
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const slots = () => Array.from(el.querySelectorAll<HTMLInputElement>('input'));
  const type = (idx: number, value: string) => {
    slots()[idx].value = value;
    slots()[idx].dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const key = (idx: number, k: string) => {
    slots()[idx].dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const paste = (idx: number, text: string) => {
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    slots()[idx].dispatchEvent(event);
    fixture.detectChanges();
  };
  return { fixture, el, slots, type, key, paste };
}

describe('CbInputOtp', () => {
  it('renderiza N casillas y concatena el código ingresado', () => {
    const { fixture, slots, type, el } = setup();
    expect(slots().length).toBe(4);
    type(0, '4');
    type(1, '8');
    expect(fixture.componentInstance.code()).toBe('48');
    el.remove();
  });

  it('es un grupo con nombre accesible y cada casilla se nombra por su posición', () => {
    const { el, slots } = setup();
    const host = el.querySelector('cb-input-otp')!;
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBeTruthy();
    expect(slots()[0].getAttribute('aria-label')).toContain('1');
    expect(slots()[3].getAttribute('aria-label')).toContain('4');
    expect(slots()[0].getAttribute('inputmode')).toBe('numeric');
    el.remove();
  });

  it('avanza el foco al escribir y descarta caracteres no numéricos con integerOnly', () => {
    const { fixture, el, slots, type } = setup();
    slots()[0].focus();
    type(0, '7');
    expect(document.activeElement).toBe(slots()[1]);
    type(1, 'x');
    expect(slots()[1].value).toBe('');
    expect(fixture.componentInstance.code()).toBe('7');
    expect(document.activeElement).toBe(slots()[1]);
    el.remove();
  });

  it('se mueve con las flechas y Backspace en una casilla vacía vuelve a la anterior', () => {
    const { el, slots, key } = setup();
    slots()[1].focus();
    key(1, 'ArrowRight');
    expect(document.activeElement).toBe(slots()[2]);
    key(2, 'ArrowLeft');
    expect(document.activeElement).toBe(slots()[1]);
    key(1, 'Backspace');
    expect(document.activeElement).toBe(slots()[0]);
    el.remove();
  });

  it('al pegar reparte el código, filtra no numéricos y enfoca la última casilla rellenada', () => {
    const { fixture, el, slots, paste } = setup();
    paste(0, '12-34-56');
    expect(fixture.componentInstance.code()).toBe('1234');
    expect(slots().map((s) => s.value)).toEqual(['1', '2', '3', '4']);
    expect(document.activeElement).toBe(slots()[3]);

    paste(0, '9 8');
    expect(fixture.componentInstance.code()).toBe('98');
    expect(document.activeElement).toBe(slots()[1]);
    el.remove();
  });

  it('con mask oculta los dígitos', () => {
    const { fixture, el, slots } = setup();
    fixture.componentInstance.mask.set(true);
    fixture.detectChanges();
    expect(slots().every((s) => s.type === 'password')).toBe(true);
    el.remove();
  });

  it('se integra con Reactive Forms: valor inicial, cambios y disable()', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const slots = Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
    const ctrl = fixture.componentInstance.ctrl;
    expect(slots.map((s) => s.value)).toEqual(['a', 'b', '', '']);

    slots[2].value = 'c';
    slots[2].dispatchEvent(new Event('input'));
    slots[2].dispatchEvent(new Event('blur'));
    expect(ctrl.value).toBe('abc');
    expect(ctrl.touched).toBe(true);

    ctrl.disable();
    fixture.detectChanges();
    expect(slots.every((s) => s.disabled)).toBe(true);
  });
});
