import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbInputNumber } from './input-number.component';

@Component({
  imports: [ReactiveFormsModule, CbInputNumber],
  template: `
    <cb-input-number
      [formControl]="decimal"
      locale="en-US"
      [min]="0"
      [max]="100"
      [step]="5"
      showButtons
      label="Cantidad"
    />
    <cb-input-number
      [formControl]="precio"
      locale="en-US"
      mode="currency"
      currency="USD"
    />
  `,
})
class HostComponent {
  decimal = new FormControl<number | null>(null);
  precio = new FormControl<number | null>(null);
}

describe('CbInputNumber', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const fields = (): HTMLInputElement[] =>
      Array.from(el.querySelectorAll('input.cb-input-number__field'));
    return { fixture, el, fields };
  }

  it('formatea el valor del FormControl con agrupación (writeValue)', () => {
    const { fixture, fields } = setup();
    fixture.componentInstance.decimal.setValue(1234.5);
    fixture.detectChanges();
    expect(fields()[0].value).toBe('1,234.5');
    expect(fields()[0].getAttribute('role')).toBe('spinbutton');
  });

  it('formatea como moneda cuando mode="currency"', () => {
    const { fixture, fields } = setup();
    fixture.componentInstance.precio.setValue(1299.99);
    fixture.detectChanges();
    expect(fields()[1].value).toBe('$1,299.99');
  });

  it('parsea la entrada del usuario al salir del campo (blur)', () => {
    const { fixture, fields } = setup();
    const f = fields()[0];
    f.dispatchEvent(new Event('focus'));
    f.value = '2,500';
    f.dispatchEvent(new Event('input'));
    f.dispatchEvent(new Event('blur'));
    // clamp a max=100
    expect(fixture.componentInstance.decimal.value).toBe(100);
  });

  it('las flechas incrementan por step y respetan min/max', () => {
    const { fixture, fields } = setup();
    fixture.componentInstance.decimal.setValue(10);
    fixture.detectChanges();
    const f = fields()[0];
    f.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(fixture.componentInstance.decimal.value).toBe(15);
    f.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(fixture.componentInstance.decimal.value).toBe(10);
  });

  it('el botón incrementar sube el valor', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.decimal.setValue(0);
    fixture.detectChanges();
    const up = el.querySelector<HTMLButtonElement>('.cb-input-number__btn--up')!;
    up.click();
    expect(fixture.componentInstance.decimal.value).toBe(5);
  });

  it('al enfocar muestra el valor crudo ya seleccionado (escribir lo reemplaza) y usa 2 decimales en moneda', () => {
    const fixture = TestBed.createComponent(CopHostComponent);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.value.replace(/\s/g, ' ')).toBe('$ 1.250.000,50');
    input.focus();
    input.dispatchEvent(new FocusEvent('focus'));
    expect(input.value).toBe('1250000,5');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, input.value.length]);
    input.value = '2000000';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.valor).toBe(2000000);
    expect(input.value.replace(/\s/g, ' ')).toBe('$ 2.000.000,00');
  });
});

@Component({
  imports: [CbInputNumber],
  template: `<cb-input-number [(value)]="valor" mode="currency" currency="COP" locale="es-CO" />`,
})
class CopHostComponent {
  valor: number | null = 1250000.5;
}

