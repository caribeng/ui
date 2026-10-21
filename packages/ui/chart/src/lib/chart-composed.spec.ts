import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbChart } from './chart.component';
import {
  CbChartArea,
  CbChartAxis,
  CbChartBar,
  CbChartCandlestick,
  CbChartLine,
  CbChartRangeArea,
  CbChartReferenceBand,
  CbChartReferenceLine,
  CbChartScatter,
  type CbChartRecord,
} from './chart-parts';
import { curvePath } from './renderers/composed';

const VENTAS: CbChartRecord[] = [
  { mes: 'Ene', ingresos: 120, margen: 0.18 },
  { mes: 'Feb', ingresos: 190, margen: 0.22 },
  { mes: 'Mar', ingresos: 150, margen: 0.2 },
];

function mount<T>(component: new () => T) {
  const fixture = TestBed.createComponent(component);
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

describe('curvePath', () => {
  it('la curva suave no se sale del rango de los datos en un tramo monótono', () => {
    const d = curvePath(
      [
        { x: 0, y: 100 },
        { x: 10, y: 50 },
        { x: 20, y: 0 },
      ],
      'smooth',
    );
    const ys = [...d.matchAll(/C ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)/g)].flatMap((m) => [Number(m[2]), Number(m[4])]);
    expect(ys.length).toBeGreaterThan(0);
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });

  it('la escalonada usa tramos horizontales y verticales', () => {
    expect(curvePath([{ x: 0, y: 5 }, { x: 10, y: 2 }], 'step')).toBe('M 0 5 H 10 V 2');
  });
});

@Component({
  imports: [CbChart, CbChartBar, CbChartLine, CbChartAxis, CbChartReferenceLine],
  template: `
    <cb-chart [data]="ventas" ariaLabel="Ventas">
      <cb-chart-bar x="mes" y="ingresos" name="Ingresos" />
      <cb-chart-line x="mes" y="margen" name="Margen" axis="right" />
      <cb-chart-axis position="right" label="Margen" [format]="{ style: 'percent' }" />
      <cb-chart-reference-line [value]="160" label="Meta" />
    </cb-chart>
  `,
})
class ComboHost {
  ventas = VENTAS;
}

