import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKeyFilter, type CbKeyFilterPreset } from './keyfilter.directive';

@Component({
  imports: [CbKeyFilter],
  template: `<input [cbKeyFilter]="filter()" aria-label="Campo" />`,
})
class HostComponent {
  filter = signal<CbKeyFilterPreset | RegExp>('pint');
}

function setup(filter: CbKeyFilterPreset | RegExp) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.filter.set(filter);
  fixture.detectChanges();
  const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
  /** Devuelve true si la directiva bloquea la inserción. */
  const blocked = (data: string, inputType = 'insertText') => {
    const event = new InputEvent('beforeinput', { data, inputType, cancelable: true, bubbles: true });
    input.dispatchEvent(event);
    return event.defaultPrevented;
  };
  return { input, blocked };
}

describe('CbKeyFilter', () => {
  it('pint: solo dígitos', () => {
    const { blocked } = setup('pint');
    expect(blocked('7')).toBe(false);
    expect(blocked('a')).toBe(true);
    expect(blocked('-')).toBe(true);
  });

  it('int y num admiten signo; num y money admiten separadores decimales', () => {
    expect(setup('int').blocked('-')).toBe(false);
    expect(setup('int').blocked('.')).toBe(true);
    expect(setup('num').blocked(',')).toBe(false);
    expect(setup('money').blocked('-')).toBe(true);
  });

  it('alpha y alphanum aceptan tildes, ñ y espacios', () => {
    const { blocked } = setup('alpha');
    expect(blocked('ñ')).toBe(false);
    expect(blocked('É')).toBe(false);
    expect(blocked(' ')).toBe(false);
    expect(blocked('3')).toBe(true);
    expect(setup('alphanum').blocked('3')).toBe(false);
  });

  it('hex y email', () => {
    expect(setup('hex').blocked('F')).toBe(false);
    expect(setup('hex').blocked('g')).toBe(true);
    expect(setup('email').blocked('@')).toBe(false);
    expect(setup('email').blocked(' ')).toBe(true);
  });

  it('acepta una RegExp propia (también con flag g, sin efectos entre llamadas)', () => {
    const { blocked } = setup(/[A-Z0-9]/g);
    expect(blocked('A')).toBe(false);
    expect(blocked('B')).toBe(false);
    expect(blocked('a')).toBe(true);
  });

  it('al pegar comprueba todo el texto: bloquea si algún carácter no vale', () => {
    const { blocked } = setup('pint');
    expect(blocked('12345', 'insertFromPaste')).toBe(false);
    expect(blocked('12-345', 'insertFromPaste')).toBe(true);
  });

  it('no bloquea borrar ni otras ediciones', () => {
    const { input } = setup('pint');
    const event = new InputEvent('beforeinput', { inputType: 'deleteContentBackward', cancelable: true, bubbles: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
