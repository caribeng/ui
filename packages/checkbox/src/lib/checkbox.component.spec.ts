import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbCheckboxComponent } from './checkbox.component';

@Component({
  imports: [ReactiveFormsModule, CbCheckboxComponent],
  template: `
    <cb-checkbox [formControl]="binario" label="Acepto" />
    <cb-checkbox [formControl]="listaAdd" value="te" label="Té" />
    <cb-checkbox [formControl]="listaRemove" value="cafe" label="Café" />
    <cb-checkbox [indeterminate]="true" ariaLabel="parcial" />
  `,
})
class HostComponent {
  binario = new FormControl(false);
  listaAdd = new FormControl<string[]>(['cafe']);
  listaRemove = new FormControl<string[]>(['cafe', 'te']);
}

describe('CbCheckboxComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const inputs = (): HTMLInputElement[] =>
      Array.from(el.querySelectorAll('input.cb-checkbox__input'));
    return { fixture, el, inputs };
  }

  it('modo binario: writeValue y toggle propagan boolean', () => {
    const { fixture, inputs } = setup();
    const acepto = inputs()[0];
    expect(acepto.checked).toBe(false);

    acepto.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.binario.value).toBe(true);

    fixture.componentInstance.binario.setValue(false);
    fixture.detectChanges();
    expect(acepto.checked).toBe(false);
  });

  it('modo lista: marca cuando su value está en el array', () => {
    const { inputs } = setup();
    // listaAdd=['cafe'] value='te' → off ; listaRemove=['cafe','te'] value='cafe' → on
    expect(inputs()[1].checked).toBe(false);
    expect(inputs()[2].checked).toBe(true);
  });

  it('modo lista: toggle añade su value al array', () => {
    const { fixture, inputs } = setup();
    inputs()[1].dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.listaAdd.value).toEqual(['cafe', 'te']);
  });

  it('modo lista: toggle quita su value del array', () => {
    const { fixture, inputs } = setup();
    inputs()[2].dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.listaRemove.value).toEqual(['te']);
  });

  it('expone aria-checked="mixed" cuando es indeterminate', () => {
    const { inputs } = setup();
    expect(inputs()[3].getAttribute('aria-checked')).toBe('mixed');
  });
});