describe('CbChart composable', () => {
  it('combina barras y una línea en el eje derecho, con su formato y título', () => {
    const { all, el, key, live } = mount(ComboHost);
    expect(all('rect.cb-chart__bar')).toHaveLength(3);
    expect(all('path.cb-chart__line')).toHaveLength(1);
    const texts = all('.cb-chart__axis').map((t) => t.textContent!.trim());
    expect(texts).toEqual(expect.arrayContaining(['Ene', 'Feb', 'Mar', 'Margen']));
    // Eje derecho con formato de porcentaje.
    expect(texts.some((t) => /%/.test(t))).toBe(true);
    // Línea de referencia con etiqueta.
    expect(all('line.cb-chart__ref-line')).toHaveLength(1);
    expect(all('.cb-chart__ref-label').map((t) => t.textContent!.trim())).toEqual(['Meta']);
    key('ArrowRight');
    expect(live()).toMatch(/^Ene: Ingresos 120, Margen 18\s?%$/);
    // Tabla accesible: una columna por serie y una fila por categoría.
    expect(Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent)).toEqual(['Ingresos', 'Margen']);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('la barra de la meta queda por encima de la de enero: la escala incluye la referencia', () => {
    const { all } = mount(ComboHost);
    const ref = all('line.cb-chart__ref-line')[0];
    const ene = all('rect.cb-chart__bar')[0];
    expect(num(ref, 'y1')).toBeLessThan(num(ene, 'y'));
  });
});

@Component({
  imports: [CbChart, CbChartBar],
  template: `
    <cb-chart [data]="datos">
      <cb-chart-bar x="mes" y="a" name="A" stack="total" />
      <cb-chart-bar x="mes" y="b" name="B" stack="total" />
    </cb-chart>
  `,
})
class StackHost {
  datos = [
    { mes: 'Ene', a: 10, b: 20 },
    { mes: 'Feb', a: 30, b: 5 },
  ];
}

it('apila las barras con el mismo stack', () => {
  const { all } = mount(StackHost);
  // Se dibujan serie a serie: [A Ene, A Feb, B Ene, B Feb].
  const [a, , b] = all('rect.cb-chart__bar');
  expect(a.getAttribute('x')).toBe(b.getAttribute('x'));
  expect(num(b, 'y') + num(b, 'height')).toBeCloseTo(num(a, 'y'), 0);
});

const t0 = new Date(2026, 9, 21, 9, 0).getTime();
const VELAS = Array.from({ length: 30 }, (_, i) => {
  const open = 100 + i;
  const close = i % 3 === 0 ? open - 2 : open + 3;
  return { ts: new Date(t0 + i * 60_000), open, close, high: Math.max(open, close) + 1, low: Math.min(open, close) - 1, vol: 1000 + i * 10 };
});

@Component({
  imports: [CbChart, CbChartCandlestick, CbChartAxis, CbChartReferenceBand],
  template: `
    <cb-chart [data]="velas" [zoom]="true" [locale]="'es-CO'" ariaLabel="Precio">
      <cb-chart-candlestick x="ts" name="PRIM" />
      <cb-chart-axis position="left" [min]="90" />
      <cb-chart-reference-band [from]="110" [to]="120" label="Rango" />
    </cb-chart>
  `,
})
class CandleHost {
  velas = VELAS;
}

describe('velas, tiempo y zoom', () => {
  it('dibuja una vela por registro con color de subida o bajada', () => {
    const { all } = mount(CandleHost);
    const candles = all('rect.cb-chart__candle');
    expect(candles).toHaveLength(30);
    expect(candles[0].getAttribute('fill')).toContain('danger');
    expect(candles[1].getAttribute('fill')).toContain('success');
    expect(all('line.cb-chart__wick')).toHaveLength(30);
    expect(all('rect.cb-chart__ref-band')).toHaveLength(1);
  });

  it('eje de tiempo: marcas con hora y tooltip con apertura, máximo, mínimo y cierre', () => {
    const { all, key, live } = mount(CandleHost);
    const ticks = all('.cb-chart__axis').map((t) => t.textContent!.trim());
    expect(ticks.some((t) => /\d{1,2}:\d{2}/.test(t))).toBe(true);
    key('ArrowRight');
    expect(live()).toMatch(/PRIM · Apertura 100, Máximo 101, Mínimo 97, Cierre 98$/);
  });

  it('+ acerca (menos elementos visibles), 0 restablece y aparece el botón de restablecer', () => {
    const { all, key, el, fixture } = mount(CandleHost);
    const count = () => all('rect.cb-chart__hit').length;
    expect(count()).toBe(30);
    expect(el.querySelector('.cb-chart__reset')).toBeNull();
    key('+');
    key('+');
    expect(count()).toBeLessThan(30);
    expect(count()).toBeGreaterThan(1);
    expect(el.querySelector('.cb-chart__reset')).not.toBeNull();
    // Los datos se recortan al área de dibujo.
    expect(el.querySelector('g[clip-path]')).not.toBeNull();
    key('0');
    expect(count()).toBe(30);
    key('+');
    el.querySelector<HTMLButtonElement>('.cb-chart__reset')!.click();
    fixture.detectChanges();
    expect(count()).toBe(30);
  });

  it('la rueda del ratón acerca y aleja', () => {
    const { all, el, fixture } = mount(CandleHost);
    const svg = el.querySelector('svg')!;
    svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, cancelable: true }));
    fixture.detectChanges();
    expect(all('rect.cb-chart__hit').length).toBeLessThan(30);
    svg.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }));
    svg.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }));
    fixture.detectChanges();
    expect(all('rect.cb-chart__hit')).toHaveLength(30);
  });

  it('sin zoom las teclas + y - no hacen nada', () => {
    @Component({
      imports: [CbChart, CbChartCandlestick],
      template: `<cb-chart [data]="velas"><cb-chart-candlestick x="ts" name="PRIM" /></cb-chart>`,
    })
    class NoZoom {
      velas = VELAS;
    }
    const { all, key } = mount(NoZoom);
    key('+');
    expect(all('rect.cb-chart__hit')).toHaveLength(30);
  });
});

