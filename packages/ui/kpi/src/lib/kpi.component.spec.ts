import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbKpi } from './kpi.component';

@Component({
  imports: [CbKpi],
  template: `<cb-kpi label="Gastos" [value]="value()" [previous]="previous()" [better]="better()" [series]="[10, 12, 9, 15]" [target]="target()" compareLabel="vs. septiembre" />`,
})
class HostComponent {
  value = signal<number | null>(1200000);
  previous = signal<number | null>(1000000);
  better = signal<'up' | 'down' | 'none'>('down');
  target = signal<number | null>(1500000);
}

afterEach(() => document.body.replaceChildren());

describe('CbKpi', () => {
  it('calcula la variación, la colorea según si subir es bueno o malo y la dice con texto', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ locale: 'es', numberLocale: 'es-CO', currency: 'COP' })] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = (s: string) => el.querySelector(s)!.textContent!.replace(/\s+/g, ' ').trim();
    expect(text('.cb-kpi__value')).toBe('$ 1.200.000');
    expect(text('.cb-kpi__compare')).toBe('vs. septiembre: $ 1.000.000');
    const delta = el.querySelector('.cb-kpi__delta')!;
    expect(delta.classList).toContain('cb-kpi__delta--bad');
    expect(text('.cb-kpi__sr')).toBe('sube 20%');
    expect(el.querySelector('.cb-kpi__spark')!.getAttribute('aria-label')!.replace(/\s/g, ' ')).toBe('Tendencia de 4 periodos: de $ 10 a $ 15');
    expect(el.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('80');
    expect(text('.cb-kpi__goal-text')).toBe('80 % de la meta ($ 1.500.000)');
    fixture.componentInstance.better.set('up');
    fixture.detectChanges();
    expect(delta.classList).toContain('cb-kpi__delta--good');
    fixture.componentInstance.previous.set(null);
    fixture.detectChanges();
    expect(el.querySelector('.cb-kpi__delta')).toBeNull();
  });
});
