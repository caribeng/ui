/** Escala de un eje con valores "redondos" (0, 25, 50…). */
export interface CbChartScale {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

/**
 * Calcula una escala legible que contiene `[min, max]`, con unas `count`
 * divisiones de tamaño 1, 2, 2.5 o 5 × 10ⁿ. Siempre incluye el 0.
 */
export function niceScale(min: number, max: number, count = 4): CbChartScale {
  let lo = Math.min(0, min);
  let hi = Math.max(0, max);
  if (lo === hi) hi = lo + 1;
  const rough = (hi - lo) / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = residual > 5 ? 10 : residual > 2.5 ? 5 : residual > 2 ? 2.5 : residual > 1 ? 2 : 1;
  const step = nice * magnitude;
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(round(v));
  return { min: round(lo), max: round(hi), step, ticks };
}

/** Elimina el ruido de coma flotante (0.30000000000000004 → 0.3). */
export function round(value: number): number {
  return Math.round(value * 1e9) / 1e9;
}

/** Punto de una circunferencia; el ángulo 0 está arriba y crece en sentido horario. */
function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [round(cx + r * Math.cos(rad)), round(cy + r * Math.sin(rad))];
}

/**
 * Trazado SVG de un sector (torta, `inner = 0`) o de un anillo (dona) entre dos
 * ángulos en grados. Un sector completo (360°) se dibuja como dos mitades.
 */
export function arcPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number): string {
  const sweep = Math.min(359.999, end - start);
  if (sweep <= 0) return '';
  const stop = start + sweep;
  const large = sweep > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, outer, start);
  const [x2, y2] = polar(cx, cy, outer, stop);
  if (inner <= 0) {
    return `M ${cx} ${cy} L ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} Z`;
  }
  const [x3, y3] = polar(cx, cy, inner, stop);
  const [x4, y4] = polar(cx, cy, inner, start);
  return `M ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
}
