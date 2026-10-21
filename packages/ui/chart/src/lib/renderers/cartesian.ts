import { niceScale, polyline, round, type CbChartScale } from '../chart-geometry';
import {
  paletteColor,
  type ChartContext,
  type ChartHit,
  type ChartItem,
  type ChartScene,
  type ChartShape,
} from '../chart-model';

interface Series {
  index: number;
  label: string;
  data: number[];
  color: string;
  asLine: boolean;
}

interface Bar {
  category: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  horizontal: boolean;
}

/**
 * Marco de un gráfico cartesiano: área de dibujo, posiciones, rejilla, ejes y
 * franjas por categoría que reciben el ratón.
 */
function frame(ctx: ChartContext, scale: CbChartScale, horizontal: boolean) {
  const pad = ctx.sparkline
    ? { t: 6, r: 6, b: 6, l: 6 }
    : horizontal
      ? { t: 12, r: 20, b: 28, l: 96 }
      : { t: 16, r: 16, b: 28, l: 60 };
  const h = ctx.height;
  const plot = {
    left: pad.l,
    right: ctx.width - pad.r,
    top: pad.t,
    bottom: h - pad.b,
    width: ctx.width - pad.l - pad.r,
    height: h - pad.t - pad.b,
  };
  const labels = ctx.data.labels;
  const band = (horizontal ? plot.height : plot.width) / Math.max(1, labels.length);
  const valuePos = (v: number): number => {
    const ratio = (v - scale.min) / (scale.max - scale.min || 1);
    return round(horizontal ? plot.left + ratio * plot.width : plot.bottom - ratio * plot.height);
  };
  const bandCenter = (i: number): number => round((horizontal ? plot.top : plot.left) + band * (i + 0.5));

  const shapes: ChartShape[] = [];
  if (!ctx.sparkline) {
    for (const value of scale.ticks) {
      const pos = valuePos(value);
      const cls = value === 0 ? 'cb-chart__grid cb-chart__grid--zero' : 'cb-chart__grid';
      const text = ctx.format(value);
      if (horizontal) {
        shapes.push({ k: 'line', cls, x1: pos, y1: plot.top, x2: pos, y2: plot.bottom });
        shapes.push({ k: 'text', cls: 'cb-chart__axis', x: pos, y: h - 8, text, anchor: 'middle' });
      } else {
        shapes.push({ k: 'line', cls, x1: plot.left, y1: pos, x2: plot.right, y2: pos });
        shapes.push({ k: 'text', cls: 'cb-chart__axis', x: plot.left - 8, y: pos, text, anchor: 'end', baseline: 'central' });
      }
    }
    // Con muchas categorías se muestran solo algunas etiquetas para que no se pisen.
    const every = horizontal ? 1 : Math.ceil(labels.length / 10);
    labels.forEach((text, index) => {
      if (index % every) return;
      const pos = bandCenter(index);
      shapes.push(
        horizontal
          ? { k: 'text', cls: 'cb-chart__axis', x: plot.left - 8, y: pos, text, anchor: 'end', baseline: 'central' }
          : { k: 'text', cls: 'cb-chart__axis', x: pos, y: h - 8, text, anchor: 'middle' },
      );
    });
  }
  const hits: ChartHit[] = labels.map((_, index) =>
    horizontal
      ? { k: 'rect', item: index, x: plot.left, y: round(plot.top + band * index), w: plot.width, h: round(band) }
      : { k: 'rect', item: index, x: round(plot.left + band * index), y: plot.top, w: round(band), h: plot.height },
  );
  return { plot, band, valuePos, bandCenter, shapes, hits };
}

