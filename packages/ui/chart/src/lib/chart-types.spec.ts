import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { squarify } from './chart-geometry';
import { CbChart, type CbChartData, type CbChartItemEvent, type CbChartType } from './chart.component';

function setup(type: CbChartType, data: CbChartData, inputs: Record<string, unknown> = {}) {
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
  const live = () => el.querySelector('[aria-live="polite"]')!.textContent!.trim();
  return { fixture, el, key, live, all: (sel: string) => Array.from(el.querySelectorAll<SVGElement>(sel)) };
}

const num = (el: Element, attr: string) => Number(el.getAttribute(attr));

describe('squarify', () => {
  it('reparte el área en proporción a los valores, sin salirse del rectángulo', () => {
    const cells = squarify([6, 6, 4, 3, 2, 2, 1], { x: 0, y: 0, w: 600, h: 400 });
    const area = (c: { w: number; h: number }) => c.w * c.h;
    expect(area(cells[0]!) / area(cells[6]!)).toBeCloseTo(6, 1);
    const total = cells.reduce((sum, c) => sum + area(c!), 0);
    expect(total).toBeCloseTo(600 * 400, -1);
    for (const c of cells) {
      expect(c!.x + c!.w).toBeLessThanOrEqual(600.001);
      expect(c!.y + c!.h).toBeLessThanOrEqual(400.001);
    }
  });

  it('deja vacíos los valores ≤ 0', () => {
    expect(squarify([5, 0, -2], { x: 0, y: 0, w: 10, h: 10 })).toEqual([{ x: 0, y: 0, w: 10, h: 10 }, null, null]);
  });
});

