// Tipos públicos del gráfico y modelo interno de la escena que dibuja cada renderer.

export type CbChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'horizontalBar'
  | 'waterfall'
  | 'doughnut'
  | 'pie'
  | 'radialBar'
  | 'gauge'
  | 'radar'
  | 'polarArea'
  | 'heatmap'
  | 'treemap';

export interface CbChartDataset {
  label: string;
  data: number[];
  /** Color de la serie (barras, líneas, áreas, radar, medidor). */
  color?: string;
  /** Colores por elemento (torta, dona, radial, área polar, treemap y cascada). */
  colors?: string[];
  /** En un gráfico `bar`, `'line'` dibuja esta serie como línea (gráfico combinado). */
  type?: 'bar' | 'line';
  /**
   * En `waterfall`: posiciones que son subtotales o totales. Su barra va del 0 al
   * acumulado y su valor en `data` se ignora.
   */
  sums?: number[];
}

export interface CbChartData {
  /** Categorías (eje X), ejes del radar o columnas del mapa de calor. */
  labels: string[];
  /** Series; en `heatmap`, cada dataset es una fila. */
  datasets: CbChartDataset[];
}

/** Formato de los valores: opciones de `Intl.NumberFormat` o una función propia. */
export type CbChartValueFormat = Intl.NumberFormatOptions | ((value: number) => string);

/** Elemento elegido con clic o Enter. */
export interface CbChartItemEvent {
  index: number;
  label: string;
}

/** Franja de color del medidor (`gauge`), p. ej. rojo de 0 a 40. */
export interface CbChartBand {
  from: number;
  to: number;
  color: string;
}

// --- Modelo interno -----------------------------------------------------------------

export const PALETTE = [
  'var(--cb-color-primary-500)',
  'var(--cb-color-warning-500)',
  'var(--cb-color-success-500)',
  'var(--cb-color-danger-500)',
  'var(--cb-color-info-500)',
  'var(--cb-color-help-500)',
];

export const paletteColor = (i: number): string => PALETTE[i % PALETTE.length];

/** Ancho lógico del lienzo; el SVG escala al ancho del contenedor. */
export const W = 520;

/** Lo que un renderer necesita saber para dibujar. */
export interface ChartContext {
  type: CbChartType;
  data: CbChartData;
  width: number;
  height: number;
  sparkline: boolean;
  stacked: boolean;
  /** Series (o elementos, según la leyenda) ocultos. */
  hidden: ReadonlySet<number>;
  min: number;
  max: number;
  bands: readonly CbChartBand[];
  format: (value: number) => string;
  percent: (value: number) => string;
  text: { total: string; change: string; open: string; high: string; low: string; close: string };
  locale?: string;
  /** Modo composable: series, ejes y referencias declarados como hijos. */
  composed?: ComposedSpec;
}

// --- Modo composable ------------------------------------------------------------------

export interface SeriesSpec {
  kind: 'bar' | 'line' | 'area' | 'scatter' | 'rangeArea' | 'candlestick';
  /** Posición entre las series (leyenda y ocultar). */
  index: number;
  name: string;
  color: string;
  axis: 'left' | 'right';
  records: readonly Readonly<Record<string, unknown>>[];
  x: string;
  y: string;
  low: string;
  high: string;
  open: string;
  close: string;
  curve: 'linear' | 'smooth' | 'step';
  dashed: boolean;
  points: boolean;
  stack?: string;
  size: number;
  variant: 'candle' | 'ohlc';
  upColor: string;
  downColor: string;
}

export interface AxisSpec {
  position: 'bottom' | 'left' | 'right';
  type: 'auto' | 'category' | 'linear' | 'time';
  min?: number;
  max?: number;
  label?: string;
  format?: (value: number) => string;
  grid?: boolean;
}

export interface RefSpec {
  /** `note`: anotación en un punto (`value` en X, `y` en el eje). */
  kind: 'line' | 'band' | 'note';
  y?: number;
  axis: 'left' | 'right' | 'x';
  value?: unknown;
  from?: unknown;
  to?: unknown;
  label?: string;
  color?: string;
}

