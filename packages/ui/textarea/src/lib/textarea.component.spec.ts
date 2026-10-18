import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTextarea } from './textarea.component';

@Component({
  imports: [ReactiveFormsModule, CbTextarea],
  template: `<cb-textarea
    [formControl]="control"
    label="Biografía"
    [maxlength]="280"
    hint="Ayuda"
  />`,
})
class HostComponent {
  control = new FormControl('');
}

describe('CbTextarea', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const field = (): HTMLTextAreaElement => el.querySelector('textarea.cb-textarea__field')!;
    return { fixture, el, field };
  }

  it('renderiza un textarea con su etiqueta asociada', () => {
    const { el, field } = setup();
    const label = el.querySelector('label.cb-textarea__label')!;
    expect(field()).toBeTruthy();
    expect(label.getAttribute('for')).toBe(field().id);
  });

  it('escribe el valor del FormControl en el textarea (writeValue)', () => {
    const { fixture, field } = setup();
    fixture.componentInstance.control.setValue('hola');
    fixture.detectChanges();
    expect(field().value).toBe('hola');
  });

  it('propaga la entrada del usuario al FormControl (registerOnChange)', () => {
    const { fixture, field } = setup();
    field().value = 'mundo';
    field().dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('mundo');
  });

  it('muestra el contador de caracteres cuando hay maxlength', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.control.setValue('abc');
    fixture.detectChanges();
    const count = el.querySelector('.cb-textarea__count')!;
    expect(count.textContent?.replace(/\s/g, '')).toBe('3/280');
  });

  it('marca touched en blur (registerOnTouched)', () => {
    const { fixture, field } = setup();
    expect(fixture.componentInstance.control.touched).toBe(false);
    field().dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
