import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CbCountdown, CbStatistic } from './statistic.component';

describe('CbStatistic', () => {
  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbStatistic);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra título, prefijo, valor formateado con Intl y sufijo', () => {
    const el = setup({
      title: 'Saldo',
      value: 1234.5,
      prefix: '≈',
      suffix: 'USD',
      locale: 'en-US',
      format: { minimumFractionDigits: 2 },
    });
    expect(el.querySelector('.cb-statistic__title')!.textContent).toBe('Saldo');
    expect(el.querySelector('.cb-statistic__number')!.textContent).toBe('1,234.50');
    expect(Array.from(el.querySelectorAll('.cb-statistic__affix')).map((a) => a.textContent)).toEqual(['≈', 'USD']);
  });

  it('acepta texto tal cual y muestra un guion sin valor', () => {
    expect(setup({ value: 'N/D' }).querySelector('.cb-statistic__number')!.textContent).toBe('N/D');
    expect(setup({ value: null }).querySelector('.cb-statistic__number')!.textContent).toBe('—');
  });

  it('la tendencia se indica con flecha, color y texto (no solo con color)', () => {
    const el = setup({ value: 8, trend: 'down', trendLabel: 'vs. septiembre' });
    const trend = el.querySelector('.cb-statistic__trend')!;
    expect(trend.classList).toContain('cb-statistic__trend--down');
    expect(trend.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(trend.querySelector('.cb-statistic__sr')!.textContent).toBe('disminuye');
    expect(trend.textContent).toContain('vs. septiembre');
  });
});

describe('CbCountdown', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date('2026-10-20T10:00:00Z') }));
  afterEach(() => vi.useRealTimers());

  it('cuenta hacia atrás cada segundo dentro de un role="timer" y emite finished una vez', () => {
    const fixture = TestBed.createComponent(CbCountdown);
    fixture.componentRef.setInput('title', 'Tu código vence en');
    fixture.componentRef.setInput('target', new Date('2026-10-20T10:01:05Z'));
    let finished = 0;
    fixture.componentInstance.finished.subscribe(() => finished++);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const timer = el.querySelector('[role="timer"]')!;
    expect(timer.getAttribute('aria-label')).toBe('Tu código vence en');
    expect(timer.textContent!.trim()).toBe('00:01:05');

    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(timer.textContent!.trim()).toBe('00:01:00');

    vi.advanceTimersByTime(70_000);
    fixture.detectChanges();
    expect(timer.textContent!.trim()).toBe('00:00:00');
    vi.advanceTimersByTime(3000);
    fixture.detectChanges();
    expect(finished).toBe(1);
  });

  it('muestra los días cuando quedan', () => {
    const fixture = TestBed.createComponent(CbCountdown);
    fixture.componentRef.setInput('target', new Date('2026-10-22T12:30:00Z').getTime());
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.cb-statistic__number')!.textContent).toBe('2d 02:30:00');
  });
});
