import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { arcPath, niceScale } from './chart-geometry';
import { CbChart, type CbChartData, type CbChartItemEvent, type CbChartType } from './chart.component';

const SAMPLE: CbChartData = {
  labels: ['Ene', 'Feb', 'Mar'],
  datasets: [
    { label: 'Ventas', data: [120, 190, 150] },
    { label: 'Gastos', data: [80, 60, 100] },
  ],
};

function setup(type: CbChartType, data: CbChartData = SAMPLE, inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(CbChart);
  fixture.componentRef.setInput('type', type);
  fixture.componentRef.setInput('data', data);
  fixture.componentRef.setInput('animate', false);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const plot = el.querySelector<HTMLElement>('.cb-chart__plot')!;
  const key = (k: string) => {
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, plot, key, all: (sel: string) => Array.from(el.querySelectorAll<SVGElement>(sel)) };
}

describe('niceScale / arcPath', () => {
  it('redondea la escala e incluye el 0', () => {
    expect(niceScale(0, 190)).toEqual({ min: 0, max: 200, step: 50, ticks: [0, 50, 100, 150, 200] });
    expect(niceScale(-30, 70).ticks).toEqual([-50, -25, 0, 25, 50, 75]);
    expect(niceScale(0, 0).max).toBeGreaterThan(0);
  });

  it('dibuja sectores, anillos y no dibuja ángulos vacíos', () => {
    expect(arcPath(50, 50, 40, 0, 0, 90)).toMatch(/^M 50 50 L 50 10 A 40 40 0 0 1 90 50 Z$/);
    expect(arcPath(50, 50, 40, 20, 0, 270)).toContain(' 0 1 1 ');
    expect(arcPath(50, 50, 40, 0, 10, 10)).toBe('');
  });
});

