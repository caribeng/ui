import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbCascadeOption, CbCascadeSelect } from './cascadeselect.component';

const OPTIONS: CbCascadeOption[] = [
  {
    label: 'Colombia',
    children: [
      { label: 'Medellín', value: 'MDE' },
      { label: 'Bogotá', value: 'BOG' },
    ],
  },
  { label: 'Sin país', value: 'NONE' },
];

@Component({
  imports: [CbCascadeSelect],
  template: `<cb-cascade-select [options]="opts()" [(value)]="val" [disabled]="disabled()" placeholder="Ciudad" />`,
})
class HostComponent {
  val = signal<string | null>(null);
  disabled = signal(false);
  opts = signal<CbCascadeOption[]>(OPTIONS);
}

@Component({
  imports: [CbCascadeSelect, ReactiveFormsModule],
  template: `<cb-cascade-select [options]="opts" [formControl]="ctrl" />`,
})
class FormHostComponent {
  opts = OPTIONS;
  ctrl = new FormControl<string | null>('BOG', Validators.required);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const trigger = () => el.querySelector<HTMLButtonElement>('.cb-cascade-select__trigger')!;
  const options = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.cb-cascade-select__option'));
  const click = (b: HTMLElement) => {
    b.click();
    fixture.detectChanges();
  };
  return { fixture, el, trigger, options, click };
}

describe('CbCascadeSelect', () => {
  it('abre el grupo y selecciona una opción hija en cascada', () => {
    const { fixture, el, trigger, options, click } = setup();
    click(trigger());
    click(options()[0]);
    expect(options().map((o) => o.textContent!.trim())).toEqual(['Colombia', 'Sin país', 'Medellín', 'Bogotá']);

    click(options()[2]);
    expect(fixture.componentInstance.val()).toBe('MDE');
    expect(el.querySelector('.cb-cascade-select__label')?.textContent?.trim()).toBe('Colombia / Medellín');
    expect(document.querySelector('.cb-cascade-select__menus')).toBeNull();
  });

  it('muestra el placeholder sin valor y refleja aria-expanded', () => {
    const { el, trigger, click } = setup();
    expect(el.querySelector('.cb-cascade-select__label')!.textContent!.trim()).toBe('Ciudad');
    expect(trigger().getAttribute('role')).toBe('combobox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('selecciona directamente una opción de primer nivel sin hijos', () => {
    const { fixture, el, trigger, options, click } = setup();
    click(trigger());
    click(options()[1]);
    expect(fixture.componentInstance.val()).toBe('NONE');
    expect(el.querySelector('.cb-cascade-select__label')!.textContent!.trim()).toBe('Sin país');
  });

  it('marca la opción elegida al reabrir', () => {
    const { fixture, trigger, options, click } = setup();
    fixture.componentInstance.val.set('BOG');
    fixture.detectChanges();
    click(trigger());
    click(options()[0]);
    expect(options()[3].classList).toContain('cb-is-selected');
    expect(options()[2].classList).not.toContain('cb-is-selected');
  });

  it('se cierra con Escape y devuelve el foco al disparador', () => {
    const { el, trigger, options, click, fixture } = setup();
    document.body.appendChild(el);
    click(trigger());
    options()[0].focus();
    options()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('.cb-cascade-select__menus')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });

  it('el panel va en un overlay (no lo recorta el contenedor) y se cierra al hacer clic fuera', () => {
    const { el, trigger, click, fixture } = setup();
    document.body.appendChild(el);
    click(trigger());
    const menus = document.querySelector('.cb-cascade-select__menus')!;
    expect(menus.closest('.cdk-overlay-container')).not.toBeNull();
    expect(el.contains(menus)).toBe(false);
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('.cb-cascade-select__menus')).toBeNull();
    el.remove();
  });

  it('no se abre si está deshabilitado', () => {
    const { fixture, el, trigger, click } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(trigger().disabled).toBe(true);
    click(trigger());
    expect(document.querySelector('.cb-cascade-select__menus')).toBeNull();
  });

  it('se integra con Reactive Forms: valor inicial, cambios y disable()', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const ctrl = fixture.componentInstance.ctrl;
    expect(el.querySelector('.cb-cascade-select__label')!.textContent!.trim()).toBe('Colombia / Bogotá');

    el.querySelector<HTMLButtonElement>('.cb-cascade-select__trigger')!.click();
    fixture.detectChanges();
    document.querySelectorAll<HTMLButtonElement>('.cb-cascade-select__option')[1].click();
    fixture.detectChanges();
    expect(ctrl.value).toBe('NONE');
    expect(ctrl.touched).toBe(true);

    ctrl.disable();
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('.cb-cascade-select__trigger')!.disabled).toBe(true);
  });

  it('marca el campo como inválido cuando el control es inválido y fue tocado', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    const ctrl = fixture.componentInstance.ctrl;
    ctrl.setValue(null);
    ctrl.markAsTouched();
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.cb-cascade-select__trigger') as HTMLElement;
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.getAttribute('aria-required')).toBe('true');
  });
});
