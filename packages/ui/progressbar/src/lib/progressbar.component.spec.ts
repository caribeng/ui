import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbProgressBarComponent } from './progressbar.component';

describe('CbProgressBarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbProgressBarComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbProgressBarComponent);
    const host = (): HTMLElement => fixture.nativeElement;
    const fill = (): HTMLElement => host().querySelector('.cb-progressbar__fill')!;
    return { fixture, host, fill };
  }

  it('determinada: refleja el valor en el ancho y en aria', () => {
    const { fixture, host, fill } = setup();
    fixture.componentRef.setInput('value', 60);
    fixture.detectChanges();
    expect(host().getAttribute('role')).toBe('progressbar');
    expect(host().getAttribute('aria-valuenow')).toBe('60');
    expect(fill().style.width).toBe('60%');
  });

  it('acota el valor a 0–100', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();
    expect(host().getAttribute('aria-valuenow')).toBe('100');
  });

  it('indeterminada cuando value es null', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    expect(host().classList).toContain('cb-progressbar--indeterminate');
    expect(host().getAttribute('aria-valuenow')).toBeNull();
  });

  it('muestra el porcentaje con showValue', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('showValue', true);
    fixture.detectChanges();
    expect(host().querySelector('.cb-progressbar__value')?.textContent?.trim()).toBe('42%');
  });
});