describe('CbChart: tipos nuevos', () => {
  it('waterfall: cada barra parte del acumulado anterior y los subtotales van desde 0', () => {
    const { all, key, live } = setup('waterfall', {
      labels: ['Inicio', 'Ventas', 'Costes', 'Total'],
      datasets: [{ label: 'Flujo', data: [100, 50, -30, 0], sums: [3] }],
    });
    const bars = all('rect.cb-chart__bar');
    expect(bars).toHaveLength(4);
    // La barra de Ventas empieza donde termina Inicio.
    expect(num(bars[1], 'y') + num(bars[1], 'height')).toBeCloseTo(num(bars[0], 'y'), 0);
    // Costes baja: rojo; Ventas sube: verde.
    expect(bars[1].getAttribute('fill')).toContain('success');
    expect(bars[2].getAttribute('fill')).toContain('danger');
    // El total va del 0 al acumulado (120).
    expect(num(bars[3], 'y') + num(bars[3], 'height')).toBeCloseTo(num(bars[0], 'y') + num(bars[0], 'height'), 0);
    expect(all('line.cb-chart__connector')).toHaveLength(3);
    key('End');
    expect(live()).toBe('Total: Total 120');
    key('ArrowLeft');
    expect(live()).toBe('Costes: Variación -30, Total 120');
  });

  it('gauge: arco proporcional entre min y max, valor en el centro y franjas', () => {
    const { el, all, key, live } = setup(
      'gauge',
      { labels: ['Cumplimiento'], datasets: [{ label: 'Meta', data: [75] }] },
      { bands: [{ from: 0, to: 50, color: 'red' }, { from: 50, to: 100, color: 'green' }] },
    );
    expect(all('path.cb-chart__track')).toHaveLength(1);
    expect(all('path.cb-chart__band')).toHaveLength(2);
    const arc = all('path.cb-chart__slice')[0];
    // Sin color propio, toma el de la franja que contiene el valor.
    expect(arc.getAttribute('fill')).toBe('green');
    expect(el.querySelector('.cb-chart__center')!.textContent!.trim()).toBe('75');
    expect(el.querySelector('.cb-chart__center-sub')!.textContent!.trim()).toBe('Cumplimiento');
    key('ArrowRight');
    expect(live()).toMatch(/^Cumplimiento: 75 \(75\s?%\)$/);
  });

  it('radar: un polígono por serie, un eje por categoría y tooltip con todas las series', () => {
    const data: CbChartData = {
      labels: ['Velocidad', 'Calidad', 'Coste', 'Soporte', 'Diseño'],
      datasets: [
        { label: 'Equipo A', data: [80, 70, 60, 90, 75] },
        { label: 'Equipo B', data: [60, 85, 80, 70, 65] },
      ],
    };
    const { all, el, key, live, fixture } = setup('radar', data);
    expect(all('path.cb-chart__area')).toHaveLength(2);
    expect(all('path.cb-chart__line')).toHaveLength(2);
    expect(all('path.cb-chart__area')[0].getAttribute('d')).toMatch(/Z$/);
    const axisLabels = all('.cb-chart__axis').map((t) => t.textContent!.trim());
    expect(axisLabels).toEqual(expect.arrayContaining(data.labels));
    expect(all('path.cb-chart__hit')).toHaveLength(5);
    key('ArrowRight');
    expect(live()).toBe('Velocidad: Equipo A 80, Equipo B 60');
    // La leyenda oculta una serie.
    el.querySelectorAll<HTMLButtonElement>('.cb-chart__legend button')[1].click();
    fixture.detectChanges();
    expect(all('path.cb-chart__area')).toHaveLength(1);
  });

  it('polarArea: sectores de igual ángulo y radio según el valor', () => {
    const { all, fixture } = setup('polarArea', {
      labels: ['A', 'B', 'C', 'D'],
      datasets: [{ label: 'Valores', data: [10, 20, 40, 30] }],
    });
    fixture.detectChanges();
    const slices = all('path.cb-chart__slice');
    expect(slices).toHaveLength(4);
    // El radio de cada sector se lee en el arco: "A r r".
    const radius = (p: SVGElement) => Number(/A ([\d.]+)/.exec(p.getAttribute('d')!)![1]);
    expect(radius(slices[2])).toBeGreaterThan(radius(slices[1]));
    expect(radius(slices[2]) / radius(slices[0])).toBeCloseTo(4, 1);
  });

  it('heatmap: una celda por fila y columna, más intensa cuanto mayor el valor, y flechas en 2D', () => {
    const { all, key, live, el } = setup('heatmap', {
      labels: ['Lun', 'Mar', 'Mié'],
      datasets: [
        { label: 'Mañana', data: [1, 5, 9] },
        { label: 'Tarde', data: [2, 6, 3] },
      ],
    });
    const cells = all('rect.cb-chart__cell');
    expect(cells).toHaveLength(6);
    const pct = (c: SVGElement) => Number(/(\d+)%/.exec(c.getAttribute('fill')!)![1]);
    expect(pct(cells[2])).toBeGreaterThan(pct(cells[0]));
    key('ArrowRight');
    expect(live()).toBe('Mañana · Lun: 1');
    key('ArrowDown');
    expect(live()).toBe('Tarde · Lun: 2');
    key('ArrowRight');
    expect(live()).toBe('Tarde · Mar: 6');
    // La tabla accesible tiene las columnas y una fila por dataset.
    const head = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent);
    expect(head).toEqual(['Lun', 'Mar', 'Mié']);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('treemap: rectángulos proporcionales, recorridos de mayor a menor y la leyenda oculta elementos', () => {
    const { all, key, live, el, fixture } = setup('treemap', {
      labels: ['Vivienda', 'Comida', 'Ocio'],
      datasets: [{ label: 'Gastos', data: [50, 30, 20] }],
    });
    const cells = all('rect.cb-chart__cell');
    expect(cells).toHaveLength(3);
    const area = (c: SVGElement) => num(c, 'width') * num(c, 'height');
    expect(area(cells[0]) / area(cells[2])).toBeCloseTo(2.5, 1);
    key('ArrowRight');
    expect(live()).toMatch(/^Vivienda: 50 \(50\s?%\)$/);
    el.querySelectorAll<HTMLButtonElement>('.cb-chart__legend button')[0].click();
    fixture.detectChanges();
    expect(all('rect.cb-chart__cell')).toHaveLength(2);
  });

  it('el clic en una celda emite itemSelect con su índice', () => {
    const { all, fixture } = setup('treemap', {
      labels: ['A', 'B'],
      datasets: [{ label: 'X', data: [1, 3] }],
    });
    const selected: CbChartItemEvent[] = [];
    fixture.componentInstance.itemSelect.subscribe((e) => selected.push(e));
    // La primera zona de clic es el elemento mayor (B).
    all('rect.cb-chart__hit')[0].dispatchEvent(new MouseEvent('click'));
    expect(selected).toEqual([{ index: 1, label: 'B' }]);
  });
});
