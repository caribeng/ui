import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbStepIndicator } from './step-indicator.component';

function setup(current: number, total: number, label = '') {
  const fixture = TestBed.createComponent(CbStepIndicator);
  fixture.componentRef.setInput('currentStep', current);
  fixture.componentRef.setInput('totalSteps', total);
  fixture.componentRef.setInput('label', label);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return {
    el,
    bar: el.querySelector<HTMLElement>('[role="progressbar"]')!,
    segments: () => Array.from(el.querySelectorAll('.cb-step-indicator__segment')),
  };
}

describe('CbStepIndicator', () => {
  it('muestra el paso actual y el total', () => {
    const { el } = setup(2, 4);
    expect(el.textContent).toContain('Paso 2 de 4');
  });

  it('es una barra de progreso con valores y texto legible', () => {
    const { bar } = setup(2, 4, 'Datos personales');
    expect(bar.getAttribute('aria-valuemin')).toBe('1');
    expect(bar.getAttribute('aria-valuemax')).toBe('4');
    expect(bar.getAttribute('aria-valuenow')).toBe('2');
    expect(bar.getAttribute('aria-valuetext')).toBe('Paso 2 de 4');
    expect(bar.getAttribute('aria-label')).toBe('Datos personales');
  });

  it('marca los segmentos completados y el activo; la pista es decorativa', () => {
    const { el, segments } = setup(3, 4);
    expect(el.querySelector('.cb-step-indicator__track')!.getAttribute('aria-hidden')).toBe('true');
    expect(segments().map((s) => s.className.includes('--done'))).toEqual([true, true, false, false]);
    expect(segments()[2].className).toContain('--active');
  });

  it('limita el paso actual al rango 1…total', () => {
    expect(setup(9, 3).bar.getAttribute('aria-valuenow')).toBe('3');
    expect(setup(-2, 3).bar.getAttribute('aria-valuenow')).toBe('1');
    expect(setup(1, 0).bar.getAttribute('aria-valuemax')).toBe('1');
  });

  it('sin label usa el nombre por defecto y no muestra la leyenda', () => {
    const { el, bar } = setup(1, 2);
    expect(bar.getAttribute('aria-label')).toBeTruthy();
    expect(el.querySelector('.cb-step-indicator__label')).toBeNull();
  });
});
