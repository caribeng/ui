import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbStepperComponent, CbStepComponent } from './stepper.component';

@Component({
  imports: [CbStepperComponent, CbStepComponent],
  template: `
    <cb-stepper>
      <cb-step label="Cuenta"><p class="s1">Paso 1</p></cb-step>
      <cb-step label="Perfil"><p class="s2">Paso 2</p></cb-step>
      <cb-step label="Confirmar"><p class="s3">Paso 3</p></cb-step>
    </cb-stepper>
  `,
})
class HostComponent {}

describe('CbStepperComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const items = (): HTMLElement[] => Array.from(el.querySelectorAll('.cb-stepper__item'));
    const indicators = (): HTMLButtonElement[] =>
      Array.from(el.querySelectorAll('.cb-stepper__indicator'));
    const next = (): HTMLButtonElement =>
      Array.from(el.querySelectorAll('.cb-stepper__nav button')).at(-1) as HTMLButtonElement;
    return { fixture, el, items, indicators, next };
  }

  it('renderiza un indicador por paso y muestra el primero', () => {
    const { el, indicators } = setup();
    expect(indicators().length).toBe(3);
    expect(el.querySelector('.s1')).toBeTruthy();
    expect(el.querySelector('.s2')).toBeNull();
  });

  it('Siguiente avanza y marca el anterior como completado', () => {
    const { fixture, el, items, next } = setup();
    next().click();
    fixture.detectChanges();
    expect(el.querySelector('.s2')).toBeTruthy();
    expect(el.querySelector('.s1')).toBeNull();
    expect(items()[0].classList).toContain('cb-is-complete');
    expect(items()[1].classList).toContain('cb-is-active');
  });

  it('hacer clic en un indicador salta a ese paso', () => {
    const { fixture, el, indicators } = setup();
    indicators()[2].click();
    fixture.detectChanges();
    expect(el.querySelector('.s3')).toBeTruthy();
  });
});
