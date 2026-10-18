import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbButton } from './button.component';

describe('CbButton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbButton] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbButton);
    const btn = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector('button.cb-button');
    fixture.detectChanges();
    return { fixture, btn };
  }

  it('renderiza un <button> con el contenido proyectado', () => {
    @Component({
      imports: [CbButton],
      template: `<cb-button>Texto</cb-button>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.cb-button');
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toContain('Texto');
  });

  it('aplica las clases de severidad, variante y tamaño por defecto', () => {
    const { btn } = setup();
    expect(btn().classList).toContain('cb-button--primary');
    expect(btn().classList).toContain('cb-button--solid');
    expect(btn().classList).toContain('cb-button--md');
  });

  it('refleja los inputs de severidad y variante', () => {
    const { fixture, btn } = setup();
    fixture.componentRef.setInput('severity', 'danger');
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.detectChanges();
    expect(btn().classList).toContain('cb-button--danger');
    expect(btn().classList).toContain('cb-button--outlined');
  });

  it('deshabilita el botón cuando disabled es true', () => {
    const { fixture, btn } = setup();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(btn().disabled).toBe(true);
  });

  it('bloquea y marca aria-busy cuando loading es true', () => {
    const { fixture, btn } = setup();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(btn().disabled).toBe(true);
    expect(btn().getAttribute('aria-busy')).toBe('true');
    expect(btn().querySelector('.cb-button__spinner')).toBeTruthy();
  });
});
