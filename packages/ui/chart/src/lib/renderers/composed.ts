import { polyline, round } from '../chart-geometry';
import type { ChartContext, ChartHit, ChartItem, ChartScene, ChartShape, ChartTooltipRow, SeriesSpec } from '../chart-model';
import { linearTicks, timeFormat, timeFormatLong, timeTicks, type TimeUnit } from '../chart-scale';

type Pt = { x: number; y: number };

/** Número de un campo (`Date` → milisegundos, texto numérico → número); `null` si no hay dato. */
function num(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Trazado de una serie según la curva: recta, suave (monótona, no se sale de los datos) o escalonada. */
export function curvePath(pts: readonly Pt[], curve: SeriesSpec['curve']): string {
  if (pts.length < 2 || curve === 'linear') return polyline(pts);
  if (curve === 'step') {
    return pts.map((p, i) => (i ? `H ${p.x} V ${p.y}` : `M ${p.x} ${p.y}`)).join(' ');
  }
  // Monótona en X (Fritsch–Carlson): suaviza sin crear picos que no están en los datos.
  const n = pts.length;
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    m.push(dx ? (pts[i + 1].y - pts[i].y) / dx : 0);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const s = 3 / Math.sqrt(h);
      t[i] = s * a * m[i];
      t[i + 1] = s * b * m[i];
    }
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    const dx = (q.x - p.x) / 3;
    d += ` C ${round(p.x + dx)} ${round(p.y + t[i] * dx)} ${round(q.x - dx)} ${round(q.y - t[i + 1] * dx)} ${q.x} ${q.y}`;
  }
  return d;
}

interface SeriesPoint {
  key: number;
  y: number | null;
  low: number | null;
  high: number | null;
  open: number | null;
  close: number | null;
  /** Base y tope apilados (barras y áreas con `stack`). */
  base: number;
  top: number;
}