/** Barras (verticales u horizontales), líneas, áreas y combinados. */
export function renderCartesian(ctx: ChartContext): ChartScene {
  const { type, data, stacked } = ctx;
  const horizontal = type === 'horizontalBar';
  const n = data.labels.length;
  const series: Series[] = data.datasets
    .map((ds, index) => ({
      index,
      label: ds.label,
      data: ds.data,
      color: ds.color ?? paletteColor(index),
      asLine: type === 'line' || type === 'area' || (type === 'bar' && ds.type === 'line'),
    }))
    .filter((s) => !ctx.hidden.has(s.index));
  const barSeries = type === 'bar' || type === 'horizontalBar' ? series.filter((s) => !s.asLine) : [];
  const lineSeries = series.filter((s) => s.asLine);
  // Series que se apilan (barras, o áreas en `area`).
  const stackSeries = !stacked ? [] : type === 'area' ? lineSeries : barSeries;

  const values: number[] = [];
  const stacking = new Set(stackSeries);
  for (const s of series) if (!stacking.has(s)) values.push(...s.data.slice(0, n));
  for (let i = 0; i < n; i++) {
    let pos = 0;
    let neg = 0;
    for (const s of stacking) {
      const v = s.data[i] ?? 0;
      if (v >= 0) pos += v;
      else neg += v;
    }
    values.push(pos, neg);
  }
  const scale = niceScale(Math.min(0, ...values), Math.max(0, ...values), ctx.sparkline ? 2 : 4);
  const f = frame(ctx, scale, horizontal);
  const { plot, band, valuePos, bandCenter } = f;

  // --- Barras ---
  const bars: Bar[] = [];
  if (barSeries.length) {
    const groupSize = stacked ? Math.min(48, band * 0.6) : Math.min(band * 0.75, 36 * barSeries.length);
    const slot = stacked ? groupSize : groupSize / barSeries.length;
    const zero = valuePos(0);
    data.labels.forEach((_, i) => {
      const start = bandCenter(i) - groupSize / 2;
      let pos = 0;
      let neg = 0;
      barSeries.forEach((s, si) => {
        const v = s.data[i] ?? 0;
        let from = 0;
        if (stacked) {
          from = v >= 0 ? pos : neg;
          if (v >= 0) pos += v;
          else neg += v;
        }
        const a = stacked ? valuePos(from) : zero;
        const b = valuePos(from + v);
        const offset = round(start + (stacked ? 0 : slot * si) + 1);
        const thickness = round(Math.max(2, slot - 2));
        const lo = Math.min(a, b);
        const length = round(Math.max(1, Math.abs(b - a)));
        bars.push(
          horizontal
            ? { category: i, x: lo, y: offset, w: length, h: thickness, color: s.color, horizontal }
            : { category: i, x: offset, y: lo, w: thickness, h: length, color: s.color, horizontal },
        );
      });
    });
  }

  // --- Líneas y áreas (acumuladas si se apilan) ---
  const stackLines = type === 'area' && stacked;
  const totals = data.labels.map(() => 0);
  const linePoints = lineSeries.map((s) => {
    const base = [...totals];
    const points = data.labels.map((_, i) => {
      const v = (s.data[i] ?? 0) + (stackLines ? totals[i] : 0);
      if (stackLines) totals[i] = v;
      return { x: bandCenter(i), y: valuePos(v) };
    });
    const floor = base.map((b, i) => ({ x: bandCenter(i), y: valuePos(stackLines ? b : 0) }));
    return { series: s, points, floor };
  });

  const shapes: ChartShape[] = [...f.shapes];
  if (type === 'area') {
    for (const { series: s, points, floor } of linePoints) {
      const d = [polyline(points), ...[...floor].reverse().map((p) => `L ${p.x} ${p.y}`), 'Z'].join(' ');
      shapes.push({ k: 'path', cls: 'cb-chart__area', d, fill: s.color });
    }
  }
  for (const bar of bars) {
    shapes.push({
      k: 'rect',
      cls: bar.horizontal ? 'cb-chart__bar cb-chart__bar--horizontal' : 'cb-chart__bar',
      item: bar.category,
      x: bar.x,
      y: bar.y,
      w: bar.w,
      h: bar.h,
      rx: ctx.sparkline ? 1 : 3,
      fill: bar.color,
    });
  }
  // La guía vertical se dibuja aparte (va debajo de las líneas): ver ChartItem.cursor.
  const lineShapes: ChartShape[] = [];
  for (const { series: s, points } of linePoints) {
    lineShapes.push({ k: 'path', cls: 'cb-chart__line', d: polyline(points), stroke: s.color, pathLength: 1 });
    points.forEach((pt, i) =>
      lineShapes.push({ k: 'circle', cls: 'cb-chart__point', item: i, cx: pt.x, cy: pt.y, r: ctx.sparkline ? 0 : 3, rActive: 5, fill: s.color }),
    );
  }

  // --- Elementos navegables: una categoría con el valor de cada serie ---
  const items: ChartItem[] = data.labels.map((label, i) => {
    const rows = series.map((s) => ({ label: s.label, value: ctx.format(s.data[i] ?? 0), color: s.color }));
    const tops = [
      ...bars.filter((b) => b.category === i).map((b) => (horizontal ? b.x + b.w : b.y)),
      ...linePoints.map((l) => (horizontal ? 0 : (l.points[i]?.y ?? plot.top))),
    ];
    return horizontal
      ? { index: i, label, title: label, rows, x: Math.max(plot.left, ...tops), y: bandCenter(i) }
      : {
          index: i,
          label,
          title: label,
          rows,
          x: bandCenter(i),
          y: Math.min(plot.bottom, ...tops),
          cursor: { x: bandCenter(i), y1: plot.top, y2: plot.bottom },
        };
  });

  return {
    shapes,
    front: lineShapes,
    hits: f.hits,
    items,
    legend: data.datasets.map((ds, index) => ({ index, label: ds.label, color: ds.color ?? paletteColor(index) })),
    table: seriesTable(ctx),
  };
}

