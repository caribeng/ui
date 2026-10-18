import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDatepicker } from './datepicker.component';

@Component({
  imports: [ReactiveFormsModule, CbDatepicker],
  template: `<cb-datepicker
    [formControl]="ctrl"
    locale="es-CO"
    [minDate]="min"
    [maxDate]="max"
    placeholder="dd/mm/aaaa"
  />`,
})
class HostComponent {
  ctrl = new FormControl<Date | null>(null);
  min: Date | null = null;
  max: Date | null = null;
}

// Host con límites preestablecidos en construcción (uso real: minDate/maxDate
// son inputs estáticos). Evita la transición null→fecha del binding del host,
// que en Angular 21 dispara un NG0100 falso en checkNoChanges al abrir el overlay.
@Component({
  imports: [ReactiveFormsModule, CbDatepicker],
  template: `<cb-datepicker [formControl]="ctrl" locale="es-CO" [minDate]="min" [maxDate]="max" />`,
})
class RangeHostComponent {
  ctrl = new FormControl<Date | null>(new Date(2026, 9, 16));
  readonly min = new Date(2026, 9, 10);
  readonly max = new Date(2026, 9, 20);
}

describe('CbDatepicker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const field = (): HTMLInputElement => el.querySelector('input.cb-datepicker__field')!;
    const panel = (): HTMLElement | null =>
      document.querySelector('.cb-datepicker__panel[role="dialog"]');
    const openCalendar = () => {
      field().click();
      fixture.detectChanges();
    };
    // Botón de día del mes en curso (ignora días de otros meses).
    const dayBtn = (n: number): HTMLButtonElement | undefined =>
      Array.from(
        document.querySelectorAll<HTMLButtonElement>('.cb-datepicker__day'),
      ).find(
        (b) =>
          b.textContent!.trim() === String(n) &&
          !b.classList.contains('cb-is-other-month'),
      );
    return { fixture, el, field, panel, openCalendar, dayBtn };
  }

  it('el campo es un combobox de solo lectura con aria-haspopup="dialog"', () => {
    const { field } = setup();
    expect(field().getAttribute('role')).toBe('combobox');
    expect(field().readOnly).toBe(true);
    expect(field().getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('muestra la fecha seleccionada formateada (writeValue)', () => {
    const { fixture, field } = setup();
    fixture.componentInstance.ctrl.setValue(new Date(2026, 9, 22));
    fixture.detectChanges();
    expect(field().value).not.toBe('');
    expect(field().value).toContain('2026');
  });

  it('abre el calendario con el mes de la fecha seleccionada', () => {
    const { fixture, panel, openCalendar } = setup();
    fixture.componentInstance.ctrl.setValue(new Date(2026, 9, 16));
    fixture.detectChanges();
    openCalendar();
    expect(panel()).toBeTruthy();
    const title = document.querySelector('.cb-datepicker__title')!.textContent!.toLowerCase();
    expect(title).toContain('octubre');
    expect(title).toContain('2026');
  });

  it('seleccionar un día escribe la fecha en el FormControl y cierra', () => {
    const { fixture, panel, openCalendar, dayBtn } = setup();
    fixture.componentInstance.ctrl.setValue(new Date(2026, 9, 16));
    fixture.detectChanges();
    openCalendar();
    dayBtn(22)!.click();
    fixture.detectChanges();
    const v = fixture.componentInstance.ctrl.value!;
    expect(v.getFullYear()).toBe(2026);
    expect(v.getMonth()).toBe(9);
    expect(v.getDate()).toBe(22);
    expect(panel()).toBeNull();
  });

  it('deshabilita los días fuera del rango [minDate, maxDate]', () => {
    TestBed.configureTestingModule({ imports: [RangeHostComponent] });
    const fixture = TestBed.createComponent(RangeHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLInputElement>('input.cb-datepicker__field')!.click();
    fixture.detectChanges();
    const dayBtn = (n: number): HTMLButtonElement | undefined =>
      Array.from(
        document.querySelectorAll<HTMLButtonElement>('.cb-datepicker__day'),
      ).find(
        (b) =>
          b.textContent!.trim() === String(n) &&
          !b.classList.contains('cb-is-other-month'),
      );
    expect(dayBtn(5)!.disabled).toBe(true);
    expect(dayBtn(18)!.disabled).toBe(false);
    expect(dayBtn(25)!.disabled).toBe(true);
  });
});
