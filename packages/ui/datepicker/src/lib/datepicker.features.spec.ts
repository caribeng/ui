import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbDatepicker, type CbDateRange } from './datepicker.component';

@Component({
  imports: [CbDatepicker],
  template: `
    <cb-datepicker
      locale="es-CO"
      [selectionMode]="mode()"
      [showTime]="showTime()"
      [hourFormat]="hourFormat()"
      [minDate]="min"
      [(value)]="value"
      [(range)]="range"
    />
  `,
})
class HostComponent {
  mode = signal<'single' | 'range'>('single');
  showTime = signal(false);
  hourFormat = signal<'24' | '12'>('24');
  readonly min = new Date(2026, 0, 5);
  value = signal<Date | null>(new Date(2026, 0, 31));
  range = signal<CbDateRange | null>(null);
}

@Component({
  imports: [CbDatepicker, ReactiveFormsModule],
  template: `<cb-datepicker selectionMode="range" locale="es-CO" [formControl]="ctrl" />`,
})
class RangeFormHostComponent {
  ctrl = new FormControl<CbDateRange | null>([new Date(2026, 2, 3), new Date(2026, 2, 6)]);
}

function setup(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const field = () => el.querySelector<HTMLInputElement>('input.cb-datepicker__field')!;
  const panel = () => document.querySelector<HTMLElement>('.cb-datepicker__panel');
  const title = () => document.querySelector('.cb-datepicker__title')!.textContent!.trim().toLowerCase();
  const day = (n: number) =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('.cb-datepicker__day')).find(
      (b) => b.textContent!.trim() === String(n) && !b.classList.contains('cb-is-other-month'),
    )!;
  const activeDay = () => document.querySelector<HTMLButtonElement>('.cb-datepicker__day.cb-is-active')!;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  };
  const open = async () => {
    field().click();
    await settle();
  };
  const key = async (k: string, shiftKey = false) => {
    activeDay().dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey, bubbles: true, cancelable: true }));
    await settle();
  };
  return { fixture, el, field, panel, title, day, activeDay, open, key, settle, host: fixture.componentInstance };
}