export interface ComposedSpec {
  series: SeriesSpec[];
  axes: AxisSpec[];
  refs: RefSpec[];
  /** Ventana visible del eje X en unidades del eje; `null` = todo (o `xWindow`). */
  window: CbChartWindow | null;
  /** Ventana inicial: los últimos `xWindow` del eje X (ms en un eje de tiempo, categorías…). */
  xWindow?: number;
}

/**
 * Ventana visible del eje X en sus unidades (ms en un eje de tiempo, número en uno
 * lineal, posición en uno de categorías). `pinned`: pegada al final, avanza con los
 * datos nuevos.
 */
export interface CbChartWindow {
  start: number;
  end: number;
  pinned: boolean;
}

interface ShapeBase {
  cls: string;
  /** Posición del elemento navegable al que pertenece (para atenuar / resaltar). */
  item?: number;
}
export type ChartShape =
  | (ShapeBase & { k: 'rect'; x: number; y: number; w: number; h: number; rx?: number; fill?: string })
  | (ShapeBase & { k: 'path'; d: string; fill?: string; stroke?: string; pathLength?: number })
  | (ShapeBase & { k: 'circle'; cx: number; cy: number; r: number; rActive: number; fill?: string })
  | (ShapeBase & { k: 'line'; x1: number; y1: number; x2: number; y2: number; stroke?: string })
  | (ShapeBase & {
      k: 'text';
      x: number;
      y: number;
      text: string;
      anchor?: 'start' | 'middle' | 'end';
      baseline?: 'central' | 'auto' | 'hanging';
      fill?: string;
    });

/** Zona invisible que recibe el ratón y el clic de un elemento. */
export type ChartHit =
  | { k: 'rect'; item: number; x: number; y: number; w: number; h: number }
  | { k: 'path'; item: number; d: string };

export interface ChartTooltipRow {
  label: string;
  value: string;
  color: string;
}

/** Elemento que se recorre con el teclado y muestra tooltip (categoría, sector, celda…). */
export interface ChartItem {
  /** Índice que se emite en `itemSelect`. */
  index: number;
  label: string;
  title: string;
  rows: ChartTooltipRow[];
  /** Punto de anclaje del tooltip (unidades del SVG). */
  x: number;
  y: number;
  /** Línea guía vertical al activarlo (cartesianos). */
  cursor?: { x: number; y1: number; y2: number };
  /** Valor de X (modo composable): sincroniza el cursor entre gráficas de un grupo. */
  key?: number;
}

export interface ChartLegendEntry {
  index: number;
  label: string;
  color: string;
}

export interface ChartScene {
  shapes: ChartShape[];
  /** Datos detrás de la guía del elemento activo (barras, áreas, velas). Se recortan a `clip`. */
  data?: ChartShape[];
  /** Formas que van encima de la guía del elemento activo (líneas y puntos). Se recortan a `clip`. */
  front?: ChartShape[];
  /** Área de dibujo: recorta los datos (zoom) y sirve para convertir el ratón en posición. */
  clip?: { x: number; y: number; w: number; h: number };
  /** Hay más datos fuera de la ventana visible (zoom activo). */
  zoomed?: boolean;
  /** Dominio completo del eje X y la parte visible (modo composable). */
  domain?: readonly [number, number];
  window?: readonly [number, number];
  /** Distancia mínima entre dos valores de X: limita el zoom a unos pocos datos. */
  step?: number;
  hits: ChartHit[];
  items: ChartItem[];
  /** Columnas de una cuadrícula navegable (mapa de calor): flechas arriba / abajo saltan filas. */
  columns?: number;
  legend: ChartLegendEntry[];
  table: { head: string[] | null; rows: { label: string; cells: string[] }[] };
  center?: { x: number; y: number; text: string; sub?: string };
}

export const emptyScene = (): ChartScene => ({ shapes: [], hits: [], items: [], legend: [], table: { head: null, rows: [] } });
