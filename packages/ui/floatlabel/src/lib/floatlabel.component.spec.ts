import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbFloatLabel } from './floatlabel.component';

@Component({
  imports: [CbFloatLabel, ReactiveFormsModule],
  template: `
    <cb-float-label [variant]="variant()">
      <input id="u" type="text" [formControl]="ctrl" />
      <label for="u">Usuario</label>
    </cb-float-label>
  `,
})
class HostComponent {
  variant = signal<'over' | 'in' | 'on'>('on');
  ctrl = new FormControl('');
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const host = fixture.nativeElement.querySelector('cb-float-label') as HTMLElement;
  const input = host.querySelector('input') as HTMLInputElement;
  return { fixture, host, input };
}

describe('CbFloatLabel', () => {
  it('activa la clase cb-is-active al enfocar o escribir en el input hijo', async () => {
    const { fixture, host, input } = await setup();
    expect(host.classList.contains('cb-is-active')).toBe(false);

    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(host.classList.contains('cb-is-active')).toBe(true);

    input.value = 'oscar';
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();
    expect(host.classList.contains('cb-is-active')).toBe(true);
  });

  it('se desactiva al salir con el campo vacío o con solo espacios', async () => {
    const { fixture, host, input } = await setup();
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    input.value = '   ';
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();
    expect(host.classList.contains('cb-is-active')).toBe(false);
  });

  it('detecta valores asignados por código (patchValue) sin eventos del usuario', async () => {
    const { fixture, host } = await setup();
    fixture.componentInstance.ctrl.setValue('desde el formulario');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges(); // la clase se pinta en la pasada siguiente al render que detectó el valor
    expect(host.classList.contains('cb-is-active')).toBe(true);

    fixture.componentInstance.ctrl.reset();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges(); // la clase se pinta en la pasada siguiente al render que detectó el valor
    expect(host.classList.contains('cb-is-active')).toBe(false);
  });

  it('aplica la clase de la variante (on por defecto)', async () => {
    const { fixture, host } = await setup();
    expect(host.classList).toContain('cb-float-label--on');
    fixture.componentInstance.variant.set('in');
    fixture.detectChanges();
    expect(host.classList).toContain('cb-float-label--in');
    expect(host.classList).not.toContain('cb-float-label--on');
  });
});
