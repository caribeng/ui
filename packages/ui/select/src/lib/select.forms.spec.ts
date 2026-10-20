import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbSelect } from './select.component';

@Component({
  imports: [ReactiveFormsModule, CbSelect],
  template: `<cb-select [formControl]="ciudad" [options]="['Cartagena', 'Medellín']" ariaLabel="Ciudad" />`,
})
class HostComponent {
  ciudad = new FormControl<string | null>(null, Validators.required);
}

describe('CbSelect + Angular Forms (automático)', () => {
  it('expone aria-required y marca el error al tocarse', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const combobox: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(combobox.getAttribute('aria-required')).toBe('true');
    expect(combobox.classList).not.toContain('cb-is-invalid');

    combobox.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(combobox.classList).toContain('cb-is-invalid');
    expect(combobox.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.ciudad.setValue('Cartagena');
    fixture.detectChanges();
    expect(combobox.classList).not.toContain('cb-is-invalid');
  });
});