/** Cascada: variaciones que suben o bajan desde el acumulado anterior, con subtotales. */
export function renderWaterfall(ctx: ChartContext): ChartScene {
  const ds = ctx.data.datasets[0];
  const labels = ctx.data.labels;
  const sums = new Set(ds?.sums ?? []);
  const up = 'var(--cb-color-success-500)';
  const down = 'var(--cb-color-danger-500)';
  const total = ds?.color ?? 'var(--cb-color-primary-500)';

  // Tramos [desde, hasta] de cada barra.
  let running = 0;
  const steps = labels.map((label, i) => {
    if (sums.has(i)) return { label, from: 0, to: running, delta: running, sum: true };
    const delta = ds?.data[i] ?? 0;
    const from = running;
    running += delta;
    return { label, from, to: running, delta, sum: false };
  });
  const values = steps.flatMap((s) => [s.from, s.to]);
  const scale = niceScale(Math.min(0, ...values), Math.max(0, ...values), ctx.sparkline ? 2 : 4);
  const f = frame(ctx, scale, false);
  const { band, valuePos, bandCenter, plot } = f;
  const width = Math.min(48, band * 0.6);

  const shapes: ChartShape[] = [...f.shapes];
  const items: ChartItem[] = [];
  steps.forEach((s, i) => {
    const a = valuePos(s.from);
    const b = valuePos(s.to);
    const color = ds?.colors?.[i] ?? (s.sum ? total : s.delta >= 0 ? up : down);
    const x = round(bandCenter(i) - width / 2);
    const y = Math.min(a, b);
    shapes.push({ k: 'rect', cls: 'cb-chart__bar', item: i, x, y, w: round(width), h: round(Math.max(1, Math.abs(b - a))), rx: 3, fill: color });
    // Conector con la barra siguiente, a la altura del acumulado.
    if (i < steps.length - 1 && !ctx.sparkline) {
      shapes.push({ k: 'line', cls: 'cb-chart__connector', x1: round(x + width), y1: b, x2: round(bandCenter(i + 1) - width / 2), y2: b });
    }
    const rows = s.sum
      ? [{ label: ctx.text.total, value: ctx.format(s.to), color }]
      : [
          { label: ctx.text.change, value: (s.delta > 0 ? '+' : '') + ctx.format(s.delta), color },
          { label: ctx.text.total, value: ctx.format(s.to), color: total },
        ];
    items.push({ index: i, label: s.label, title: s.label, rows, x: bandCenter(i), y: y, cursor: { x: bandCenter(i), y1: plot.top, y2: plot.bottom } });
  });

  return {
    shapes,
    hits: f.hits,
    items,
    legend: [],
    table: {
      head: [ctx.text.change, ctx.text.total],
      rows: steps.map((s) => ({ label: s.label, cells: [s.sum ? '' : ctx.format(s.delta), ctx.format(s.to)] })),
    },
  };
}

/** Tabla accesible: una fila por categoría y una columna por serie. */
export function seriesTable(ctx: ChartContext): ChartScene['table'] {
  const { labels, datasets } = ctx.data;
  return {
    head: datasets.map((ds) => ds.label),
    rows: labels.map((label, i) => ({ label, cells: datasets.map((ds) => ctx.format(ds.data.at(i) ?? 0)) })),
  };
}
