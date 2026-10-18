import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbToggleButton } from './togglebutton.component';

@Component({
  imports: [ReactiveFormsModule, CbToggleButton],
  template: `<cb-togglebutton [formControl]="control" onLabel="Encendido" offLabel="Apagado" />`,
})
class HostComponent {
  control = new FormControl(false);
}

describe('CbToggleButton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn = (): HTMLButtonElement => fixture.nativeElement.querySelector('.cb-togglebutton');
    return { fixture, btn };
  }

  it('muestra la etiqueta off y aria-pressed=false al inicio', () => {
    const { btn } = setup();
    expect(btn().textContent?.trim()).toBe('Apagado');
    expect(btn().getAttribute('aria-pressed')).toBe('false');
  });

  it('al pulsar cambia el estado, la etiqueta y propaga al control', () => {
    const { fixture, btn } = setup();
    btn().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
    expect(btn().getAttribute('aria-pressed')).toBe('true');
    expect(btn().textContent?.trim()).toBe('Encendido');
  });

  it('refleja el valor del FormControl (writeValue)', () => {
    const { fixture, btn } = setup();
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(btn().classList).toContain('cb-is-on');
  });
});
