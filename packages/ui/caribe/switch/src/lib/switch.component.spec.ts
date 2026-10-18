import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSwitch } from './switch.component';

@Component({
  imports: [ReactiveFormsModule, CbSwitch],
  template: `<cb-switch
    [formControl]="control"
    label="Notificaciones"
    [required]="true"
  />`,
})
class HostComponent {
  control = new FormControl(false);
}

describe('CbSwitch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = (): HTMLInputElement =>
      el.querySelector('input.cb-switch__input')!;
    return { fixture, el, input };
  }

  it('renderiza un input role="switch" con su etiqueta', () => {
    const { el, input } = setup();
    expect(input().getAttribute('role')).toBe('switch');
    expect(el.querySelector('.cb-switch__label')?.textContent?.trim()).toBe(
      'Notificaciones',
    );
  });

  it('expone aria-required cuando required es true', () => {
    const { input } = setup();
    expect(input().getAttribute('aria-required')).toBe('true');
  });

  it('refleja el valor del FormControl (writeValue)', () => {
    const { fixture, input } = setup();
    expect(input().checked).toBe(false);
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(input().checked).toBe(true);
    expect(input().getAttribute('aria-checked')).toBe('true');
  });

  it('propaga el cambio al FormControl (registerOnChange)', () => {
    const { fixture, input } = setup();
    input().dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('marca touched en blur (registerOnTouched)', () => {
    const { fixture, input } = setup();
    expect(fixture.componentInstance.control.touched).toBe(false);
    input().dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it('refleja disabled del FormControl (setDisabledState)', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input().disabled).toBe(true);
  });
});