/** Gráfico composable: series, ejes y referencias declarados como hijos de `<cb-chart>`. */
export function renderComposed(ctx: ChartContext): ChartScene {
  const spec = ctx.composed!;
  const all = spec.series;
  const visible = all.filter((s) => !ctx.hidden.has(s.index));
  const axisOf = (pos: 'bottom' | 'left' | 'right') => spec.axes.find((a) => a.position === pos);
  const xAxis = axisOf('bottom');

  // --- Eje X: tipo y claves --------------------------------------------------------------
  const rawXs = all.flatMap((s) => s.records.map((r) => r[s.x]));
  let xType = xAxis?.type ?? 'auto';
  if (xType === 'auto') {
    xType = rawXs.some((v) => v instanceof Date)
      ? 'time'
      : rawXs.some((v) => typeof v === 'number') && rawXs.every((v) => v == null || typeof v === 'number')
        ? 'linear'
        : 'category';
  }
  const categories: string[] = [];
  const catIndex = new Map<string, number>();
  const toX = (v: unknown, register: boolean): number | null => {
    if (xType === 'category') {
      if (v == null) return null;
      const k = String(v);
      if (!catIndex.has(k)) {
        if (!register) return null;
        catIndex.set(k, categories.length);
        categories.push(k);
      }
      return catIndex.get(k)! + 0.5;
    }
    if (xType === 'time' && typeof v === 'string') {
      const t = Date.parse(v);
      return Number.isFinite(t) ? t : null;
    }
    return num(v);
  };

  // Puntos de cada serie (todas, para que el dominio no cambie al ocultar una).
  const points = new Map<SeriesSpec, SeriesPoint[]>();
  for (const s of all) {
    const pts: SeriesPoint[] = [];
    for (const r of s.records) {
      const key = toX(r[s.x], true);
      if (key === null) continue;
      pts.push({ key, y: num(r[s.y]), low: num(r[s.low]), high: num(r[s.high]), open: num(r[s.open]), close: num(r[s.close]), base: 0, top: 0 });
    }
    pts.sort((a, b) => a.key - b.key);
    points.set(s, pts);
  }
  const keys = [...new Set(all.flatMap((s) => points.get(s)!.map((p) => p.key)))].sort((a, b) => a - b);
  if (!keys.length) return { shapes: [], hits: [], items: [], legend: legendOf(all), table: { head: null, rows: [] } };

  const hasBands = visible.some((s) => s.kind === 'bar' || s.kind === 'candlestick');
  let minGap = Infinity;
  for (let i = 1; i < keys.length; i++) minGap = Math.min(minGap, keys[i] - keys[i - 1]);
  let full: [number, number];
  if (xType === 'category') {
    full = [0, categories.length];
    minGap = 1;
  } else {
    if (!Number.isFinite(minGap)) minGap = Math.abs(keys[0]) * 0.1 || 1;
    const pad = hasBands ? minGap / 2 : 0;
    full = keys[0] === keys[keys.length - 1] ? [keys[0] - minGap, keys[0] + minGap] : [keys[0] - pad, keys[keys.length - 1] + pad];
  }
  const span = full[1] - full[0];
  const d0 = full[0] + span * spec.view[0];
  const d1 = full[0] + span * spec.view[1];
  const inView = (k: number) => k >= d0 - 1e-9 && k <= d1 + 1e-9;

  // --- Área de dibujo -------------------------------------------------------------------
  const refsOn = (axis: string) => spec.refs.some((r) => r.axis === axis);
  const usesRight = all.some((s) => s.axis === 'right') || !!axisOf('right') || refsOn('right');
  const usesLeft = all.some((s) => s.axis === 'left') || !!axisOf('left') || refsOn('left');
  const yLabels = spec.axes.some((a) => a.label && a.position !== 'bottom');
  const pad = ctx.sparkline
    ? { t: 6, r: 6, b: 6, l: 6 }
    : { t: yLabels ? 30 : 16, r: usesRight ? 60 : 16, b: xAxis?.label ? 46 : 30, l: usesLeft ? 60 : 16 };
  const plot = {
    left: pad.l,
    right: ctx.width - pad.r,
    top: pad.t,
    bottom: ctx.height - pad.b,
    width: Math.max(10, ctx.width - pad.l - pad.r),
    height: Math.max(10, ctx.height - pad.t - pad.b),
  };
  const xPos = (k: number) => round(plot.left + ((k - d0) / (d1 - d0 || 1)) * plot.width);

  // --- Apilado ---------------------------------------------------------------------------
  const stacks = new Map<string, Map<number, { pos: number; neg: number }>>();
  for (const s of visible) {
    for (const p of points.get(s)!) {
      const v = p.y ?? 0;
      if ((s.kind === 'bar' || s.kind === 'area') && s.stack) {
        const id = `${s.axis}:${s.stack}`;
        if (!stacks.has(id)) stacks.set(id, new Map());
        const totals = stacks.get(id)!.get(p.key) ?? { pos: 0, neg: 0 };
        p.base = v >= 0 ? totals.pos : totals.neg;
        if (v >= 0) totals.pos += v;
        else totals.neg += v;
        stacks.get(id)!.set(p.key, totals);
        p.top = p.base + v;
      } else {
        p.base = 0;
        p.top = v;
      }
    }
  }

  // --- Ejes Y ----------------------------------------------------------------------------
  const tickCount = ctx.sparkline ? 2 : Math.max(2, Math.round(plot.height / 55));
  const yScale = (axis: 'left' | 'right') => {
    const values: number[] = [];
    for (const s of visible) {
      if (s.axis !== axis) continue;
      for (const p of points.get(s)!) {
        if (!inView(p.key)) continue;
        if (s.kind === 'rangeArea' || s.kind === 'candlestick') values.push(...[p.low, p.high].filter((v): v is number => v !== null));
        else if (p.y !== null) values.push(p.top, p.base);
      }
    }
    for (const r of spec.refs) {
      if (r.axis !== axis) continue;
      for (const v of [r.value, r.from, r.to]) {
        const n = num(v);
        if (n !== null) values.push(n);
      }
    }
    const conf = axisOf(axis);
    const zero = visible.some((s) => s.axis === axis && (s.kind === 'bar' || s.kind === 'area'));
    const lo = conf?.min ?? (values.length ? Math.min(...values) : 0);
    const hi = conf?.max ?? (values.length ? Math.max(...values) : 1);
    const scale = linearTicks(lo, hi, tickCount, zero && conf?.min === undefined);
    const min = conf?.min ?? scale.min;
    const max = conf?.max ?? scale.max;
    return { min, max, ticks: scale.ticks.filter((t) => t >= min - 1e-9 && t <= max + 1e-9), format: conf?.format ?? ctx.format };
  };
  const scales = { left: yScale('left'), right: yScale('right') };
  const yPos = (axis: 'left' | 'right', v: number) => {
    const { min, max } = scales[axis];
    return round(plot.bottom - ((v - min) / (max - min || 1)) * plot.height);
  };

  // --- Formatos del eje X -----------------------------------------------------------------
  let unit: TimeUnit = 'day';
  let xTicks: number[] = [];
  const xCount = Math.max(2, Math.floor(plot.width / 90));
  if (xType === 'time') ({ ticks: xTicks, unit } = timeTicks(d0, d1, xCount));
  else if (xType === 'linear') xTicks = linearTicks(d0, d1, xCount, false).ticks.filter((t) => t >= d0 && t <= d1);
  const xFormatShort =
    xType === 'time' ? timeFormat(ctx.locale, unit) : xType === 'linear' ? (xAxis?.format ?? ctx.format) : (k: number) => categories[Math.floor(k)] ?? '';
  // En el tooltip y la tabla la fecha se escribe completa, con la unidad de los datos.
  const dataUnit: TimeUnit = minGap < 60_000 ? 'second' : minGap < 86_400_000 ? 'minute' : 'day';
  const xFormatLong = xType === 'time' ? timeFormatLong(ctx.locale, dataUnit) : xFormatShort;

  // --- Rejilla y ejes ------------------------------------------------------------------
  const shapes: ChartShape[] = [];
  const primary: 'left' | 'right' = all.some((s) => s.axis === 'left') || !usesRight ? 'left' : 'right';
  if (!ctx.sparkline) {
    for (const axis of ['left', 'right'] as const) {
      if (axis === 'left' ? !usesLeft : !usesRight) continue;
      const scale = scales[axis];
      const grid = axisOf(axis)?.grid ?? axis === primary;
      for (const tick of scale.ticks) {
        const y = yPos(axis, tick);
        if (grid) shapes.push({ k: 'line', cls: tick === 0 ? 'cb-chart__grid cb-chart__grid--zero' : 'cb-chart__grid', x1: plot.left, y1: y, x2: plot.right, y2: y });
        shapes.push(
          axis === 'left'
            ? { k: 'text', cls: 'cb-chart__axis', x: plot.left - 8, y, text: scale.format(tick), anchor: 'end', baseline: 'central' }
            : { k: 'text', cls: 'cb-chart__axis', x: plot.right + 8, y, text: scale.format(tick), anchor: 'start', baseline: 'central' },
        );
      }
      const label = axisOf(axis)?.label;
      if (label) {
        shapes.push(
          axis === 'left'
            ? { k: 'text', cls: 'cb-chart__axis cb-chart__axis-title', x: 8, y: plot.top - 14, text: label, anchor: 'start' }
            : { k: 'text', cls: 'cb-chart__axis cb-chart__axis-title', x: ctx.width - 8, y: plot.top - 14, text: label, anchor: 'end' },
        );
      }
    }
    shapes.push({ k: 'line', cls: 'cb-chart__baseline', x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom });
    if (xType === 'category') {
      const shown = categories.map((text, i) => ({ text, k: i + 0.5 })).filter((c) => inView(c.k));
      const longest = Math.max(1, ...shown.map((c) => c.text.length));
      const every = Math.max(1, Math.ceil((shown.length * (longest * 6.4 + 12)) / plot.width));
      shown.forEach((c, i) => {
        if (i % every) return;
        shapes.push({ k: 'text', cls: 'cb-chart__axis', x: xPos(c.k), y: plot.bottom + 18, text: c.text, anchor: 'middle' });
      });
    } else {
      for (const tick of xTicks) {
        const x = xPos(tick);
        if (axisOf('bottom')?.grid) shapes.push({ k: 'line', cls: 'cb-chart__grid', x1: x, y1: plot.top, x2: x, y2: plot.bottom });
        shapes.push({ k: 'line', cls: 'cb-chart__tick', x1: x, y1: plot.bottom, x2: x, y2: plot.bottom + 4 });
        shapes.push({ k: 'text', cls: 'cb-chart__axis', x, y: plot.bottom + 18, text: xFormatShort(tick), anchor: 'middle' });
      }
    }
    if (xAxis?.label) {
      shapes.push({ k: 'text', cls: 'cb-chart__axis cb-chart__axis-title', x: round(plot.left + plot.width / 2), y: plot.bottom + 38, text: xAxis.label, anchor: 'middle' });
    }
  }

  // --- Referencias: franjas detrás de los datos, líneas delante ---------------------------
  const data: ChartShape[] = [];
  const front: ChartShape[] = [];
  const refPos = (axis: 'left' | 'right' | 'x', v: unknown): number | null => {
    if (axis === 'x') {
      const k = toX(v, false);
      return k === null ? null : xPos(k);
    }
    const n = num(v);
    return n === null ? null : yPos(axis, n);
  };
  for (const r of spec.refs) {
    if (r.kind === 'band') {
      const a = refPos(r.axis, r.from);
      const b = refPos(r.axis, r.to);
      if (a === null || b === null) continue;
      const fill = r.color ?? 'var(--cb-color-primary-500)';
      if (r.axis === 'x') {
        data.push({ k: 'rect', cls: 'cb-chart__ref-band', x: Math.min(a, b), y: plot.top, w: Math.abs(b - a), h: plot.height, fill });
        if (r.label) front.push({ k: 'text', cls: 'cb-chart__ref-label', x: Math.min(a, b) + 4, y: plot.top + 12, text: r.label, anchor: 'start', fill: r.color });
      } else {
        data.push({ k: 'rect', cls: 'cb-chart__ref-band', x: plot.left, y: Math.min(a, b), w: plot.width, h: Math.abs(b - a), fill });
        if (r.label) front.push({ k: 'text', cls: 'cb-chart__ref-label', x: plot.right - 4, y: Math.min(a, b) + 12, text: r.label, anchor: 'end', fill: r.color });
      }
    }
  }

  // --- Series -----------------------------------------------------------------------------
  const barLike = visible.filter((s) => s.kind === 'bar');
  const slots = [...new Set(barLike.map((s) => (s.stack ? `${s.axis}:${s.stack}` : `#${s.index}`)))];
  const bandPx = (minGap / (d1 - d0 || 1)) * plot.width;
  const groupW = Math.min(bandPx * 0.75, 40 * Math.max(1, slots.length));
  const slotW = groupW / Math.max(1, slots.length);
  const pointTop = new Map<number, number>();
  const noteTop = (k: number, y: number) => pointTop.set(k, Math.min(pointTop.get(k) ?? plot.bottom, y));

  for (const s of visible) {
    const pts = points.get(s)!;
    // Un punto fuera de la ventana a cada lado, para que las líneas lleguen al borde.
    const first = Math.max(0, pts.findIndex((p) => p.key >= d0) - 1);
    let last = pts.length - 1;
    for (let i = pts.length - 1; i >= 0; i--) if (pts[i].key <= d1) { last = Math.min(pts.length - 1, i + 1); break; }
    const win = pts.slice(first, last + 1);
    const axis = s.axis;

    if (s.kind === 'bar') {
      const slot = slots.indexOf(s.stack ? `${s.axis}:${s.stack}` : `#${s.index}`);
      for (const p of win) {
        if (p.y === null) continue;
        const a = yPos(axis, p.base);
        const b = yPos(axis, p.top);
        const x = round(xPos(p.key) - groupW / 2 + slot * slotW + 1);
        const item = keys.indexOf(p.key);
        data.push({ k: 'rect', cls: 'cb-chart__bar', item, x, y: Math.min(a, b), w: round(Math.max(1, slotW - 2)), h: round(Math.max(1, Math.abs(b - a))), rx: slotW > 8 ? 2 : 0, fill: s.color });
        noteTop(p.key, Math.min(a, b));
      }
    } else if (s.kind === 'area' || s.kind === 'line') {
      const valid = win.filter((p) => p.y !== null);
      const top = valid.map((p) => ({ x: xPos(p.key), y: yPos(axis, p.top) }));
      if (s.kind === 'area' && top.length) {
        const floor = valid.map((p) => ({ x: xPos(p.key), y: yPos(axis, p.base) })).reverse();
        data.push({ k: 'path', cls: 'cb-chart__area', d: `${curvePath(top, s.curve)} L ${floor.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`, fill: s.color });
      }
      front.push({ k: 'path', cls: s.dashed ? 'cb-chart__line cb-chart__line--dashed' : 'cb-chart__line', d: curvePath(top, s.curve), stroke: s.color, pathLength: s.dashed ? undefined : 1 });
      valid.forEach((p, i) => {
        noteTop(p.key, top[i].y);
        if (s.kind === 'line' && !s.points && !ctx.sparkline) return;
        front.push({ k: 'circle', cls: 'cb-chart__point', item: keys.indexOf(p.key), cx: top[i].x, cy: top[i].y, r: ctx.sparkline || !s.points ? 0 : 3, rActive: 5, fill: s.color });
      });
    } else if (s.kind === 'rangeArea') {
      const valid = win.filter((p) => p.low !== null && p.high !== null);
      const hi = valid.map((p) => ({ x: xPos(p.key), y: yPos(axis, p.high!) }));
      const lo = valid.map((p) => ({ x: xPos(p.key), y: yPos(axis, p.low!) }));
      if (hi.length) {
        const back = curvePath([...lo].reverse(), s.curve).replace(/^M/, 'L');
        data.push({ k: 'path', cls: 'cb-chart__area cb-chart__area--range', d: `${curvePath(hi, s.curve)} ${back} Z`, fill: s.color });
        front.push({ k: 'path', cls: 'cb-chart__line cb-chart__line--thin', d: curvePath(hi, s.curve), stroke: s.color });
        front.push({ k: 'path', cls: 'cb-chart__line cb-chart__line--thin', d: curvePath(lo, s.curve), stroke: s.color });
        hi.forEach((p, i) => noteTop(valid[i].key, p.y));
      }
    } else if (s.kind === 'scatter') {
      for (const p of win) {
        if (p.y === null) continue;
        const cx = xPos(p.key);
        const cy = yPos(axis, p.y);
        noteTop(p.key, cy);
        front.push({ k: 'circle', cls: 'cb-chart__point cb-chart__point--scatter', item: -1, cx, cy, r: s.size, rActive: s.size + 2, fill: s.color });
      }
    } else {
      const w = Math.max(1, Math.min(bandPx * 0.65, 18));
      for (const p of win) {
        if (p.open === null || p.close === null || p.high === null || p.low === null) continue;
        const up = p.close >= p.open;
        const color = up ? s.upColor : s.downColor;
        const x = xPos(p.key);
        const item = keys.indexOf(p.key);
        const yo = yPos(axis, p.open);
        const yc = yPos(axis, p.close);
        data.push({ k: 'line', cls: 'cb-chart__wick', x1: x, y1: yPos(axis, p.high), x2: x, y2: yPos(axis, p.low), stroke: color });
        if (s.variant === 'ohlc') {
          data.push({ k: 'line', cls: 'cb-chart__wick', x1: round(x - w / 2), y1: yo, x2: x, y2: yo, stroke: color });
          data.push({ k: 'line', cls: 'cb-chart__wick', x1: x, y1: yc, x2: round(x + w / 2), y2: yc, stroke: color });
        } else {
          data.push({ k: 'rect', cls: 'cb-chart__candle', item, x: round(x - w / 2), y: Math.min(yo, yc), w: round(w), h: round(Math.max(1, Math.abs(yc - yo))), fill: color });
        }
        noteTop(p.key, yPos(axis, p.high));
      }
    }
  }

  for (const r of spec.refs) {
    if (r.kind !== 'line') continue;
    const pos = refPos(r.axis, r.value);
    if (pos === null) continue;
    const stroke = r.color;
    if (r.axis === 'x') {
      front.push({ k: 'line', cls: 'cb-chart__ref-line', x1: pos, y1: plot.top, x2: pos, y2: plot.bottom, stroke });
      if (r.label) front.push({ k: 'text', cls: 'cb-chart__ref-label', x: pos + 4, y: plot.top + 12, text: r.label, anchor: 'start', fill: r.color });
    } else {
      front.push({ k: 'line', cls: 'cb-chart__ref-line', x1: plot.left, y1: pos, x2: plot.right, y2: pos, stroke });
      if (r.label) front.push({ k: 'text', cls: 'cb-chart__ref-label', x: plot.left + 4, y: pos - 5, text: r.label, anchor: 'start', fill: r.color });
    }
  }

  // --- Elementos navegables ------------------------------------------------------------
  const t = ctx.text;
  const rowsAt = (k: number): ChartTooltipRow[] => {
    const rows: ChartTooltipRow[] = [];
    for (const s of visible) {
      const p = points.get(s)!.find((q) => q.key === k);
      if (!p) continue;
      const fmt = scales[s.axis].format;
      if (s.kind === 'candlestick') {
        if (p.open === null || p.close === null || p.high === null || p.low === null) continue;
        const color = p.close >= p.open ? s.upColor : s.downColor;
        rows.push(
          { label: `${s.name} · ${t.open}`, value: fmt(p.open), color },
          { label: t.high, value: fmt(p.high), color },
          { label: t.low, value: fmt(p.low), color },
          { label: t.close, value: fmt(p.close), color },
        );
      } else if (s.kind === 'rangeArea') {
        if (p.low !== null && p.high !== null) rows.push({ label: s.name, value: `${fmt(p.low)} – ${fmt(p.high)}`, color: s.color });
      } else if (p.y !== null) {
        rows.push({ label: s.name, value: fmt(p.y), color: s.color });
      }
    }
    return rows;
  };

  const scatterOnly = visible.length > 0 && visible.every((s) => s.kind === 'scatter');
  const items: ChartItem[] = [];
  const hits: ChartHit[] = [];
  if (scatterOnly) {
    // Cada punto es un elemento.
    for (const s of visible) {
      for (const p of points.get(s)!) {
        if (p.y === null || !inView(p.key)) continue;
        const item = items.length;
        const x = xPos(p.key);
        const y = yPos(s.axis, p.y);
        const label = `${s.name} · ${xFormatLong(p.key)}`;
        items.push({
          index: item,
          label,
          title: s.name,
          rows: [
            { label: xAxis?.label ?? 'X', value: xFormatLong(p.key), color: s.color },
            { label: axisOf(s.axis)?.label ?? 'Y', value: scales[s.axis].format(p.y), color: s.color },
          ],
          x,
          y,
        });
        hits.push({ k: 'rect', item, x: x - s.size - 3, y: y - s.size - 3, w: 2 * s.size + 6, h: 2 * s.size + 6 });
      }
    }
    // Los puntos se resaltan por su posición en `items`.
    let n = 0;
    for (const shape of front) if (shape.k === 'circle' && shape.item === -1) shape.item = n++;
  } else {
    const shown = keys.filter(inView);
    shown.forEach((k, i) => {
      const x = xPos(k);
      const prev = i ? (xPos(shown[i - 1]) + x) / 2 : plot.left;
      const next = i < shown.length - 1 ? (xPos(shown[i + 1]) + x) / 2 : plot.right;
      const position = items.length;
      const title = xFormatLong(k);
      items.push({ index: keys.indexOf(k), label: title, title, rows: rowsAt(k), x, y: pointTop.get(k) ?? plot.top, cursor: { x, y1: plot.top, y2: plot.bottom } });
      hits.push({ k: 'rect', item: position, x: round(Math.max(plot.left, prev)), y: plot.top, w: round(Math.max(1, Math.min(plot.right, next) - Math.max(plot.left, prev))), h: plot.height });
    });
    // Barras, velas y puntos se resaltan por la posición de su clave en `items`.
    const position = new Map(shown.map((k, i) => [keys.indexOf(k), i]));
    for (const shape of [...data, ...front]) {
      if (shape.item !== undefined && shape.item >= 0) shape.item = position.get(shape.item);
    }
  }

  return {
    shapes,
    data,
    front,
    hits,
    items,
    legend: legendOf(all),
    table: {
      head: all.map((s) => s.name),
      rows: keys.map((k) => ({
        label: xFormatLong(k),
        cells: all.map((s) => {
          const p = points.get(s)!.find((q) => q.key === k);
          const fmt = scales[s.axis].format;
          if (!p) return '';
          if (s.kind === 'candlestick') {
            return [p.open, p.high, p.low, p.close].some((v) => v === null)
              ? ''
              : `${t.open} ${fmt(p.open!)}, ${t.high} ${fmt(p.high!)}, ${t.low} ${fmt(p.low!)}, ${t.close} ${fmt(p.close!)}`;
          }
          if (s.kind === 'rangeArea') return p.low === null || p.high === null ? '' : `${fmt(p.low)} – ${fmt(p.high)}`;
          return p.y === null ? '' : fmt(p.y);
        }),
      })),
    },
    clip: { x: plot.left, y: plot.top - 6, w: plot.width, h: plot.height + 12 },
    zoomed: spec.view[0] > 0 || spec.view[1] < 1,
    domainSize: xType === 'category' ? 1 / Math.max(1, categories.length) : minGap / (span || 1),
  };
}

function legendOf(series: readonly SeriesSpec[]) {
  return series.map((s) => ({ index: s.index, label: s.name, color: s.kind === 'candlestick' ? s.upColor : s.color }));
}
