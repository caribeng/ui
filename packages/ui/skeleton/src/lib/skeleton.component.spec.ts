import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSkeleton } from './skeleton.component';

describe('CbSkeleton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbSkeleton] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbSkeleton);
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('por defecto es texto con animación wave y ancho 100%', () => {
    const { fixture, host } = setup();
    fixture.detectChanges();
    expect(host().classList).toContain('cb-skeleton--text');
    expect(host().classList).toContain('cb-skeleton--wave');
    expect(host().style.width).toBe('100%');
    expect(host().style.height).toBe('1rem');
  });

  it('circle iguala el alto al ancho', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('shape', 'circle');
    fixture.componentRef.setInput('width', '3rem');
    fixture.detectChanges();
    expect(host().classList).toContain('cb-skeleton--circle');
    expect(host().style.height).toBe('3rem');
  });

  it('respeta un alto explícito en rect', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('shape', 'rect');
    fixture.componentRef.setInput('height', '8rem');
    fixture.detectChanges();
    expect(host().style.height).toBe('8rem');
  });
});
