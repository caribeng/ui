import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInput } from './input.component';

@Component({
  imports: [ReactiveFormsModule, CbInput],
  template: `<cb-input label="Correo" [formControl]="email" error="Ingresa un correo válido" />`,
})
class HostComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
}

@Component({
  imports: [ReactiveFormsModule, CbInput],
  template: `<cb-input label="Nombre" [formControl]="nombre" />`,
})
class HostWithoutErrorComponent {
  nombre = new FormControl('', Validators.required);
}

describe('CbInput + Angular Forms (automático)', () => {
  it('sin [error] marca el campo pero no muestra ningún mensaje', () => {
    const fixture = TestBed.createComponent(HostWithoutErrorComponent);
    fixture.detectChanges();
    fixture.componentInstance.nombre.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    expect(input.classList).toContain('cb-is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = () => el.querySelector('input')!;
    return { fixture, el, input };
  }

  it('por defecto (none) no pinta indicador, pero el campo sigue siendo requerido', () => {
    const { el, input } = setup();
    expect(el.querySelector('.cb-input__required')).toBeNull();
    expect(input().required).toBe(true);
  });

  it('no marca error hasta que el campo se toca', () => {
    const { el, input } = setup();
    expect(input().classList).not.toContain('cb-is-invalid');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('al salir del campo vacío muestra el error sin [invalid]', () => {
    const { fixture, el, input } = setup();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input().classList).toContain('cb-is-invalid');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('[role="alert"]')?.textContent?.trim()).toBe('Ingresa un correo válido');
  });

  it('el error desaparece cuando el valor es válido', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.email.markAsTouched();
    fixture.detectChanges();
    expect(input().classList).toContain('cb-is-invalid');

    input().value = 'ana@correo.com';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input().classList).not.toContain('cb-is-invalid');
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('markAllAsTouched() al enviar muestra los errores', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.email.markAllAsTouched();
    fixture.detectChanges();
    expect(input().classList).toContain('cb-is-invalid');
  });
});
