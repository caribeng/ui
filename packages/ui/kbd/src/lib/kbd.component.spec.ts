import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKbd } from './kbd.component';

describe('CbKbd', () => {
  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbKbd);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }
  const keys = (el: HTMLElement) => Array.from(el.querySelectorAll('.cb-kbd__key')).map((k) => k.textContent!.trim());

  it('proyecta una tecla suelta dentro de un <kbd>', () => {
    @Component({ imports: [CbKbd], template: `<cb-kbd>Esc</cb-kbd>` })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const kbd = (fixture.nativeElement as HTMLElement).querySelector('kbd')!;
    expect(kbd.textContent!.trim()).toBe('Esc');
  });

  it('fuera de Mac muestra la combinación con "+" y Ctrl para mod', () => {
    const el = setup({ keys: ['mod', 'shift', 'k'], platform: 'other' });
    expect(keys(el)).toEqual(['Ctrl', 'Shift', 'K']);
    expect(el.querySelectorAll('.cb-kbd__plus')).toHaveLength(2);
    // Una combinación es un <kbd> que contiene un <kbd> por tecla (HTML estándar).
    expect(el.querySelector('kbd.cb-kbd__combo > kbd.cb-kbd__key')).not.toBeNull();
  });

  it('en Mac usa símbolos y deja su nombre para el lector de pantalla', () => {
    const el = setup({ keys: ['mod', 'alt', 'Enter'], platform: 'mac' });
    expect(el.querySelectorAll('.cb-kbd__plus')).toHaveLength(0);
    const first = el.querySelector('.cb-kbd__key')!;
    expect(first.querySelector('[aria-hidden="true"]')!.textContent).toBe('⌘');
    expect(first.querySelector('.cb-kbd__sr')!.textContent).toBe('Command');
    expect(Array.from(el.querySelectorAll('.cb-kbd__sr')).map((s) => s.textContent)).toEqual(['Command', 'Option', 'Enter']);
  });

  it('respeta el texto libre de varias letras y el tamaño sm', () => {
    const el = setup({ keys: ['F2'], size: 'sm', platform: 'other' });
    expect(keys(el)).toEqual(['F2']);
    expect(el.classList).toContain('cb-kbd--sm');
  });
});
