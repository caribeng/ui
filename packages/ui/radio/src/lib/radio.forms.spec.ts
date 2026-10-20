import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbRadioGroup } from './radio-group.component';
import { CbRadio } from './radio.component';

@Component({
  imports: [ReactiveFormsModule, CbRadioGroup, CbRadio],
  template: `
    <cb-radio-group [formControl]="plan" ariaLabel="Plan">
      <cb-radio value="basico" label="Básico" />
      <cb-radio value="pro" label="Pro" />
    </cb-radio-group>
  `,
})
class HostComponent {
  plan = new FormControl<string | null>(null, Validators.required);
}

describe('CbRadioGroup + Angular Forms (automático)', () => {
  it('el grupo y sus radios reflejan el estado inválido', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const group: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');
    const radios = () => Array.from(fixture.nativeElement.querySelectorAll('.cb-radio')) as HTMLElement[];
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(group.getAttribute('aria-invalid')).toBeNull();

    fixture.componentInstance.plan.markAsTouched();
    fixture.detectChanges();
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(radios().every((r) => r.classList.contains('cb-is-invalid'))).toBe(true);

    fixture.componentInstance.plan.setValue('pro');
    fixture.detectChanges();
    expect(group.getAttribute('aria-invalid')).toBeNull();
    expect(radios().some((r) => r.classList.contains('cb-is-invalid'))).toBe(false);
  });
});
