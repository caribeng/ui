import { Component, booleanAttribute, forwardRef, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
  type ControlValueAccessor,
} from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { cbFieldState } from './field-state';

@Component({
  selector: 'cb-test-field',
  template: `<span [class.inv]="state.invalid()" [class.req]="state.required()"></span>`,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TestField), multi: true }],
})
class TestField implements ControlValueAccessor {
  readonly invalid = input(false);
  readonly required = input(false, { transform: booleanAttribute });
  readonly state = cbFieldState({ invalid: () => this.invalid(), required: () => this.required() });
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

@Component({
  imports: [ReactiveFormsModule, TestField],
  template: `<cb-test-field [formControl]="ctrl" />`,
})
class ReactiveHost {
  ctrl = new FormControl('', [Validators.required, Validators.email]);
}

@Component({
  imports: [FormsModule, TestField],
  template: `<cb-test-field [(ngModel)]="value" required />`,
})
class TemplateHost {
  value = '';
}

@Component({
  imports: [TestField],
  template: `<cb-test-field [invalid]="invalid()" [required]="required()" />`,
})
class ManualHost {
  invalid = signal(false);
  required = signal(false);
}

const span = (el: HTMLElement) => el.querySelector('span')!;

describe('cbFieldState', () => {
  it('lee el estado de un FormControl reactivo', () => {
    const f = TestBed.createComponent(ReactiveHost);
    f.detectChanges();
    // Requerido por el validador; aún no es inválido porque no se ha tocado.
    expect(span(f.nativeElement).classList).toContain('req');
    expect(span(f.nativeElement).classList).not.toContain('inv');

    f.componentInstance.ctrl.markAsTouched();
    f.detectChanges();
    expect(span(f.nativeElement).classList).toContain('inv');

    f.componentInstance.ctrl.setValue('ana@correo.com');
    f.detectChanges();
    expect(span(f.nativeElement).classList).not.toContain('inv');
  });

  it('marca inválido al modificar el valor (dirty) sin esperar al blur', () => {
    const f = TestBed.createComponent(ReactiveHost);
    f.detectChanges();
    f.componentInstance.ctrl.setValue('no-es-correo');
    f.componentInstance.ctrl.markAsDirty();
    f.detectChanges();
    expect(span(f.nativeElement).classList).toContain('inv');
  });

  it('no marca requerido si los validadores no incluyen required', () => {
    const f = TestBed.createComponent(ReactiveHost);
    f.componentInstance.ctrl = new FormControl('', Validators.email);
    f.detectChanges();
    expect(span(f.nativeElement).classList).not.toContain('req');
  });

  it('detecta el atributo required de un formulario por plantilla', async () => {
    const f = TestBed.createComponent(TemplateHost);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(span(f.nativeElement).classList).toContain('req');
  });

  it('respeta los inputs manuales sin formulario', () => {
    const f = TestBed.createComponent(ManualHost);
    f.detectChanges();
    expect(span(f.nativeElement).classList).not.toContain('inv');

    f.componentInstance.invalid.set(true);
    f.componentInstance.required.set(true);
    f.detectChanges();
    expect(span(f.nativeElement).classList).toContain('inv');
    expect(span(f.nativeElement).classList).toContain('req');
  });
});
