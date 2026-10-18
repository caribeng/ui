import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTag } from './tag.component';

describe('CbTag', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbTag] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbTag);
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('muestra el valor y la clase de severidad', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', 'Nuevo');
    fixture.componentRef.setInput('severity', 'success');
    fixture.detectChanges();
    expect(host().querySelector('.cb-tag__label')?.textContent?.trim()).toBe('Nuevo');
    expect(host().classList).toContain('cb-tag--success');
  });

  it('renderiza un icono cuando se indica', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('value', 'Ok');
    fixture.componentRef.setInput('icon', 'check');
    fixture.detectChanges();
    expect(host().querySelector('cb-icon svg')).toBeTruthy();
  });

  it('rounded aplica su modificador', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('rounded', true);
    fixture.detectChanges();
    expect(host().classList).toContain('cb-tag--rounded');
  });
});
