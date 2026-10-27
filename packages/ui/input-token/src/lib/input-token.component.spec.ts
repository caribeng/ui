import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInputToken } from './input-token.component';

@Component({
  imports: [CbInputToken],
  template: `<cb-input-token [numInputs]="4" [unmasked]="unmasked()" helpText="Enviado a tu móvil" [(value)]="code" />`,
})
class HostComponent {
  code = signal('');
  unmasked = signal(false);
}

@Component({
  imports: [CbInputToken, ReactiveFormsModule],
  template: `<cb-input-token [numInputs]="4" [formControl]="ctrl" />`,
})
class FormHostComponent {
  ctrl = new FormControl('12');
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const slots = () => Array.from(el.querySelectorAll<HTMLInputElement>('.cb-input-token__slot'));
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

describe('CbInputToken', () => {
  it('renderiza la cantidad configurada de casillas de token', () => {
    const fixture = TestBed.createComponent(CbInputToken);
    fixture.componentRef.setInput('numInputs', 4);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(4);
  });

  it('limita las casillas entre 3 y 8', () => {
    const fixture = TestBed.createComponent(CbInputToken);
    fixture.componentRef.setInput('numInputs', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(3);
    fixture.componentRef.setInput('numInputs', 20);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(8);
  });

  it('es un grupo con nombre; cada casilla se nombra por su posición y oculta el dígito por defecto', () => {
    const { fixture, el, slots } = setup();
    expect(el.querySelector('[role="group"]')!.getAttribute('aria-label')).toBeTruthy();
    expect(slots()[2].getAttribute('aria-label')).toContain('3');
    expect(slots().every((s) => s.type === 'password' && s.inputMode === 'numeric')).toBe(true);
    fixture.componentInstance.unmasked.set(true);
    fixture.detectChanges();
    expect(slots()[0].type).toBe('text');
    expect(el.querySelector('.cb-input-token__help')!.textContent).toBe('Enviado a tu móvil');
    el.remove();
  });

  it('acepta solo dígitos y avanza el foco al escribir', () => {
    const { fixture, el, slots, type } = setup();
    slots()[0].focus();
    type(0, '7');
    expect(document.activeElement).toBe(slots()[1]);
    type(1, 'a');
    expect(slots()[1].value).toBe('');
    expect(document.activeElement).toBe(slots()[1]);
    type(1, '3');
    expect(fixture.componentInstance.code()).toBe('73');
    el.remove();
  });

  it('las flechas mueven el foco entre casillas', () => {
    const { el, slots, key } = setup();
    slots()[1].focus();
    key(1, 'ArrowRight');
    expect(document.activeElement).toBe(slots()[2]);
    key(2, 'ArrowLeft');
    key(1, 'ArrowLeft');
    expect(document.activeElement).toBe(slots()[0]);
    key(0, 'ArrowLeft');
    expect(document.activeElement).toBe(slots()[0]);
    el.remove();
  });

  it('Backspace borra la casilla actual o, si está vacía, la anterior', () => {
    const { fixture, el, slots, type, key } = setup();
    type(0, '1');
    type(1, '2');
    type(2, '3');
    key(2, 'Backspace');
    expect(fixture.componentInstance.code()).toBe('12');
    expect(document.activeElement).toBe(slots()[2]);
    key(2, 'Backspace');
    expect(fixture.componentInstance.code()).toBe('1');
    expect(document.activeElement).toBe(slots()[1]);
    el.remove();
  });

  it('borrar una casilla intermedia no desplaza las siguientes', () => {
    const { fixture, el, slots, paste, key } = setup();
    paste(0, '1234');
    key(1, 'Backspace');
    expect(slots().map((s) => s.value)).toEqual(['1', '', '3', '4']);
    expect(fixture.componentInstance.code()).toBe('1 34');
    el.remove();
  });

  it('pegar reparte los dígitos, ignora el resto y enfoca la última casilla rellenada', () => {
    const { fixture, el, slots, paste } = setup();
    paste(0, 'Código: 98-76-54');
    expect(fixture.componentInstance.code()).toBe('9876');
    expect(slots().map((s) => s.value)).toEqual(['9', '8', '7', '6']);
    expect(document.activeElement).toBe(slots()[3]);
    el.remove();
  });

  it('se integra con Reactive Forms: valor inicial, cambios, touched y disable()', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const slots = Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
    const ctrl = fixture.componentInstance.ctrl;
    expect(slots.map((s) => s.value)).toEqual(['1', '2', '', '']);

    slots[2].value = '3';
    slots[2].dispatchEvent(new Event('input'));
    expect(ctrl.value).toBe('123');
    expect(ctrl.touched).toBe(true);

    ctrl.disable();
    fixture.detectChanges();
    expect(slots.every((s) => s.disabled)).toBe(true);
  });
});
