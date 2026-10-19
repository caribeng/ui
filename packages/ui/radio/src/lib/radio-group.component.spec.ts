import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbRadioGroup } from './radio-group.component';

describe('CbRadioGroup', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbRadioGroup] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbRadioGroup);
    return { fixture, cmp: fixture.componentInstance };
  }

  it('select actualiza el valor, notifica (onChange) y emite changed', () => {
    const { cmp } = setup();
    let changed: unknown;
    let onChangeVal: unknown;
    cmp.changed.subscribe((v) => (changed = v));
    cmp.registerOnChange((v: unknown) => (onChangeVal = v));
    cmp.select('pro');
    expect(cmp.value()).toBe('pro');
    expect(cmp.isSelected('pro')).toBe(true);
    expect(cmp.isSelected('free')).toBe(false);
    expect(changed).toBe('pro');
    expect(onChangeVal).toBe('pro');
  });

  it('writeValue fija el valor sin emitir changed', () => {
    const { cmp } = setup();
    let emitted = false;
    cmp.changed.subscribe(() => (emitted = true));
    cmp.writeValue('team');
    expect(cmp.value()).toBe('team');
    expect(cmp.isSelected('team')).toBe(true);
    expect(emitted).toBe(false);
  });

  it('deshabilitado (CVA): select no cambia el valor', () => {
    const { cmp } = setup();
    cmp.setDisabledState(true);
    cmp.select('pro');
    expect(cmp.value()).toBe(null);
  });
});
