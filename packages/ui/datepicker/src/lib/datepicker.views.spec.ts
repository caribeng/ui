import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { dateNames, formatDate, localeDateFormat, parseDate } from './date-format';
import { CbDatepicker, type CbDatePreset, type CbDatePresetKey, type CbDateRange, type CbDatepickerView } from './datepicker.component';

describe('formato de fechas (sintaxis de PrimeNG)', () => {
  const es = dateNames('es-CO');
  const en = dateNames('en-US');
  const d = new Date(2026, 2, 5, 14, 30); // jueves 5 de marzo de 2026

  it('escribe cada símbolo', () => {
    expect(formatDate(d, 'd/m/y', en)).toBe('5/3/26');
    expect(formatDate(d, 'dd/mm/yy', en)).toBe('05/03/2026');
    expect(formatDate(d, 'o oo', en)).toBe('64 064');
    expect(formatDate(d, 'D, DD', en)).toBe('Thu, Thursday');
    expect(formatDate(d, 'M MM', en)).toBe('Mar March');
    expect(formatDate(d, "DD d 'de' MM 'de' yy", es)).toBe('jueves 5 de marzo de 2026');
    expect(formatDate(d, "'It''s' yy", en)).toBe("It's 2026");
  });

  it('marca de tiempo Unix y ticks de Windows', () => {
    expect(formatDate(d, '@', en)).toBe(String(d.getTime()));
    expect(parseDate(formatDate(d, '!', en), '!', en)!.getTime()).toBe(d.getTime());
  });

  it('lee lo que escribe (ida y vuelta) y rechaza fechas que no existen', () => {
    for (const format of ['dd/mm/yy', 'd-m-y', 'MM d, yy', "d 'de' MM 'de' yy", 'yy-oo']) {
      const text = formatDate(new Date(2026, 9, 21), format, es);
      const back = parseDate(text, format, es)!;
      expect([back.getFullYear(), back.getMonth(), back.getDate()]).toEqual([2026, 9, 21]);
    }
    expect(parseDate('31/02/2026', 'dd/mm/yy', es)).toBeNull();
    expect(parseDate('21/10', 'dd/mm/yy', es)).toBeNull();
    expect(parseDate('hola', 'dd/mm/yy', es)).toBeNull();
    // Los nombres no distinguen mayúsculas.
    expect(parseDate('5 MARZO 2026', 'd MM yy', es)!.getMonth()).toBe(2);
  });

  it('año de dos dígitos: siglo según la fecha de hoy', () => {
    const year = new Date().getFullYear() % 100;
    expect(parseDate(`01/01/${String(year).padStart(2, '0')}`, 'dd/mm/y', en)!.getFullYear()).toBe(new Date().getFullYear());
    expect(parseDate('01/01/99', 'dd/mm/y', en)!.getFullYear()).toBe(1999);
  });

  it('deduce el formato numérico del locale', () => {
    expect(localeDateFormat('es-CO', 'date')).toBe('dd/mm/yy');
    expect(localeDateFormat('en-US', 'date')).toBe('mm/dd/yy');
    expect(localeDateFormat('es-CO', 'month')).toBe('mm/yy');
    expect(localeDateFormat('es-CO', 'year')).toBe('yy');
  });
});

@Component({
  imports: [CbDatepicker],
  template: `
    <cb-datepicker
      locale="es-CO"
      [selectionMode]="mode()"
      [view]="view()"
      [numberOfMonths]="months()"
      [showTime]="showTime()"
      [editable]="editable()"
      [dateFormat]="format()"
      [presets]="presets()"
      [maxDate]="max()"
      [(value)]="value"
      [(range)]="range"
    />
  `,
})
class HostComponent {
  mode = signal<'single' | 'range'>('single');
  view = signal<CbDatepickerView>('date');
  months = signal<number | undefined>(undefined);
  showTime = signal(false);
  editable = signal(false);
  format = signal<string | undefined>(undefined);
  presets = signal<readonly (CbDatePreset | CbDatePresetKey)[]>([]);
  max = signal<Date | null>(null);
  value = signal<Date | null>(new Date(2026, 9, 21));
  range = signal<CbDateRange | null>(null);
}

