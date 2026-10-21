import { round } from './chart-geometry';

/** Escala numérica legible. Con `includeZero` en false se ajusta al rango (útil para precios). */
export function linearTicks(min: number, max: number, count = 4, includeZero = true): { min: number; max: number; ticks: number[] } {
  let lo = includeZero ? Math.min(0, min) : min;
  let hi = includeZero ? Math.max(0, max) : max;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { min: 0, max: 1, ticks: [0, 1] };
  if (lo === hi) {
    const pad = Math.abs(lo) * 0.1 || 1;
    lo -= includeZero && lo >= 0 ? 0 : pad;
    hi += pad;
  }
  const rough = (hi - lo) / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = residual > 5 ? 10 : residual > 2.5 ? 5 : residual > 2 ? 2.5 : residual > 1 ? 2 : 1;
  const step = nice * magnitude;
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(round(v));
  return { min: round(lo), max: round(hi), ticks };
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Intervalos "redondos" para un eje de tiempo, del más fino al más grueso. */
const INTERVALS: { ms: number; unit: TimeUnit }[] = [
  { ms: SECOND, unit: 'second' },
  { ms: 5 * SECOND, unit: 'second' },
  { ms: 15 * SECOND, unit: 'second' },
  { ms: 30 * SECOND, unit: 'second' },
  { ms: MINUTE, unit: 'minute' },
  { ms: 5 * MINUTE, unit: 'minute' },
  { ms: 15 * MINUTE, unit: 'minute' },
  { ms: 30 * MINUTE, unit: 'minute' },
  { ms: HOUR, unit: 'hour' },
  { ms: 3 * HOUR, unit: 'hour' },
  { ms: 6 * HOUR, unit: 'hour' },
  { ms: 12 * HOUR, unit: 'hour' },
  { ms: DAY, unit: 'day' },
  { ms: 2 * DAY, unit: 'day' },
  { ms: 7 * DAY, unit: 'week' },
  { ms: 30 * DAY, unit: 'month' },
  { ms: 91 * DAY, unit: 'month' },
  { ms: 365 * DAY, unit: 'year' },
];

export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/** Marcas de un eje de tiempo con unas `count` divisiones y la unidad para formatearlas. */
export function timeTicks(min: number, max: number, count = 6): { ticks: number[]; unit: TimeUnit } {
  const span = Math.max(1, max - min);
  const target = span / Math.max(1, count);
  const interval = INTERVALS.find((i) => i.ms >= target) ?? INTERVALS[INTERVALS.length - 1];
  const ticks: number[] = [];
  if (interval.unit === 'month' || interval.unit === 'year') {
    const months = interval.unit === 'year' ? 12 * Math.max(1, Math.round(target / (365 * DAY))) : Math.max(1, Math.round(interval.ms / (30 * DAY)));
    const d = new Date(min);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    if (interval.unit === 'year') d.setMonth(0);
    while (d.getTime() < min) d.setMonth(d.getMonth() + months);
    while (d.getTime() <= max && ticks.length < 200) {
      ticks.push(d.getTime());
      d.setMonth(d.getMonth() + months);
    }
  } else {
    // Alineado al intervalo en hora local (días a medianoche, horas en punto).
    const offset = new Date(min).getTimezoneOffset() * MINUTE;
    const start = Math.ceil((min - offset) / interval.ms) * interval.ms + offset;
    for (let t = start; t <= max && ticks.length < 200; t += interval.ms) ticks.push(t);
  }
  return { ticks, unit: interval.unit };
}

/** Formato de una marca de tiempo según la unidad del eje. */
export function timeFormat(locale: string | undefined, unit: TimeUnit): (t: number) => string {
  const options: Intl.DateTimeFormatOptions =
    unit === 'second'
      ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      : unit === 'minute' || unit === 'hour'
        ? { hour: '2-digit', minute: '2-digit' }
        : unit === 'day' || unit === 'week'
          ? { day: 'numeric', month: 'short' }
          : unit === 'month'
            ? { month: 'short', year: '2-digit' }
            : { year: 'numeric' };
  const format = new Intl.DateTimeFormat(locale, options).format;
  return (t) => format(t);
}

/** Formato largo (tooltip y tabla) de un instante. */
export function timeFormatLong(locale: string | undefined, unit: TimeUnit): (t: number) => string {
  const options: Intl.DateTimeFormatOptions =
    unit === 'second' || unit === 'minute' || unit === 'hour'
      ? { dateStyle: 'medium', timeStyle: unit === 'second' ? 'medium' : 'short' }
      : { dateStyle: 'medium' };
  const format = new Intl.DateTimeFormat(locale, options).format;
  return (t) => format(t);
}
