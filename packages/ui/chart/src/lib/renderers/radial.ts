import { arcPath, niceScale, polar, polyline, round } from '../chart-geometry';
import { paletteColor, type ChartContext, type ChartHit, type ChartItem, type ChartScene, type ChartShape } from '../chart-model';
import { seriesTable } from './cartesian';

/** Radar: un eje por categoría y un polígono por serie. */
export function renderRadar(ctx: ChartContext): ChartScene {
  const { labels, datasets } = ctx.data;
  const n = labels.length;
  const series = datasets
    .map((ds, index) => ({ index, label: ds.label, data: ds.data, color: ds.color ?? paletteColor(index) }))
    .filter((s) => !ctx.hidden.has(s.index));
  const values = series.flatMap((s) => s.data.slice(0, n));
  const scale = niceScale(Math.min(0, ...values), Math.max(0, ...values), ctx.sparkline ? 2 : 4);
  const cx = ctx.width / 2;
  const cy = ctx.height / 2;
  const radius = Math.max(20, Math.min(cy - (ctx.sparkline ? 6 : 24), cx - (ctx.sparkline ? 6 : 90)));
  const step = 360 / Math.max(1, n);
  const r = (v: number) => (radius * (v - scale.min)) / (scale.max - scale.min || 1);
  const point = (v: number, i: number) => {
    const [x, y] = polar(cx, cy, r(v), i * step);
    return { x, y };
  };

  const shapes: ChartShape[] = [];
  if (!ctx.sparkline) {
    // Anillos poligonales de la escala y radios de cada eje.
    for (const tick of scale.ticks) {
      if (tick === scale.min) continue;
      shapes.push({ k: 'path', cls: 'cb-chart__grid', d: polyline(labels.map((_, i) => point(tick, i)), true), fill: 'none' });
    }
    labels.forEach((label, i) => {
      const end = point(scale.max, i);
      shapes.push({ k: 'line', cls: 'cb-chart__grid', x1: cx, y1: cy, x2: end.x, y2: end.y });
      const [lx, ly] = polar(cx, cy, radius + 12, i * step);
      const angle = (i * step) % 360;
      const anchor = angle === 0 || angle === 180 ? 'middle' : angle < 180 ? 'start' : 'end';
      const baseline = angle === 0 ? 'auto' : angle === 180 ? 'hanging' : 'central';
      shapes.push({ k: 'text', cls: 'cb-chart__axis', x: lx, y: ly, text: label, anchor, baseline });
    });
    for (const tick of scale.ticks) {
      if (tick === scale.min) continue;
      const p = point(tick, 0);
      shapes.push({ k: 'text', cls: 'cb-chart__axis cb-chart__axis--tick', x: p.x + 4, y: p.y, text: ctx.format(tick), anchor: 'start', baseline: 'central' });
    }
  }
  const front: ChartShape[] = [];
  for (const s of series) {
    const pts = labels.map((_, i) => point(s.data[i] ?? 0, i));
    shapes.push({ k: 'path', cls: 'cb-chart__area', d: polyline(pts, true), fill: s.color });
    front.push({ k: 'path', cls: 'cb-chart__line', d: polyline(pts, true), stroke: s.color, pathLength: 1 });
    pts.forEach((p, i) => front.push({ k: 'circle', cls: 'cb-chart__point', item: i, cx: p.x, cy: p.y, r: ctx.sparkline ? 0 : 3, rActive: 5, fill: s.color }));
  }

  // Cada eje es un elemento: su sector recibe el ratón.
  const hits: ChartHit[] = labels.map((_, i) => ({ k: 'path', item: i, d: arcPath(cx, cy, radius + 8, 0, i * step - step / 2, i * step + step / 2) }));
  const items: ChartItem[] = labels.map((label, i) => {
    const peak = Math.max(scale.min, ...series.map((s) => s.data[i] ?? 0));
    const p = point(peak, i);
    return {
      index: i,
      label,
      title: label,
      rows: series.map((s) => ({ label: s.label, value: ctx.format(s.data[i] ?? 0), color: s.color })),
      x: p.x,
      y: p.y,
    };
  });
  return {
    shapes,
    front,
    hits,
    items,
    legend: datasets.map((ds, index) => ({ index, label: ds.label, color: ds.color ?? paletteColor(index) })),
    table: seriesTable(ctx),
  };
}

/** Área polar: sectores de igual ángulo cuyo radio depende del valor. */
export function renderPolarArea(ctx: ChartContext): ChartScene {
  const { labels, datasets } = ctx.data;
  const ds = datasets[0];
  const colorOf = (i: number) => ds?.colors?.[i] ?? paletteColor(i);
  const visible = labels
    .map((label, index) => ({ index, label, value: Math.max(0, ds?.data[index] ?? 0), color: colorOf(index) }))
    .filter((item) => !ctx.hidden.has(item.index));
  const scale = niceScale(0, Math.max(0, ...visible.map((v) => v.value)), ctx.sparkline ? 2 : 4);
  const cx = ctx.width / 2;
  const cy = ctx.height / 2;
  const radius = Math.max(20, Math.min(cy - 10, 110));
  const r = (v: number) => (radius * v) / (scale.max || 1);
  const step = 360 / Math.max(1, visible.length);

  const shapes: ChartShape[] = [];
  const items: ChartItem[] = [];
  visible.forEach((item, i) => {
    const start = i * step;
    shapes.push({ k: 'path', cls: 'cb-chart__slice cb-chart__slice--polar', item: i, d: arcPath(cx, cy, r(item.value), 0, start, start + step), fill: item.color });
    const [x, y] = polar(cx, cy, Math.max(r(item.value), 12) * 0.7, start + step / 2);
    items.push({ index: item.index, label: item.label, title: item.label, rows: [{ label: '', value: ctx.format(item.value), color: item.color }], x, y });
  });
  if (!ctx.sparkline) {
    // Anillos de la escala encima de los sectores, para leer los valores.
    for (const tick of scale.ticks) {
      if (tick <= 0) continue;
      shapes.push({ k: 'circle', cls: 'cb-chart__ring', cx, cy, r: round(r(tick)), rActive: round(r(tick)) });
      shapes.push({ k: 'text', cls: 'cb-chart__axis cb-chart__axis--tick', x: cx + 4, y: round(cy - r(tick)), text: ctx.format(tick), anchor: 'start', baseline: 'hanging' });
    }
  }
  return {
    shapes,
    hits: [],
    items,
    legend: labels.map((label, index) => ({ index, label, color: colorOf(index) })),
    table: { head: null, rows: labels.map((label, i) => ({ label, cells: [ctx.format(ds?.data.at(i) ?? 0)] })) },
  };
}