describe('CbChart', () => {
  describe('cartesianos', () => {
    it('barras agrupadas: una por serie y categoría, y eje de valores con escala legible', () => {
      const { all } = setup('bar');
      expect(all('rect.cb-chart__bar')).toHaveLength(6);
      const ticks = all('.cb-chart__axis').map((t) => t.textContent!.trim());
      expect(ticks).toEqual(expect.arrayContaining(['0', '50', '100', '150', '200', 'Ene', 'Feb', 'Mar']));
    });

    it('apiladas: las barras de una categoría se colocan una sobre otra', () => {
      const { all } = setup('bar', SAMPLE, { stacked: true });
      const [ventas, gastos] = all('rect.cb-chart__bar').slice(0, 2);
      expect(ventas.getAttribute('x')).toBe(gastos.getAttribute('x'));
      const ventasTop = Number(ventas.getAttribute('y'));
      const gastosBottom = Number(gastos.getAttribute('y')) + Number(gastos.getAttribute('height'));
      expect(Math.abs(gastosBottom - ventasTop)).toBeLessThan(1.5);
      // La escala cubre la suma (200 + 100 = 300 en marzo).
      expect(all('.cb-chart__axis').map((t) => t.textContent!.trim())).toContain('300');
    });

    it('valores negativos: la barra crece hacia abajo desde la línea del 0', () => {
      const { all } = setup('bar', { labels: ['A', 'B'], datasets: [{ label: 'Saldo', data: [40, -20] }] });
      const zero = all('.cb-chart__grid--zero')[0];
      const [pos, neg] = all('rect.cb-chart__bar');
      const zeroY = Number(zero.getAttribute('y1'));
      expect(Number(pos.getAttribute('y')) + Number(pos.getAttribute('height'))).toBeCloseTo(zeroY, 0);
      expect(Number(neg.getAttribute('y'))).toBeCloseTo(zeroY, 0);
    });

    it('horizontales: las categorías van a la izquierda y las barras crecen en x', () => {
      const { all } = setup('horizontalBar', { labels: ['A', 'B'], datasets: [{ label: 'S', data: [10, 30] }] });
      const [a, b] = all('rect.cb-chart__bar');
      expect(Number(b.getAttribute('width'))).toBeGreaterThan(Number(a.getAttribute('width')));
      expect(a.getAttribute('x')).toBe(b.getAttribute('x'));
    });

    it('líneas y áreas: un trazado por serie; el área añade el relleno', () => {
      expect(setup('line').all('path.cb-chart__line')).toHaveLength(2);
      const area = setup('area');
      expect(area.all('path.cb-chart__area')).toHaveLength(2);
      expect(area.all('path.cb-chart__area')[0].getAttribute('d')).toMatch(/Z$/);
    });

    it('combinado: en bar, una serie con type "line" se dibuja como línea', () => {
      const data: CbChartData = { ...SAMPLE, datasets: [SAMPLE.datasets[0], { ...SAMPLE.datasets[1], type: 'line' }] };
      const { all } = setup('bar', data);
      expect(all('rect.cb-chart__bar')).toHaveLength(3);
      expect(all('path.cb-chart__line')).toHaveLength(1);
    });

    it('formatea los valores con valueFormat (Intl) o con una función', () => {
      const currency = setup('bar', SAMPLE, { valueFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }, locale: 'en-US' });
      expect(currency.all('.cb-chart__axis').map((t) => t.textContent!.trim())).toContain('$200');
      const fn = setup('bar', SAMPLE, { valueFormat: (v: number) => `${v} u.` });
      expect(fn.all('.cb-chart__axis').map((t) => t.textContent!.trim())).toContain('200 u.');
    });

    it('sparkline: sin ejes ni leyenda', () => {
      const { el, all } = setup('line', SAMPLE, { sparkline: true, height: 48 });
      expect(all('.cb-chart__axis')).toHaveLength(0);
      expect(el.querySelector('.cb-chart__legend')).toBeNull();
      expect(el.classList).toContain('cb-chart--sparkline');
    });
  });

  describe('circulares', () => {
    it('torta y dona: un sector por elemento; la dona muestra el total', () => {
      expect(setup('pie').all('path.cb-chart__slice')).toHaveLength(3);
      const donut = setup('doughnut');
      expect(donut.all('path.cb-chart__slice')).toHaveLength(3);
      expect(donut.el.querySelector('.cb-chart__center')!.textContent!.trim()).toBe('460');
    });

    it('usa los colores por elemento del dataset', () => {
      const { all } = setup('pie', { labels: ['A', 'B'], datasets: [{ label: 'S', data: [1, 1], colors: ['red', 'blue'] }] });
      expect(all('path.cb-chart__slice').map((p) => p.getAttribute('fill'))).toEqual(['red', 'blue']);
    });

    it('radial: un anillo con pista por elemento y porcentaje en el centro', () => {
      const { el, all } = setup('radialBar', { labels: ['Meta'], datasets: [{ label: 'Ahorro', data: [75] }] });
      expect(all('path.cb-chart__track')).toHaveLength(1);
      expect(all('path.cb-chart__slice')).toHaveLength(1);
      expect(el.querySelector('.cb-chart__center')!.textContent!.replace(/\s/g, '')).toMatch(/75/);
    });
  });

  describe('accesibilidad e interacción', () => {
    it('el gráfico es un grupo enfocable con nombre e instrucciones; el SVG es decorativo', () => {
      const { el, plot } = setup('bar', SAMPLE, { ariaLabel: 'Ventas por mes' });
      expect(plot.getAttribute('tabindex')).toBe('0');
      expect(plot.getAttribute('aria-label')).toBe('Ventas por mes');
      expect(el.querySelector(`#${plot.getAttribute('aria-describedby')}`)!.textContent).toContain('flechas');
      expect(el.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('incluye los datos como tabla para lectores de pantalla', () => {
      const { el } = setup('bar', SAMPLE, { ariaLabel: 'Ventas por mes' });
      const table = el.querySelector('table')!;
      expect(table.querySelector('caption')!.textContent).toBe('Ventas por mes');
      expect(Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent)).toEqual(['Ventas', 'Gastos']);
      const firstRow = Array.from(table.querySelectorAll('tbody tr')[0].children).map((c) => c.textContent);
      expect(firstRow).toEqual(['Ene', '120', '80']);
    });

    it('las flechas recorren las categorías: tooltip visible y anuncio en la región viva', () => {
      const { el, plot, key } = setup('bar');
      plot.dispatchEvent(new Event('focus'));
      key('ArrowRight');
      const tooltip = el.querySelector('.cb-chart__tooltip')!;
      expect(tooltip.textContent).toContain('Feb');
      expect(tooltip.textContent).toContain('190');
      expect(el.querySelector('[aria-live="polite"]')!.textContent).toBe('Feb: Ventas 190, Gastos 60');
      key('End');
      expect(el.querySelector('[aria-live="polite"]')!.textContent).toContain('Mar');
      key('ArrowRight');
      expect(el.querySelector('[aria-live="polite"]')!.textContent).toContain('Ene');
      key('Escape');
      expect(el.querySelector('.cb-chart__tooltip')).toBeNull();
    });

    it('en circulares anuncia valor y porcentaje', () => {
      const { el, plot, key } = setup('pie', { labels: ['A', 'B'], datasets: [{ label: 'S', data: [30, 10] }] });
      plot.dispatchEvent(new Event('focus'));
      key('ArrowRight');
      expect(el.querySelector('[aria-live="polite"]')!.textContent).toMatch(/^B: 10 \(25\s?%\)$/);
    });

    it('el ratón sobre una categoría muestra el tooltip y el clic emite itemSelect', () => {
      const { fixture, el, all } = setup('bar');
      const selected: CbChartItemEvent[] = [];
      fixture.componentInstance.itemSelect.subscribe((e) => selected.push(e));
      const hit = all('rect.cb-chart__hit')[2];
      hit.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      expect(el.querySelector('.cb-chart__tooltip')!.textContent).toContain('Mar');
      expect(all('rect.cb-chart__bar.cb-is-dim')).toHaveLength(4);
      hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(selected).toEqual([{ index: 2, label: 'Mar' }]);
    });

    it('la leyenda es una lista de botones que ocultan y muestran series', () => {
      const { fixture, el, all } = setup('bar');
      const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-chart__legend button'));
      expect(buttons().map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'true']);
      buttons()[1].click();
      fixture.detectChanges();
      expect(buttons()[1].getAttribute('aria-pressed')).toBe('false');
      expect(all('rect.cb-chart__bar')).toHaveLength(3);
    });

    it('sin datos muestra el mensaje del idioma activo', () => {
      const { el } = setup('bar', { labels: [], datasets: [] });
      expect(el.querySelector('.cb-chart__empty')!.textContent!.trim()).toBeTruthy();
    });
  });
});
