import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbRadioGroupComponent } from './radio-group.component';
import { CbRadioComponent } from './radio.component';

@Component({
  imports: [ReactiveFormsModule, CbRadioGroupComponent, CbRadioComponent],
  template: `
    <cb-radio-group [formControl]="plan" ariaLabel="Plan">
      <cb-radio value="free" label="Gratis" />
      <cb-radio value="pro" label="Pro" />
    </cb-radio-group>
  `,
})
class HostComponent {
  plan = new FormControl<string | null>(null);
}

describe('CbRadioGroupComponent + CbRadioComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const radios = (): HTMLInputElement[] =>
      Array.from(el.querySelectorAll('input.cb-radio__input'));
    return { fixture, el, radios };
  }

  it('el host expone role="radiogroup" y aria-label', () => {
    const { el } = setup();
    const group = el.querySelector('cb-radio-group')!;
    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.getAttribute('aria-label')).toBe('Plan');
  });

  it('los radios hijos comparten el mismo name', () => {
    const { radios } = setup();
    const [free, pro] = radios();
    expect(free.name).toBeTruthy();
    expect(free.name).toBe(pro.name);
  });

  it('seleccionar un radio propaga el valor al FormControl', () => {
    const { fixture, radios } = setup();
    const [, pro] = radios();
    pro.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.plan.value).toBe('pro');
  });

  it('writeValue marca el radio correspondiente (group → hijo)', () => {
    const { fixture, radios } = setup();
    fixture.componentInstance.plan.setValue('free');
    fixture.detectChanges();
    const [free, pro] = radios();
    expect(free.checked).toBe(true);
    expect(pro.checked).toBe(false);
  });

  it('deshabilitar el grupo deshabilita a los hijos', () => {
    const { fixture, radios } = setup();
    fixture.componentInstance.plan.disable();
    fixture.detectChanges();
    expect(radios().every((r) => r.disabled)).toBe(true);
  });
});