function setup(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const field = () => el.querySelector<HTMLInputElement>('input.cb-datepicker__field')!;
  const all = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  };
  const open = async () => {
    el.querySelector<HTMLButtonElement>('.cb-datepicker__btn')!.click();
    await settle();
  };
  const grids = () => all<HTMLTableElement>('.cb-datepicker__grid');
  /** Botón del día `n` en el mes `month` (0 = primer mes visible). */
  const day = (n: number, month = 0) =>
    Array.from(grids()[month].querySelectorAll<HTMLButtonElement>('.cb-datepicker__day')).find((b) => b.textContent!.trim() === String(n))!;
  const unit = (text: string) => all<HTMLButtonElement>('.cb-datepicker__unit').find((b) => b.textContent!.trim().toLowerCase() === text)!;
  const key = async (k: string) => {
    document.querySelector<HTMLElement>('.cb-is-active')!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await settle();
  };
  return { fixture, el, field, all, grids, day, unit, open, key, settle, host: fixture.componentInstance };
}

describe('CbDatepicker · formato, meses, hora en rango y vistas', () => {
  afterEach(() => document.body.querySelectorAll('[ng-version], .cdk-overlay-container').forEach((n) => n.remove()));

  describe('dateFormat y campo editable', () => {
    it('el campo muestra la fecha con dateFormat', async () => {
      const { field, fixture, host } = setup((h) => h.format.set("DD d 'de' MM 'de' yy"));
      expect(field().value).toBe('miércoles 21 de octubre de 2026');
      host.format.set('dd/mm/yy');
      fixture.detectChanges();
      expect(field().value).toBe('21/10/2026');
    });

    it('editable: se puede escribir; Enter aplica la fecha', async () => {
      const { field, settle, host } = setup((h) => h.editable.set(true));
      expect(field().readOnly).toBe(false);
      // Sin dateFormat usa el formato numérico del locale.
      expect(field().value).toBe('21/10/2026');
      field().value = '05/11/2026';
      field().dispatchEvent(new Event('input'));
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await settle();
      const v = host.value()!;
      expect([v.getFullYear(), v.getMonth(), v.getDate()]).toEqual([2026, 10, 5]);
    });

    it('editable: un texto inválido muestra el error con el formato esperado y no cambia el valor', async () => {
      const { field, settle, host, el } = setup((h) => h.editable.set(true));
      field().value = '31/02/2026';
      field().dispatchEvent(new Event('input'));
      field().dispatchEvent(new Event('blur'));
      await settle();
      expect(field().getAttribute('aria-invalid')).toBe('true');
      const error = el.querySelector('.cb-datepicker__message--error')!;
      expect(error.textContent).toContain('dd/mm/yyyy');
      expect(field().getAttribute('aria-describedby')).toBe(error.id);
      expect(host.value()!.getDate()).toBe(21);
      // Vaciar el campo borra el valor.
      field().value = '';
      field().dispatchEvent(new Event('input'));
      field().dispatchEvent(new Event('blur'));
      await settle();
      expect(host.value()).toBeNull();
      expect(field().getAttribute('aria-invalid')).toBeNull();
    });

    it('editable con hora: lee la hora escrita', async () => {
      const { field, settle, host } = setup((h) => {
        h.editable.set(true);
        h.showTime.set(true);
      });
      field().value = '02/01/2027 18:45';
      field().dispatchEvent(new Event('input'));
      field().dispatchEvent(new Event('blur'));
      await settle();
      const v = host.value()!;
      expect([v.getFullYear(), v.getMonth(), v.getDate(), v.getHours(), v.getMinutes()]).toEqual([2027, 0, 2, 18, 45]);
    });
  });

  describe('rango con dos meses y hora', () => {
    it('en rango muestra dos meses seguidos; numberOfMonths lo cambia', async () => {
      const { open, grids, all, fixture, host } = setup((h) => {
        h.mode.set('range');
        h.range.set([new Date(2026, 9, 10), new Date(2026, 9, 14)]);
      });
      await open();
      expect(grids()).toHaveLength(2);
      const titles = all('.cb-datepicker__title').map((t) => t.textContent!.trim().toLowerCase());
      expect(titles[0]).toContain('octubre');
      expect(titles[1]).toContain('noviembre');
      // Solo el primer mes tiene "anterior" y solo el último "siguiente".
      expect(all('.cb-datepicker__nav')).toHaveLength(2);
      // Los días de otros meses quedan vacíos (no se repiten).
      expect(grids()[1].querySelector('.cb-is-other-month')).toBeNull();
      host.months.set(1);
      fixture.detectChanges();
      expect(grids()).toHaveLength(1);
    });

    it('el rango puede empezar en un mes y terminar en el siguiente', async () => {
      const { open, day, settle, host } = setup((h) => h.mode.set('range'));
      await open();
      day(28, 0).click();
      await settle();
      day(3, 1).click();
      await settle();
      const [start, end] = host.range()!;
      expect([start.getMonth(), start.getDate(), end!.getMonth(), end!.getDate()]).toEqual([9, 28, 10, 3]);
      expect(document.querySelector('.cb-datepicker__panel')).toBeNull();
    });

    it('las flechas pasan al mes siguiente sin mover la vista mientras sea visible', async () => {
      const { open, key, all } = setup((h) => {
        h.mode.set('range');
        h.range.set([new Date(2026, 9, 28), new Date(2026, 9, 30)]);
      });
      await open();
      await key('ArrowDown');
      const active = document.querySelector('.cb-datepicker__day.cb-is-active')!;
      expect(active.textContent!.trim()).toBe('4');
      expect(all('.cb-datepicker__title')[0].textContent!.toLowerCase()).toContain('octubre');
    });

    it('con showTime en rango hay hora de inicio y de fin, y el panel sigue abierto', async () => {
      const { open, day, settle, host, all } = setup((h) => {
        h.mode.set('range');
        h.showTime.set(true);
      });
      await open();
      const groups = () => all('.cb-datepicker__time[role="group"]');
      expect(groups().map((g) => g.getAttribute('aria-label'))).toEqual(['Hora de inicio', 'Hora de fin']);
      day(10, 0).click();
      await settle();
      day(12, 0).click();
      await settle();
      expect(document.querySelector('.cb-datepicker__panel')).not.toBeNull();
      const [startHours] = Array.from(groups()[0].querySelectorAll<HTMLInputElement>('input'));
      startHours.value = '8';
      startHours.dispatchEvent(new Event('input'));
      const [endHours, endMinutes] = Array.from(groups()[1].querySelectorAll<HTMLInputElement>('input'));
      endHours.value = '17';
      endHours.dispatchEvent(new Event('input'));
      endMinutes.value = '30';
      endMinutes.dispatchEvent(new Event('input'));
      await settle();
      const [start, end] = host.range()!;
      expect([start.getDate(), start.getHours()]).toEqual([10, 8]);
      expect([end!.getDate(), end!.getHours(), end!.getMinutes()]).toEqual([12, 17, 30]);
    });
  });

  describe('vistas de mes y año', () => {
    it('view="month": cuadrícula de meses; elegir uno da el día 1', async () => {
      const { open, all, unit, settle, host, field } = setup((h) => h.view.set('month'));
      await open();
      expect(all('.cb-datepicker__unit')).toHaveLength(12);
      expect(document.querySelector('.cb-datepicker__title')!.textContent!.trim()).toBe('2026');
      expect(unit('oct').classList).toContain('cb-is-selected');
      unit('mar').click();
      await settle();
      const v = host.value()!;
      expect([v.getFullYear(), v.getMonth(), v.getDate()]).toEqual([2026, 2, 1]);
      expect(field().value.toLowerCase()).toContain('marzo');
    });

    it('view="month": el título abre los años y elegir uno vuelve a los meses de ese año', async () => {
      const { open, unit, settle } = setup((h) => h.view.set('month'));
      await open();
      document.querySelector<HTMLButtonElement>('.cb-datepicker__title')!.click();
      await settle();
      expect(document.querySelector('.cb-datepicker__title')!.textContent!.trim()).toBe('2020 – 2029');
      unit('2028').click();
      await settle();
      expect(document.querySelector('.cb-datepicker__title')!.textContent!.trim()).toBe('2028');
    });

    it('view="year": elegir un año da el 1 de enero; las flechas recorren la cuadrícula', async () => {
      const { open, unit, settle, host, key } = setup((h) => h.view.set('year'));
      await open();
      expect(document.activeElement!.textContent!.trim()).toBe('2026');
      await key('ArrowUp');
      expect(document.activeElement!.textContent!.trim()).toBe('2023');
      unit('2024').click();
      await settle();
      const v = host.value()!;
      expect([v.getFullYear(), v.getMonth(), v.getDate()]).toEqual([2024, 0, 1]);
    });

    it('en la vista de días, el título lleva a los meses y elegir uno vuelve a los días de ese mes', async () => {
      const { open, unit, settle, all } = setup();
      await open();
      document.querySelector<HTMLButtonElement>('.cb-datepicker__title')!.click();
      await settle();
      expect(all('.cb-datepicker__unit')).toHaveLength(12);
      unit('feb').click();
      await settle();
      expect(document.querySelector('.cb-datepicker__title')!.textContent!.toLowerCase()).toContain('febrero');
      // Mantiene el día (21) en el mes elegido.
      expect(document.querySelector('.cb-datepicker__day.cb-is-active')!.textContent!.trim()).toBe('21');
    });

    it('rango de meses', async () => {
      const { open, unit, settle, host } = setup((h) => {
        h.mode.set('range');
        h.view.set('month');
      });
      await open();
      unit('feb').click();
      await settle();
      unit('may').click();
      await settle();
      const [start, end] = host.range()!;
      expect([start.getMonth(), start.getDate(), end!.getMonth()]).toEqual([1, 1, 4]);
    });
  });

  describe('atajos (presets)', () => {
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

    it('rango: muestra los atajos traducidos y "Últimos 7 días" elige de hace 6 días a hoy', async () => {
      const { open, all, settle, host } = setup((h) => {
        h.mode.set('range');
        h.presets.set(['today', 'last7Days', 'thisMonth', 'lastMonth']);
      });
      await open();
      const group = document.querySelector('.cb-datepicker__presets')!;
      expect(group.getAttribute('role')).toBe('group');
      expect(group.getAttribute('aria-label')).toBe('Atajos');
      const buttons = () => all<HTMLButtonElement>('.cb-datepicker__preset');
      expect(buttons().map((b) => b.textContent!.trim())).toEqual(['Hoy', 'Últimos 7 días', 'Este mes', 'Mes anterior']);
      buttons()[1].click();
      await settle();
      const [start, end] = host.range()!;
      const today = new Date();
      const sixAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
      expect(sameDay(start, sixAgo) && sameDay(end!, today)).toBe(true);
      // Cierra y, al reabrir, el atajo aplicado aparece marcado.
      expect(document.querySelector('.cb-datepicker__panel')).toBeNull();
      await open();
      expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
      expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
    });

    it('"Mes anterior" va del día 1 al último día del mes anterior', async () => {
      const { open, all, settle, host } = setup((h) => {
        h.mode.set('range');
        h.presets.set(['lastMonth']);
      });
      await open();
      all<HTMLButtonElement>('.cb-datepicker__preset')[0].click();
      await settle();
      const [start, end] = host.range()!;
      const now = new Date();
      expect(sameDay(start, new Date(now.getFullYear(), now.getMonth() - 1, 1))).toBe(true);
      expect(sameDay(end!, new Date(now.getFullYear(), now.getMonth(), 0))).toBe(true);
    });

    it('atajo propio y en fecha simple; los que caen fuera de maxDate se desactivan', async () => {
      const cierre = new Date(2026, 11, 31);
      const { open, all, settle, host } = setup((h) => {
        h.presets.set([{ label: 'Cierre de año', value: cierre }, 'yesterday']);
        h.max.set(new Date(2026, 5, 30));
      });
      await open();
      const [propio, ayer] = all<HTMLButtonElement>('.cb-datepicker__preset');
      expect(propio.textContent!.trim()).toBe('Cierre de año');
      expect(propio.disabled).toBe(true);
      host.max.set(null);
      await settle();
      all<HTMLButtonElement>('.cb-datepicker__preset')[0].click();
      await settle();
      expect(sameDay(host.value()!, cierre)).toBe(true);
      expect(ayer).toBeTruthy();
    });
  });
});
