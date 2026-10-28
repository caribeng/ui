import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CB_CONFIG, CB_DEFAULT_CONFIG, type CaribeNgConfig, type CbRequiredIndicator } from '@caribeng/ui';
import { CbInput } from './input.component';

@Component({
  imports: [ReactiveFormsModule, CbInput],
  template: `
    <cb-input class="email" label="Correo" [formControl]="email" [requiredIndicator]="override()" />
    <cb-input class="phone" label="Teléfono" [formControl]="phone" />
  `,
})
class HostComponent {
  email = new FormControl('', Validators.required);
  phone = new FormControl('');
  override = signal<CbRequiredIndicator | undefined>(undefined);
}

function setup(config: Partial<CaribeNgConfig> = {}) {
  TestBed.configureTestingModule({
    providers: [{ provide: CB_CONFIG, useValue: { ...CB_DEFAULT_CONFIG, locale: 'es', ...config } }],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const mark = (field: 'email' | 'phone') =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`.${field} .cb-input__required`);
  return { fixture, mark };
}

describe('CbInput · requiredIndicator', () => {
  it("'none' (por defecto) no pinta nada", () => {
    const { mark } = setup();
    expect(mark('email')).toBeNull();
    expect(mark('phone')).toBeNull();
  });

  it("'asterisk' marca los obligatorios con * oculto al lector de pantalla", () => {
    const { mark } = setup({ requiredIndicator: 'asterisk' });
    expect(mark('email')?.textContent).toBe('*');
    expect(mark('email')?.getAttribute('aria-hidden')).toBe('true');
    expect(mark('phone')).toBeNull();
  });

  it("'text' marca los obligatorios con (requerido)", () => {
    const { mark } = setup({ requiredIndicator: 'text' });
    expect(mark('email')?.textContent).toBe('(requerido)');
    expect(mark('email')?.classList).toContain('cb-input__required--required');
    expect(mark('phone')).toBeNull();
  });

  it("'optional' marca los opcionales con (opcional), legible por el lector de pantalla", () => {
    const { mark } = setup({ requiredIndicator: 'optional' });
    expect(mark('email')).toBeNull();
    expect(mark('phone')?.textContent).toBe('(opcional)');
    expect(mark('phone')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('los textos son configurables', () => {
    const { mark } = setup({ requiredIndicator: 'text', requiredText: 'obligatorio' });
    expect(mark('email')?.textContent).toBe('(obligatorio)');
  });

  it('el input del campo sobrescribe la configuración global', () => {
    const { fixture, mark } = setup({ requiredIndicator: 'none' });
    fixture.componentInstance.override.set('asterisk');
    fixture.detectChanges();
    expect(mark('email')?.textContent).toBe('*');
    expect(mark('phone')).toBeNull();
  });
});
