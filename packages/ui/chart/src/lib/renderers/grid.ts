import { round, squarify } from '../chart-geometry';
import { paletteColor, type ChartContext, type ChartHit, type ChartItem, type ChartScene, type ChartShape } from '../chart-model';

/** Intensidad (0–1) → color entre la superficie y el color base. */
function heat(base: string, t: number): string {
  return `color-mix(in srgb, ${base} ${Math.round(12 + 88 * t)}%, var(--cb-color-surface-raised))`;
}

/** Mapa de calor: columnas = `labels`, filas = datasets; el color indica el valor. */
export function renderHeatmap(ctx: ChartContext): ChartScene {
  const { labels, datasets } = ctx.data;
  const rows = datasets;
  const cols = labels.length;
  const values = rows.flatMap((ds) => ds.data.slice(0, cols));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const base = rows[0]?.color ?? 'var(--cb-color-primary-600)';

  const pad = ctx.sparkline ? { t: 2, r: 2, b: 2, l: 2 } : { t: 8, r: 8, b: 44, l: 96 };
  const plot = { left: pad.l, top: pad.t, width: ctx.width - pad.l - pad.r, height: ctx.height - pad.t - pad.b };
  const cw = plot.width / Math.max(1, cols);
  const ch = plot.height / Math.max(1, rows.length);
  const gap = cw > 8 && ch > 8 ? 2 : 0;

  const shapes: ChartShape[] = [];
  const hits: ChartHit[] = [];
  const items: ChartItem[] = [];
  rows.forEach((ds, r) => {
    if (!ctx.sparkline) {
      shapes.push({ k: 'text', cls: 'cb-chart__axis', x: plot.left - 8, y: round(plot.top + ch * (r + 0.5)), text: ds.label, anchor: 'end', baseline: 'central' });
    }
    labels.forEach((col, c) => {
      const v = ds.data[c] ?? 0;
      const t = (v - min) / span;
      const x = round(plot.left + cw * c + gap / 2);
      const y = round(plot.top + ch * r + gap / 2);
      const w = round(Math.max(1, cw - gap));
      const h = round(Math.max(1, ch - gap));
      const item = items.length;
      const fill = ds.colors?.[c] ?? heat(base, t);
      shapes.push({ k: 'rect', cls: 'cb-chart__cell', item, x, y, w, h, rx: 2, fill });
      if (!ctx.sparkline && w >= 34 && h >= 18) {
        shapes.push({
          k: 'text',
          cls: t > 0.55 ? 'cb-chart__label cb-chart__label--inverse' : 'cb-chart__label',
          x: round(x + w / 2),
          y: round(y + h / 2),
          text: ctx.format(v),
          anchor: 'middle',
          baseline: 'central',
        });
      }
      hits.push({ k: 'rect', item, x, y, w, h });
      items.push({
        index: item,
        label: `${ds.label} · ${col}`,
        title: `${ds.label} · ${col}`,
        rows: [{ label: '', value: ctx.format(v), color: fill }],
        x: round(x + w / 2),
        y,
      });
    });
  });

  if (!ctx.sparkline) {
    const every = Math.ceil(cols / 12);
    labels.forEach((text, c) => {
      if (c % every) return;
      shapes.push({ k: 'text', cls: 'cb-chart__axis', x: round(plot.left + cw * (c + 0.5)), y: plot.top + plot.height + 16, text, anchor: 'middle' });
    });
    // Escala de color: mínimo, degradado en pasos y máximo.
    const y = ctx.height - 12;
    const steps = 8;
    const sw = 18;
    const x0 = round(ctx.width - pad.r - steps * sw - 40);
    shapes.push({ k: 'text', cls: 'cb-chart__axis', x: x0 - 6, y, text: ctx.format(min), anchor: 'end', baseline: 'central' });
    for (let i = 0; i < steps; i++) {
      shapes.push({ k: 'rect', cls: 'cb-chart__scale', x: x0 + i * sw, y: y - 5, w: sw, h: 10, fill: heat(base, i / (steps - 1)) });
    }
    shapes.push({ k: 'text', cls: 'cb-chart__axis', x: x0 + steps * sw + 6, y, text: ctx.format(max), anchor: 'start', baseline: 'central' });
  }

  return {
    shapes,
    hits,
    items,
    columns: cols,
    legend: [],
    table: { head: labels, rows: rows.map((ds) => ({ label: ds.label, cells: labels.map((_, c) => ctx.format(ds.data[c] ?? 0)) })) },
  };
}

/** Treemap: rectángulos de área proporcional a cada valor del primer dataset. */
export function renderTreemap(ctx: ChartContext): ChartScene {
  const { labels, datasets } = ctx.data;
  const ds = datasets[0];
  const colorOf = (i: number) => ds?.colors?.[i] ?? paletteColor(i);
  const legend = labels.map((label, index) => ({ index, label, color: colorOf(index) }));
  const table = { head: null, rows: labels.map((label, i) => ({ label, cells: [ctx.format(ds?.data.at(i) ?? 0)] })) };
  if (!ds) return { shapes: [], hits: [], items: [], legend, table };

  const values = labels.map((_, i) => (ctx.hidden.has(i) ? 0 : Math.max(0, ds.data[i] ?? 0)));
  const total = values.reduce((sum, v) => sum + v, 0) || 1;
  const pad = ctx.sparkline ? 1 : 4;
  const cells = squarify(values, { x: pad, y: pad, w: ctx.width - pad * 2, h: ctx.height - pad * 2 });
  // Orden de lectura: de mayor a menor.
  const order = labels.map((_, i) => i).filter((i) => cells[i]).sort((a, b) => values[b] - values[a]);

  const shapes: ChartShape[] = [];
  const hits: ChartHit[] = [];
  const items: ChartItem[] = [];
  for (const i of order) {
    const cell = cells[i]!;
    const item = items.length;
    const color = colorOf(i);
    shapes.push({ k: 'rect', cls: 'cb-chart__cell cb-chart__cell--tree', item, x: cell.x, y: cell.y, w: cell.w, h: cell.h, rx: 3, fill: color });
    if (!ctx.sparkline && cell.w >= 56 && cell.h >= 34) {
      shapes.push({ k: 'text', cls: 'cb-chart__label cb-chart__label--inverse cb-chart__label--strong', x: cell.x + 8, y: cell.y + 16, text: labels[i], anchor: 'start' });
      shapes.push({ k: 'text', cls: 'cb-chart__label cb-chart__label--inverse', x: cell.x + 8, y: cell.y + 32, text: ctx.format(values[i]), anchor: 'start' });
    }
    hits.push({ k: 'rect', item, x: cell.x, y: cell.y, w: cell.w, h: cell.h });
    items.push({
      index: i,
      label: labels[i],
      title: labels[i],
      rows: [{ label: '', value: `${ctx.format(values[i])} (${ctx.percent(values[i] / total)})`, color }],
      x: round(cell.x + cell.w / 2),
      y: cell.y,
    });
  }
  return { shapes, hits, items, legend, table };
}