describe('CbDatepicker · rangos, hora y teclado', () => {
  afterEach(() => document.body.querySelectorAll('[ng-version], .cdk-overlay-container').forEach((n) => n.remove()));

  describe('teclado y accesibilidad', () => {
    it('cada día se nombra con la fecha completa y la celda elegida tiene aria-selected', async () => {
      const { day, open } = setup();
      await open();
      expect(day(31).getAttribute('aria-label')).toContain('31 de enero de 2026');
      expect(day(31).closest('td')!.getAttribute('aria-selected')).toBe('true');
      expect(day(30).closest('td')!.getAttribute('aria-selected')).toBe('false');
    });

    it('Av Pág va al mismo día del mes siguiente (ajustado al último día si no existe)', async () => {
      const { title, activeDay, open, key } = setup();
      await open();
      expect(document.activeElement).toBe(activeDay());
      await key('PageDown');
      expect(title()).toContain('febrero');
      expect(activeDay().textContent!.trim()).toBe('28');
      await key('PageUp');
      expect(title()).toContain('enero');
      expect(activeDay().textContent!.trim()).toBe('28');
    });

    it('Mayús + Re Pág / Av Pág cambia de año', async () => {
      const { title, activeDay, open, key } = setup();
      await open();
      await key('PageDown', true);
      expect(title()).toContain('2027');
      expect(activeDay().textContent!.trim()).toBe('31');
      await key('PageUp', true);
      expect(title()).toContain('2026');
    });

    it('las flechas pueden pasar por días no elegibles sin perder el foco, pero no seleccionarlos', async () => {
      const { fixture, activeDay, open, key, host } = setup((h) => h.value.set(new Date(2026, 0, 6)));
      await open();
      await key('ArrowLeft');
      await key('ArrowLeft');
      expect(activeDay().textContent!.trim()).toBe('4');
      expect(activeDay().getAttribute('aria-disabled')).toBe('true');
      expect(document.activeElement).toBe(activeDay());
      await key('Enter');
      fixture.detectChanges();
      expect((host.value() as Date).getDate()).toBe(6);
    });
  });

  describe('rango', () => {
    it('el primer clic fija el inicio y anuncia que falta el fin; el segundo cierra con el rango', async () => {
      const { fixture, field, panel, day, open, settle, host } = setup((h) => h.mode.set('range'));
      await open();
      day(10).click();
      await settle();
      expect(panel()).not.toBeNull();
      expect(document.querySelector('.cb-datepicker__sr[aria-live]')!.textContent).toBe('Elige la fecha final');

      day(14).click();
      await settle();
      const [start, end] = host.range() as readonly [Date, Date];
      expect([start.getDate(), end.getDate()]).toEqual([10, 14]);
      expect((host.value() as Date).getDate()).toBe(31);
      expect(panel()).toBeNull();
      fixture.detectChanges();
      expect(field().value).toContain('–');
    });

    it('si el fin es anterior al inicio, los intercambia', async () => {
      const { day, open, settle, host } = setup((h) => h.mode.set('range'));
      await open();
      day(20).click();
      await settle();
      day(12).click();
      await settle();
      const [start, end] = host.range() as readonly [Date, Date];
      expect([start.getDate(), end.getDate()]).toEqual([12, 20]);
    });

    it('marca los días intermedios y previsualiza el rango bajo el puntero', async () => {
      const { day, open, settle } = setup((h) => {
        h.mode.set('range');
        h.range.set([new Date(2026, 0, 10), new Date(2026, 0, 13)]);
      });
      await open();
      const cell = (n: number) => day(n).closest('td')!;
      expect(cell(10).classList).toContain('cb-is-range-start');
      expect(cell(13).classList).toContain('cb-is-range-end');
      expect([11, 12].every((n) => cell(n).classList.contains('cb-is-in-range'))).toBe(true);
      expect(cell(11).getAttribute('aria-selected')).toBe('true');

      day(20).click();
      await settle();
      day(23).dispatchEvent(new Event('mouseenter'));
      await settle();
      expect(cell(22).classList).toContain('cb-is-in-range');
      expect(cell(25).classList).not.toContain('cb-is-in-range');
    });
  });

  describe('hora', () => {
    it('elegir un día conserva la hora y no cierra; los campos de hora cambian el valor', async () => {
      const { fixture, panel, day, open, settle, host } = setup((h) => {
        h.showTime.set(true);
        h.value.set(new Date(2026, 0, 31, 9, 30));
      });
      await open();
      const group = document.querySelector<HTMLElement>('.cb-datepicker__time[role="group"]')!;
      const [hours, minutes] = Array.from(group.querySelectorAll<HTMLInputElement>('input'));
      expect(hours.value).toBe('09');
      expect(hours.closest('label')!.textContent).toContain('Horas');

      day(15).click();
      await settle();
      expect(panel()).not.toBeNull();
      let v = host.value() as Date;
      expect([v.getDate(), v.getHours(), v.getMinutes()]).toEqual([15, 9, 30]);

      hours.value = '18';
      hours.dispatchEvent(new Event('input'));
      minutes.value = '75';
      minutes.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      v = host.value()!;
      expect([v.getHours(), v.getMinutes()]).toEqual([18, 59]);
    });

    it('en formato 12 h muestra 1–12 y AM/PM alterna la mitad del día', async () => {
      const { fixture, open, host } = setup((h) => {
        h.showTime.set(true);
        h.hourFormat.set('12');
        h.value.set(new Date(2026, 0, 31, 15, 5));
      });
      await open();
      const hours = document.querySelector<HTMLInputElement>('.cb-datepicker__time input')!;
      const period = document.querySelector<HTMLButtonElement>('.cb-datepicker__period')!;
      expect(hours.value).toBe('03');
      expect(period.textContent!.trim()).toBe('PM');
      period.click();
      fixture.detectChanges();
      expect((host.value() as Date).getHours()).toBe(3);
      expect(period.textContent!.trim()).toBe('AM');
    });

    it('las flechas dentro de los campos de hora no mueven el día activo', async () => {
      const { activeDay, open, settle } = setup((h) => h.showTime.set(true));
      await open();
      const before = activeDay().textContent;
      document
        .querySelector<HTMLInputElement>('.cb-datepicker__time input')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      await settle();
      expect(activeDay().textContent).toBe(before);
    });
  });

  it('con Angular Forms en modo rango, el control recibe y muestra el rango', async () => {
    const fixture = TestBed.createComponent(RangeFormHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const field = el.querySelector<HTMLInputElement>('input.cb-datepicker__field')!;
    expect(field.value).toContain('–');
    field.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const day = (n: number) =>
      Array.from(document.querySelectorAll<HTMLButtonElement>('.cb-datepicker__day')).find(
        (b) => b.textContent!.trim() === String(n) && !b.classList.contains('cb-is-other-month'),
      )!;
    day(9).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ctrl.value![1]).toBeNull();
    day(11).click();
    fixture.detectChanges();
    const [start, end] = fixture.componentInstance.ctrl.value!;
    expect([start.getDate(), end!.getDate()]).toEqual([9, 11]);
  });
});
