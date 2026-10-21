import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInputDate } from './input-date.component';

@Component({
  imports: [CbInputDate],
  template: `<cb-input-date label="Fecha de pago" min="2026-01-01" max="2026-12-31" [(value)]="date" [disabled]="disabled()" />`,
})
class HostComponent {
  date = signal('2026-10-20');
  disabled = signal(false);
}

@Component({
  imports: [CbInputDate, ReactiveFormsModule],
  template: `<cb-input-date label="Fecha" [formControl]="ctrl" requiredIndicator="text" />`,
})
class FormHostComponent {
  ctrl = new FormControl('2026-05-01', Validators.required);
}

describe('CbInputDate', () => {
  it('es un input date asociado a su etiqueta, con min, max y valor inicial', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(input.closest('label')!.textContent).toContain('Fecha de pago');
    expect(input.min).toBe('2026-01-01');
    expect(input.max).toBe('2026-12-31');
    expect(input.value).toBe('2026-10-20');
  });

  it('actualiza el modelo al elegir una fecha y se deshabilita con disabled', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '2026-11-05';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.date()).toBe('2026-11-05');

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('sin min ni max no añade los atributos', () => {
    const fixture = TestBed.createComponent(CbInputDate);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('min')).toBe(false);
    expect(input.hasAttribute('max')).toBe(false);
    expect(fixture.nativeElement.querySelector('.cb-input-date__label')).toBeNull();
  });

  it('se integra con Reactive Forms: valor, touched, inválido, indicador y disable()', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector('input')!;
    const ctrl = fixture.componentInstance.ctrl;
    expect(input.value).toBe('2026-05-01');
    expect(el.querySelector('.cb-input-date__required--required')!.textContent).toBe('(requerido)');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(ctrl.value).toBe('');
    expect(ctrl.touched).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');

    ctrl.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});
