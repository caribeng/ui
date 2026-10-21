import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInputSelect, type CbInputSelectOption } from './input-select.component';

const OPTIONS: CbInputSelectOption[] = [
  { label: 'Ahorros', value: 'ahorros' },
  { label: 'Corriente', value: 'corriente' },
];

@Component({
  imports: [CbInputSelect],
  template: `<cb-input-select label="Cuenta" [options]="options" [(value)]="value" [disabled]="disabled()" />`,
})
class HostComponent {
  options = OPTIONS;
  value = signal('corriente');
  disabled = signal(false);
}

@Component({
  imports: [CbInputSelect, ReactiveFormsModule],
  template: `<cb-input-select label="Cuenta" [options]="options" [formControl]="ctrl" requiredIndicator="asterisk" />`,
})
class FormHostComponent {
  options = OPTIONS;
  ctrl = new FormControl('ahorros', Validators.required);
}

describe('CbInputSelect', () => {
  it('renderiza el placeholder y las opciones configuradas', () => {
    const fixture = TestBed.createComponent(CbInputSelect);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    const options = Array.from(fixture.nativeElement.querySelectorAll('option')) as HTMLOptionElement[];
    expect(options.map((o) => o.textContent!.trim())).toEqual(['Seleccionar', 'Ahorros', 'Corriente']);
    expect(options[0].disabled).toBe(true);
    expect((fixture.nativeElement.querySelector('select') as HTMLSelectElement).value).toBe('');
  });

  it('muestra seleccionado el valor inicial y la etiqueta asocia el select', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const select = el.querySelector('select')!;
    expect(select.value).toBe('corriente');
    expect(select.closest('label')!.textContent).toContain('Cuenta');
  });

  it('actualiza el modelo al elegir otra opción y refleja cambios externos', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'ahorros';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('ahorros');

    fixture.componentInstance.value.set('corriente');
    fixture.detectChanges();
    expect(select.value).toBe('corriente');
  });

  it('se deshabilita con disabled', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('select') as HTMLSelectElement).disabled).toBe(true);
  });

  it('se integra con Reactive Forms: valor, touched, inválido, obligatorio y disable()', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const select = el.querySelector('select')!;
    const ctrl = fixture.componentInstance.ctrl;
    expect(select.value).toBe('ahorros');
    expect(el.querySelector('.cb-input-select__required--asterisk')).not.toBeNull();

    ctrl.setValue('');
    ctrl.markAsTouched();
    fixture.detectChanges();
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(select.getAttribute('aria-required')).toBe('true');

    select.value = 'corriente';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(ctrl.value).toBe('corriente');
    expect(select.getAttribute('aria-invalid')).toBeNull();

    ctrl.disable();
    fixture.detectChanges();
    expect(select.disabled).toBe(true);
  });
});
