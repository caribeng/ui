import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbInputComponent } from './input.component';

@Component({
  imports: [ReactiveFormsModule, CbInputComponent],
  template: `<cb-input
    [formControl]="control"
    [label]="label()"
    [invalid]="invalid()"
    error="Campo inválido"
    hint="Ayuda"
  />`,
})
class HostComponent {
  control = new FormControl('');
  label = signal('Nombre');
  invalid = signal(false);
}

describe('CbInputComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = (): HTMLInputElement => el.querySelector('input.cb-input__field')!;
    return { fixture, el, input };
  }

  it('renderiza un input y una etiqueta asociada', () => {
    const { el, input } = setup();
    const label = el.querySelector('label.cb-input__label')!;
    expect(input()).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input().id);
  });

  it('escribe el valor del FormControl en el input (writeValue)', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue('hola');
    fixture.detectChanges();
    expect(input().value).toBe('hola');
  });

  it('propaga la entrada del usuario al FormControl (registerOnChange)', () => {
    const { fixture, input } = setup();
    input().value = 'mundo';
    input().dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('mundo');
  });

  it('marca touched en blur (registerOnTouched)', () => {
    const { fixture, input } = setup();
    expect(fixture.componentInstance.control.touched).toBe(false);
    input().dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it('refleja el estado disabled del FormControl (setDisabledState)', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input().disabled).toBe(true);
  });

  it('expone aria-invalid y aria-describedby cuando es inválido', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().getAttribute('aria-describedby')).toBe(`${input().id}-error`);
  });
});
