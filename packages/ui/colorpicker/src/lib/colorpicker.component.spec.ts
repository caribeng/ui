import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbColorPicker } from './colorpicker.component';

@Component({
  imports: [ReactiveFormsModule, CbColorPicker],
  template: `<cb-colorpicker [formControl]="control" />`,
})
class HostComponent {
  control = new FormControl('#10b981');
}

describe('CbColorPicker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = (): HTMLButtonElement => el.querySelector('.cb-colorpicker__trigger')!;
    const valueText = (): string => el.querySelector('.cb-colorpicker__value')!.textContent!.trim();
    const hexInput = (): HTMLInputElement => document.querySelector('.cb-colorpicker__hex')!;
    const presets = (): HTMLButtonElement[] =>
      Array.from(document.querySelectorAll('.cb-colorpicker__preset'));
    const openPanel = () => {
      trigger().click();
      fixture.detectChanges();
    };
    return { fixture, el, trigger, valueText, hexInput, presets, openPanel };
  }

  it('el trigger muestra el color y aria-expanded', () => {
    const { trigger } = setup();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-label')).toContain('#');
  });

  it('refleja el color del FormControl (writeValue, round-trip exacto en primarios)', () => {
    const { fixture, valueText } = setup();
    fixture.componentInstance.control.setValue('#ff0000');
    fixture.detectChanges();
    expect(valueText().toLowerCase()).toBe('#ff0000');
  });

  it('abre un panel con área, matiz, hex y presets', () => {
    const { openPanel, trigger, hexInput, presets } = setup();
    openPanel();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.cb-colorpicker__sv')).toBeTruthy();
    expect(document.querySelector('.cb-colorpicker__hue')).toBeTruthy();
    expect(hexInput()).toBeTruthy();
    expect(presets().length).toBeGreaterThan(0);
  });

  it('escribir un hex válido actualiza el FormControl', () => {
    const { fixture, openPanel, hexInput } = setup();
    openPanel();
    hexInput().value = '#00ff00';
    hexInput().dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe('#00ff00');
  });

  it('elegir un preset cambia el valor (hex válido)', () => {
    const { fixture, openPanel, presets, hexInput } = setup();
    openPanel();
    presets()[0].click();
    fixture.detectChanges();
    const v = fixture.componentInstance.control.value!;
    expect(v).toMatch(/^#[0-9a-f]{6}$/i);
    expect(v).toBe(hexInput().value);
  });

  it('un hex inválido se revierte al valor actual', () => {
    const { fixture, openPanel, hexInput } = setup();
    openPanel();
    const before = fixture.componentInstance.control.value;
    hexInput().value = 'no-es-color';
    hexInput().dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe(before);
    expect(hexInput().value).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
