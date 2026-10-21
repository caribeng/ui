import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbChartGroup } from './chart-group';
import { CbChartAnnotation, CbChartBar, CbChartCandlestick, CbChartLine, type CbChartRecord } from './chart-parts';
import { CbChart } from './chart.component';

const t0 = new Date(2026, 9, 21, 9, 0).getTime();
const tick = (i: number) => ({
  ts: new Date(t0 + i * 60_000),
  open: 100 + i,
  close: 101 + i,
  high: 102 + i,
  low: 99 + i,
  vol: 1000 + i,
});
const VELAS = Array.from({ length: 30 }, (_, i) => tick(i));

function setup<T>(component: new () => T) {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const charts = () => Array.from(el.querySelectorAll<HTMLElement>('cb-chart'));
  const within = (chart: HTMLElement, sel: string) => Array.from(chart.querySelectorAll<SVGElement>(sel));
  const key = (chart: HTMLElement, k: string) => {
    chart.querySelector('.cb-chart__plot')!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, charts, within, key };
}

@Component({
  imports: [CbChartGroup, CbChart, CbChartCandlestick, CbChartBar],
  template: `
    <cb-chart-group ariaLabel="PRIM/USD">
      <cb-chart [data]="velas" zoom ariaLabel="Precio"><cb-chart-candlestick x="ts" name="PRIM" /></cb-chart>
      <cb-chart [data]="velas" zoom ariaLabel="Volumen"><cb-chart-bar x="ts" y="vol" name="Volumen" /></cb-chart>
    </cb-chart-group>
  `,
})
class GroupHost {
  velas = VELAS;
}

describe('cb-chart-group', () => {
  it('es un grupo con nombre', () => {
    const { el } = setup(GroupHost);
    const group = el.querySelector('cb-chart-group')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('PRIM/USD');
  });

  it('el cursor de una gráfica se muestra en las demás, en el mismo valor de X', () => {
    const { charts, within, fixture } = setup(GroupHost);
    const [precio, volumen] = charts();
    within(precio, 'rect.cb-chart__hit')[4].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const tip = volumen.querySelector('.cb-chart__tooltip')!;
    expect(tip.textContent).toContain('1004');
    expect(within(volumen, 'line.cb-chart__cursor')).toHaveLength(1);
    // Solo la gráfica de origen lo anuncia.
    expect(volumen.querySelector('[aria-live="polite"]')!.textContent!.trim()).toBe('');
    precio.querySelector('svg')!.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(volumen.querySelector('.cb-chart__tooltip')).toBeNull();
  });

  it('el zoom se comparte: acercar en una reduce lo visible en todas', () => {
    const { charts, within, key } = setup(GroupHost);
    const [precio, volumen] = charts();
    expect(within(volumen, 'rect.cb-chart__hit')).toHaveLength(30);
    key(precio, '+');
    key(precio, '+');
    const visible = within(volumen, 'rect.cb-chart__hit').length;
    expect(visible).toBeLessThan(30);
    expect(within(precio, 'rect.cb-chart__hit')).toHaveLength(visible);
    expect(volumen.querySelector('.cb-chart__reset')).not.toBeNull();
    key(volumen, '0');
    expect(within(precio, 'rect.cb-chart__hit')).toHaveLength(30);
  });
});

@Component({
  imports: [CbChart, CbChartLine],
  template: `
    <cb-chart [data]="datos()" zoom [xWindow]="10 * 60000">
      <cb-chart-line x="ts" y="close" name="Cierre" />
    </cb-chart>
  `,
})
class LiveHost {
  datos = signal<CbChartRecord[]>(VELAS);
}

describe('tiempo real', () => {
  it('xWindow muestra solo los últimos minutos y avanza al llegar datos', () => {
    const { charts, within, fixture } = setup(LiveHost);
    const [chart] = charts();
    const visible = () => within(chart, 'rect.cb-chart__hit').length;
    expect(visible()).toBe(11);
    // Sin zoom elegido no hay nada que restablecer.
    expect(chart.querySelector('.cb-chart__reset')).toBeNull();
    fixture.componentInstance.datos.update((d) => [...d, tick(30), tick(31)]);
    fixture.detectChanges();
    expect(visible()).toBe(11);
    // El último dato llegado es el último elemento.
    const plot = chart.querySelector<HTMLElement>('.cb-chart__plot')!;
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(chart.querySelector('[aria-live="polite"]')!.textContent).toContain('132');
  });

  it('con zoom pegado al final, la ventana sigue a los datos nuevos', () => {
    const { charts, within, fixture } = setup(LiveHost);
    const [chart] = charts();
    const plot = chart.querySelector<HTMLElement>('.cb-chart__plot')!;
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    const before = within(chart, 'rect.cb-chart__hit').length;
    fixture.componentInstance.datos.update((d) => [...d, tick(30), tick(31), tick(32)]);
    fixture.detectChanges();
    expect(within(chart, 'rect.cb-chart__hit').length).toBe(before);
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(chart.querySelector('[aria-live="polite"]')!.textContent).toContain('133');
  });
});

@Component({
  imports: [CbChart, CbChartLine, CbChartAnnotation],
  template: `
    <cb-chart [data]="velas" ariaLabel="Cierre">
      <cb-chart-line x="ts" y="close" name="Cierre" />
      <cb-chart-annotation [x]="maximo.ts" [y]="maximo.close" label="Máximo de la sesión" />
    </cb-chart>
  `,
})
class NoteHost {
  velas = VELAS.slice(0, 10);
  maximo = VELAS[9];
}

describe('anotaciones y exportación', () => {
  it('dibuja la anotación y la incluye en el anuncio de su punto', () => {
    const { charts, within, key } = setup(NoteHost);
    const [chart] = charts();
    expect(within(chart, 'circle.cb-chart__note-dot')).toHaveLength(1);
    expect(within(chart, '.cb-chart__note').map((t) => t.textContent!.trim())).toEqual(['Máximo de la sesión']);
    key(chart, 'End');
    expect(chart.querySelector('[aria-live="polite"]')!.textContent!.trim()).toMatch(/Cierre 110, Máximo de la sesión$/);
  });

  it('toSvg devuelve un SVG autocontenido, con título y leyenda y sin zonas de clic', () => {
    @Component({
      imports: [CbChart, CbChartLine],
      template: `<cb-chart [data]="velas" ariaLabel="Cierre por minuto"><cb-chart-line x="ts" y="close" name="Cierre" /></cb-chart>`,
    })
    class ExportHost {
      velas = VELAS.slice(0, 5);
    }
    const fixture = TestBed.createComponent(ExportHost);
    fixture.detectChanges();
    const chart = fixture.debugElement.children[0].componentInstance as CbChart;
    const svg = chart.toSvg();
    expect(svg).toMatch(/^<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(svg).toContain('<title>Cierre por minuto</title>');
    expect(svg).toContain('>Cierre</text>');
    expect(svg).not.toContain('data-hit');
    expect(svg).not.toContain('class=');
  });
});
