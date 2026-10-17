import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbBadgeComponent } from './badge.component';

describe('CbBadgeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbBadgeComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbBadgeComponent);
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('muestra el valor y la clase de severidad/tamaño', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', 8);
    fixture.componentRef.setInput('severity', 'danger');
    fixture.detectChanges();
    expect(host().textContent?.trim()).toBe('8');
    expect(host().classList).toContain('cb-badge--danger');
    expect(host().classList).toContain('cb-badge--md');
  });

  it('en modo dot no muestra texto', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    expect(host().classList).toContain('cb-badge--dot');
    expect(host().textContent?.trim()).toBe('');
  });
});
