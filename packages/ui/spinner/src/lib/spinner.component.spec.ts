import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSpinner } from './spinner.component';

describe('CbSpinner', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbSpinner] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbSpinner);
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('renderiza un SVG con role=status y aria-label por defecto', () => {
    const { fixture, host } = setup();
    fixture.detectChanges();
    expect(host().getAttribute('role')).toBe('status');
    expect(host().getAttribute('aria-label')).toBe('Cargando');
    expect(host().querySelector('svg .cb-spinner__arc')).toBeTruthy();
  });

  it('aplica tamaño y severidad', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('size', 48);
    fixture.componentRef.setInput('severity', 'danger');
    fixture.detectChanges();
    const svg = host().querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('48');
    expect(host().classList).toContain('cb-spinner--danger');
  });
});
