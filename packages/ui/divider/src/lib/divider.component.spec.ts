import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDivider } from './divider.component';

describe('CbDivider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbDivider] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbDivider);
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('por defecto es un separador horizontal', () => {
    const { fixture, host } = setup();
    fixture.detectChanges();
    expect(host().getAttribute('role')).toBe('separator');
    expect(host().getAttribute('aria-orientation')).toBe('horizontal');
    expect(host().classList).toContain('cb-divider--horizontal');
  });

  it('refleja orientación y tipo', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('type', 'dashed');
    fixture.detectChanges();
    expect(host().getAttribute('aria-orientation')).toBe('vertical');
    expect(host().classList).toContain('cb-divider--vertical');
    expect(host().classList).toContain('cb-divider--dashed');
  });
});
