import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSelect } from './select.component';

interface Ciudad {
  nombre: string;
  id: number;
}

@Component({
  imports: [ReactiveFormsModule, CbSelect],
  template: `<cb-select
    [formControl]="control"
    [options]="ciudades"
    optionLabel="nombre"
    optionValue="id"
    placeholder="Elige una ciudad"
  />`,
})
class HostComponent {
  control = new FormControl<number | null>(null);
  ciudades: Ciudad[] = [
    { nombre: 'Barranquilla', id: 1 },
    { nombre: 'Cartagena', id: 2 },
    { nombre: 'Santa Marta', id: 3 },
  ];
}

describe('CbSelect', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = (): HTMLElement => el.querySelector('.cb-select__trigger')!;
    const label = (): string => el.querySelector('.cb-select__label')!.textContent!.trim();
    const options = (): HTMLElement[] =>
      Array.from(document.querySelectorAll('.cb-select__option'));
    return { fixture, el, trigger, label, options };
  }

  it('el trigger es un combobox y muestra el placeholder', () => {
    const { trigger, label } = setup();
    expect(trigger().getAttribute('role')).toBe('combobox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(label()).toBe('Elige una ciudad');
  });

  it('muestra la etiqueta de la opción seleccionada (writeValue)', () => {
    const { fixture, label } = setup();
    fixture.componentInstance.control.setValue(2);
    fixture.detectChanges();
    expect(label()).toBe('Cartagena');
  });

  it('abre el listbox al hacer clic y lista las opciones', () => {
    const { fixture, trigger, options } = setup();
    trigger().click();
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(options().map((o) => o.textContent!.trim())).toEqual([
      'Barranquilla',
      'Cartagena',
      'Santa Marta',
    ]);
  });

  it('seleccionar una opción escribe optionValue en el FormControl y cierra', () => {
    const { fixture, trigger, options } = setup();
    trigger().click();
    fixture.detectChanges();
    options()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(3);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('names the combobox with ariaLabel', () => {
    const fixture = TestBed.createComponent(CbSelect);
    fixture.componentRef.setInput('ariaLabel', 'Ciudad de destino');
    fixture.detectChanges();
    const combobox: HTMLElement = fixture.nativeElement.querySelector('.cb-select__trigger');
    expect(combobox.getAttribute('aria-label')).toBe('Ciudad de destino');
    expect(combobox.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('links the combobox to a visible label with ariaLabelledBy', () => {
    const fixture = TestBed.createComponent(CbSelect);
    fixture.componentRef.setInput('ariaLabelledBy', 'city-label');
    fixture.componentRef.setInput('inputId', 'city');
    fixture.detectChanges();
    const combobox: HTMLElement = fixture.nativeElement.querySelector('.cb-select__trigger');
    expect(combobox.getAttribute('aria-labelledby')).toBe('city-label');
    expect(combobox.hasAttribute('aria-label')).toBe(false);
    expect(combobox.id).toBe('city');
  });
});
