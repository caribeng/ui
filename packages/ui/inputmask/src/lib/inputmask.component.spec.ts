import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInputMask } from './inputmask.component';

@Component({
  imports: [CbInputMask],
  template: `<cb-input-mask [mask]="mask()" [unmask]="unmask()" [(value)]="val" ariaLabel="Código" />`,
})
class HostComponent {
  mask = signal('999-999');
  unmask = signal(false);
  val = signal('');
}

@Component({
  imports: [CbInputMask, ReactiveFormsModule],
  template: `<cb-input-mask mask="(999) 999-9999" [formControl]="ctrl" />`,
})
class FormHostComponent {
  ctrl = new FormControl('3001234567', Validators.required);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  return { fixture, input, type };
}


@Component({
  imports: [CbInputMask],
  template: `<label for="tel">Teléfono</label><cb-input-mask inputId="tel" mask="999" />`,
})
class LabelHostComponent {}

describe('CbInputMask', () => {
  it('aplica la máscara numérica e ignora letras', () => {
    const { fixture, input, type } = setup();
    type('12a3456');
    expect(input.value).toBe('123-456');
    expect(fixture.componentInstance.val()).toBe('123-456');
  });

  it('no añade el literal hasta que llega el carácter siguiente (Backspace puede borrarlo)', () => {
    const { input, type } = setup();
    type('123');
    expect(input.value).toBe('123');
    type('1234');
    expect(input.value).toBe('123-4');
    type('123-');
    expect(input.value).toBe('123');
  });

  it('muestra los literales iniciales de la máscara', () => {
    const { fixture, input, type } = setup();
    fixture.componentInstance.mask.set('(999) 999');
    fixture.detectChanges();
    type('3');
    expect(input.value).toBe('(3');
    type('30012');
    expect(input.value).toBe('(300) 12');
  });

  it('corta la entrada al largo de la máscara', () => {
    const { input, type } = setup();
    type('123456789');
    expect(input.value).toBe('123-456');
  });

  it('respeta los tokens de letra (a) y alfanumérico (*)', () => {
    const { fixture, input, type } = setup();
    fixture.componentInstance.mask.set('aa-**');
    fixture.detectChanges();
    type('a1b2c3');
    expect(input.value).toBe('ab-2c');
  });

  it('con unmask el modelo excluye los literales', () => {
    const { fixture, input, type } = setup();
    fixture.componentInstance.unmask.set(true);
    fixture.detectChanges();
    type('123456');
    expect(input.value).toBe('123-456');
    expect(fixture.componentInstance.val()).toBe('123456');
  });

  it('usa la máscara como placeholder y aplica ariaLabel', () => {
    const { input } = setup();
    expect(input.placeholder).toBe('999-999');
    expect(input.getAttribute('aria-label')).toBe('Código');
  });

  it('se integra con Reactive Forms: formatea el valor inicial, marca touched y se deshabilita', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const ctrl = fixture.componentInstance.ctrl;
    expect(input.value).toBe('(300) 123-4567');

    input.dispatchEvent(new Event('blur'));
    expect(ctrl.touched).toBe(true);

    ctrl.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('marca aria-invalid cuando el control es inválido y fue tocado', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    const ctrl = fixture.componentInstance.ctrl;
    ctrl.setValue('');
    ctrl.markAsTouched();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');
  });
  it('inputId asocia el campo a su label; sin él, el id es único', () => {
    const fixture = TestBed.createComponent(LabelHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('input')!.id).toBe('tel');
    const other = TestBed.createComponent(HostComponent);
    other.detectChanges();
    expect((other.nativeElement as HTMLElement).querySelector('input')!.id).toMatch(/^cb-input-mask-\d+$/);
  });
});
