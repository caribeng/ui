import { arcPath, polar, round } from '../chart-geometry';
import { paletteColor, type ChartContext, type ChartItem, type ChartScene, type ChartShape } from '../chart-model';

/** Torta, dona y barras radiales: un elemento por categoría del primer dataset. */
export function renderCircular(ctx: ChartContext): ChartScene {
  const { labels, datasets } = ctx.data;
  const ds = datasets[0];
  const colorOf = (i: number) => ds?.colors?.[i] ?? paletteColor(i);
  const legend = labels.map((label, index) => ({ index, label, color: colorOf(index) }));
  const table = { head: null, rows: labels.map((label, i) => ({ label, cells: [ctx.format(ds?.data.at(i) ?? 0)] })) };
  if (!ds) return { shapes: [], hits: [], items: [], legend, table };

  const cx = ctx.width / 2;
  const cy = ctx.height / 2;
  const outer = Math.max(20, Math.min(cy - 10, 110));
  const visible = labels
    .map((label, index) => ({ index, label, value: Math.max(0, ds.data[index] ?? 0), color: colorOf(index) }))
    .filter((item) => !ctx.hidden.has(item.index));

  const shapes: ChartShape[] = [];
  const items: ChartItem[] = [];
  const add = (item: (typeof visible)[number], percent: number, path: string, tipAngle: number, tipRadius: number) => {
    const pos = items.length;
    shapes.push({ k: 'path', cls: 'cb-chart__slice', item: pos, d: path, fill: item.color });
    const [x, y] = polar(cx, cy, tipRadius, tipAngle);
    const value = `${ctx.format(item.value)} (${ctx.percent(percent)})`;
    items.push({ index: item.index, label: item.label, title: item.label, rows: [{ label: '', value, color: item.color }], x, y });
  };

  if (ctx.type === 'radialBar') {
    const gap = 4;
    const thickness = Math.max(6, Math.min(16, (outer * 0.6) / Math.max(1, visible.length) - gap));
    const max = ctx.max || 1;
    // Las pistas van primero, debajo de todos los anillos.
    visible.forEach((_, i) => {
      const r = outer - i * (thickness + gap);
      shapes.push({ k: 'path', cls: 'cb-chart__track', d: arcPath(cx, cy, r, r - thickness, 0, 360) });
    });
    visible.forEach((item, i) => {
      const r = outer - i * (thickness + gap);
      const percent = Math.min(1, item.value / max);
      add(item, percent, arcPath(cx, cy, r, r - thickness, 0, 360 * percent), (360 * percent) / 2, r - thickness / 2);
    });
    const center = visible.length === 1 ? { x: cx, y: cy, text: ctx.percent(Math.min(1, visible[0].value / max)) } : undefined;
    return { shapes, hits: [], items, legend, table, center };
  }

  const total = visible.reduce((sum, item) => sum + item.value, 0) || 1;
  const inner = ctx.type === 'doughnut' ? outer * 0.6 : 0;
  let angle = 0;
  for (const item of visible) {
    const sweep = (item.value / total) * 360;
    const start = angle;
    angle += sweep;
    add(item, item.value / total, arcPath(cx, cy, outer, inner, start, start + sweep), start + sweep / 2, (outer + inner) / 2 || outer * 0.6);
  }
  const center =
    ctx.type === 'doughnut' ? { x: cx, y: cy, text: ctx.format(visible.reduce((sum, item) => sum + item.value, 0)) } : undefined;
  return { shapes, hits: [], items, legend, table, center };
}

/** Medidor semicircular: el primer valor del primer dataset entre `min` y `max`, con franjas opcionales. */
export function renderGauge(ctx: ChartContext): ChartScene {
  const ds = ctx.data.datasets[0];
  const label = ctx.data.labels[0] ?? ds?.label ?? '';
  const value = ds?.data[0] ?? 0;
  const min = ctx.min;
  const max = ctx.max > min ? ctx.max : min + 1;
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const color = ds?.color ?? ds?.colors?.[0] ?? bandColor(ctx, value) ?? paletteColor(0);

  const cx = ctx.width / 2;
  const outer = Math.max(30, Math.min(ctx.width / 2 - 24, ctx.height - 44));
  const cy = round(Math.min(ctx.height - 24, 16 + outer + (ctx.height - 40 - outer) / 2));
  const thickness = Math.max(10, outer * 0.22);
  const inner = outer - thickness;
  const angleOf = (v: number) => -90 + 180 * Math.min(1, Math.max(0, (v - min) / (max - min)));

  const shapes: ChartShape[] = [{ k: 'path', cls: 'cb-chart__track', d: arcPath(cx, cy, outer, inner, -90, 90) }];
  // Franjas: un aro fino por fuera del medidor.
  for (const band of ctx.bands) {
    const d = arcPath(cx, cy, outer + 8, outer + 3, angleOf(band.from), angleOf(band.to));
    if (d) shapes.push({ k: 'path', cls: 'cb-chart__band', d, fill: band.color });
  }
  shapes.push({ k: 'path', cls: 'cb-chart__slice', item: 0, d: arcPath(cx, cy, outer, inner, -90, -90 + 180 * ratio), fill: color });
  if (!ctx.sparkline) {
    const [x0, y0] = polar(cx, cy, inner + thickness / 2, -90);
    const [x1, y1] = polar(cx, cy, inner + thickness / 2, 90);
    shapes.push({ k: 'text', cls: 'cb-chart__axis', x: x0, y: y0 + 16, text: ctx.format(min), anchor: 'middle' });
    shapes.push({ k: 'text', cls: 'cb-chart__axis', x: x1, y: y1 + 16, text: ctx.format(max), anchor: 'middle' });
  }
  const [tx, ty] = polar(cx, cy, outer, angleOf(value));
  return {
    shapes,
    hits: [],
    items: [{ index: 0, label, title: label, rows: [{ label: '', value: `${ctx.format(value)} (${ctx.percent(ratio)})`, color }], x: tx, y: ty }],
    legend: [],
    table: { head: null, rows: [{ label, cells: [ctx.format(value)] }] },
    center: { x: cx, y: round(cy - inner * 0.28), text: ctx.format(value), sub: label },
  };
}

/** Color de la franja que contiene el valor (para colorear el medidor según umbrales). */
function bandColor(ctx: ChartContext, value: number): string | undefined {
  return ctx.bands.find((b) => value >= Math.min(b.from, b.to) && value <= Math.max(b.from, b.to))?.color;
}