@Component({
  imports: [CbChart, CbChartLine, CbChartArea, CbChartRangeArea],
  template: `
    <cb-chart [data]="datos">
      <cb-chart-range-area x="mes" low="min" high="max" name="Rango" curve="smooth" />
      <cb-chart-area x="mes" y="media" name="Media" />
      <cb-chart-line x="mes" y="media" name="Proyección" dashed [points]="false" />
    </cb-chart>
  `,
})
class RangeHost {
  datos = [
    { mes: 'Ene', min: 10, max: 20, media: 15 },
    { mes: 'Feb', min: 12, max: 26, media: 19 },
    { mes: 'Mar', min: 8, max: 18, media: 13 },
  ];
}

it('banda de rango cerrada, área y línea discontinua sin puntos', () => {
  const { all, key, live } = mount(RangeHost);
  const range = all('path.cb-chart__area--range')[0];
  expect(range.getAttribute('d')).toMatch(/Z$/);
  expect(all('path.cb-chart__line--dashed')).toHaveLength(1);
  key('ArrowRight');
  expect(live()).toBe('Ene: Rango 10 – 20, Media 15, Proyección 15');
});

@Component({
  imports: [CbChart, CbChartScatter, CbChartAxis],
  template: `
    <cb-chart [data]="puntos">
      <cb-chart-scatter x="edad" y="saldo" name="Clientes" [size]="4" />
      <cb-chart-axis position="bottom" label="Edad" />
      <cb-chart-axis position="left" label="Saldo" />
    </cb-chart>
  `,
})
class ScatterHost {
  puntos = [
    { edad: 25, saldo: 1200 },
    { edad: 40, saldo: 5400 },
    { edad: 33, saldo: 2600 },
  ];
}

it('dispersión: eje X numérico y cada punto es un elemento con X e Y', () => {
  const { all, key, live } = mount(ScatterHost);
  expect(all('circle.cb-chart__point--scatter')).toHaveLength(3);
  expect(all('rect.cb-chart__hit')).toHaveLength(3);
  key('ArrowRight');
  expect(live()).toBe('Clientes: Edad 25, Saldo 1200');
  key('ArrowRight');
  // Ordenados por X: 33 va antes que 40.
  expect(live()).toBe('Clientes: Edad 33, Saldo 2600');
});

@Component({
  imports: [CbChart, CbChartLine],
  template: `
    <cb-chart [data]="datos()">
      <cb-chart-line x="mes" y="v" name="A" />
      <cb-chart-line x="mes" y="w" name="B" />
    </cb-chart>
  `,
})
class LegendHost {
  datos = signal<CbChartRecord[]>([
    { mes: 'Ene', v: 1, w: 2 },
    { mes: 'Feb', v: 3, w: 1 },
  ]);
}

it('la leyenda oculta series y los datos se actualizan al cambiar el signal', () => {
  const { all, el, fixture } = mount(LegendHost);
  expect(all('path.cb-chart__line')).toHaveLength(2);
  el.querySelectorAll<HTMLButtonElement>('.cb-chart__legend button')[0].click();
  fixture.detectChanges();
  expect(all('path.cb-chart__line')).toHaveLength(1);
  fixture.componentInstance.datos.set([
    { mes: 'Ene', v: 1, w: 2 },
    { mes: 'Feb', v: 3, w: 1 },
    { mes: 'Mar', v: 2, w: 4 },
  ]);
  fixture.detectChanges();
  expect(all('circle.cb-chart__point')).toHaveLength(3);
});
