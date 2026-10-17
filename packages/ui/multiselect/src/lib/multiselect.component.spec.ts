import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbMultiSelectComponent } from './multiselect.component';

interface Ciudad {
  nombre: string;
  id: number;
}

@Component({
  imports: [ReactiveFormsModule, CbMultiSelectComponent],
  template: `<cb-multiselect
    [formControl]="control"
    [options]="ciudades"
    optionLabel="nombre"
    optionValue="id"
    placeholder="Elige ciudades"
  />`,
})
class HostComponent {
  control = new FormControl<number[]>([]);
  ciudades: Ciudad[] = [
    { nombre: 'Barranquilla', id: 1 },
    { nombre: 'Cartagena', id: 2 },
    { nombre: 'Santa Marta', id: 3 },
  ];
}

describe('CbMultiSelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = (): HTMLElement => el.querySelector('.cb-multiselect__trigger')!;
    const label = (): string => el.querySelector('.cb-multiselect__label')!.textContent!.trim();
    const options = (): HTMLElement[] =>
      Array.from(document.querySelectorAll('.cb-multiselect__option'));
    const openPanel = () => {
      trigger().click();
      fixture.detectChanges();
    };
    return { fixture, el, trigger, label, options, openPanel };
  }

  it('el trigger es combobox y muestra el placeholder', () => {
    const { trigger, label } = setup();
    expect(trigger().getAttribute('role')).toBe('combobox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(label()).toBe('Elige ciudades');
  });

  it('abre un listbox multiseleccionable con las opciones', () => {
    const { openPanel, options, trigger } = setup();
    openPanel();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe('true');
    expect(options().length).toBe(3);
  });

  it('seleccionar opciones acumula valores (sin cerrar)', () => {
    const { fixture, openPanel, options } = setup();
    openPanel();
    options()[0].click();
    options()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([1, 3]);
    // sigue abierto
    expect(fixture.nativeElement.querySelector('.cb-multiselect__trigger').getAttribute('aria-expanded')).toBe('true');
  });

  it('volver a hacer clic deselecciona', () => {
    const { fixture, openPanel, options } = setup();
    openPanel();
    options()[1].click();
    expect(fixture.componentInstance.control.value).toEqual([2]);
    options()[1].click();
    expect(fixture.componentInstance.control.value).toEqual([]);
  });

  it('muestra las etiquetas seleccionadas (writeValue)', () => {
    const { fixture, label } = setup();
    fixture.componentInstance.control.setValue([1, 3]);
    fixture.detectChanges();
    expect(label()).toBe('Barranquilla, Santa Marta');
  });
});
