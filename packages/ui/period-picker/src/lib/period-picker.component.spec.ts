import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbPeriodPicker } from './period-picker.component';
import { fiscalYear, monthsOf, periodFromKey, presetPeriod, quarterOf, quarterPeriod, type CbPeriod } from './period-model';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const span = (p: CbPeriod) => `${iso(p.from)}..${iso(p.to)}`;

afterEach(() => document.body.replaceChildren());

describe('modelo de periodos', () => {
  it('meses, trimestres y años fiscales (también con inicio en julio)', () => {
    expect(span(quarterPeriod(2026, 3))).toBe('2026-07-01..2026-09-30');
    expect(span(fiscalYear(2026, 6))).toBe('2025-07-01..2026-06-30');
    expect(span(quarterPeriod(2026, 1, 6))).toBe('2025-07-01..2025-09-30');
    expect(quarterOf(new Date(2026, 9, 23), 6)).toBe(2);
    expect(monthsOf(quarterPeriod(2026, 1))).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(span(periodFromKey('2024-02')!)).toBe('2024-02-01..2024-02-29');
  });

  it('atajos respecto a hoy', () => {
    const today = new Date(2026, 0, 15);
    expect(presetPeriod('lastMonth', today).key).toBe('2025-12');
    expect(presetPeriod('lastQuarter', today).key).toBe('2025-Q4');
    expect(span(presetPeriod('yearToDate', today))).toBe('2026-01-01..2026-01-15');
    expect(presetPeriod('thisYear', today, 6).key).toBe('2026');
    expect(span(presetPeriod('thisYear', today, 6))).toBe('2025-07-01..2026-06-30');
  });
});

@Component({
  imports: [CbPeriodPicker],
  template: `<cb-period-picker label="Periodo" [(value)]="value" [today]="today" [closed]="closed" [disableClosed]="disableClosed()" />`,
})
class HostComponent {
  value = signal<CbPeriod | null>(null);
  today = new Date(2026, 9, 23);
  closed = ['2026-08', '2026-09'];
  disableClosed = signal(false);
}

async function setup(disableClosed = false) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.disableClosed.set(disableClosed);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const el = fixture.nativeElement as HTMLElement;
  const trigger = el.querySelector<HTMLButtonElement>('button.cb-pp')!;
  const cells = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.cb-pp__cell'));
  const byText = (sel: string, text: string) => Array.from(document.querySelectorAll<HTMLButtonElement>(sel)).find((b) => b.textContent!.trim() === text)!;
  return { fixture, el, trigger, cells, byText, settle, host: fixture.componentInstance };
}

describe('CbPeriodPicker', () => {
  it('abre la cuadrícula de meses con el foco en el mes actual y elige un mes', async () => {
    const { trigger, cells, settle, host } = await setup();
    trigger.click();
    await settle();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(cells().length).toBe(12);
    expect(document.activeElement).toBe(cells()[9]);
    expect(cells()[7].getAttribute('aria-label')).toBe('Agosto de 2026, cerrado');
    cells()[9].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await settle();
    expect(document.activeElement).toBe(cells()[8]);
    cells()[8].click();
    await settle();
    expect(host.value()!.key).toBe('2026-09');
    expect(trigger.textContent).toContain('Septiembre de 2026');
    expect(trigger.textContent).toContain('cerrado');
    expect(document.activeElement).toBe(trigger);
  });

  it('trimestres, años y atajos', async () => {
    const { trigger, byText, settle, host, cells } = await setup();
    trigger.click();
    await settle();
    byText('.cb-pp__mode', 'Trimestre').click();
    await settle();
    expect(cells().map((c) => c.textContent!.trim())).toEqual(['T1', 'T2', 'T3', 'T4']);
    cells()[2].click();
    await settle();
    expect(host.value()!.key).toBe('2026-Q3');
    expect(trigger.textContent).toContain('T3 2026');
    trigger.click();
    await settle();
    byText('.cb-pp__preset', 'Año a la fecha').click();
    await settle();
    expect(host.value()).toMatchObject({ kind: 'range', key: '2026-01-01_2026-10-23' });
    expect(trigger.textContent).toContain('1 ene 2026 – 23 oct 2026');
  });

  it('con disableClosed no se eligen periodos con meses cerrados', async () => {
    const { trigger, cells, settle, host, byText } = await setup(true);
    trigger.click();
    await settle();
    expect(cells()[7].getAttribute('aria-disabled')).toBe('true');
    cells()[7].click();
    await settle();
    expect(host.value()).toBeNull();
    byText('.cb-pp__mode', 'Trimestre').click();
    await settle();
    expect(cells()[2].getAttribute('aria-disabled')).toBe('true');
    expect(byText('.cb-pp__preset', 'Mes anterior').disabled).toBe(true);
  });
});
