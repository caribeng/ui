import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { arcPath, niceScale, round } from './chart-geometry';

export type CbChartType = 'bar' | 'line' | 'area' | 'horizontalBar' | 'doughnut' | 'pie' | 'radialBar';

export interface CbChartDataset {
  label: string;
  data: number[];
  /** Color de la serie (barras, líneas, áreas). */
  color?: string;
  /** Colores por elemento (torta, dona y radial). */
  colors?: string[];
  /** En un gráfico `bar`, `'line'` dibuja esta serie como línea (gráfico combinado). */
  type?: 'bar' | 'line';
}

export interface CbChartData {
  labels: string[];
  datasets: CbChartDataset[];
}

/** Formato de los valores: opciones de `Intl.NumberFormat` o una función propia. */
export type CbChartValueFormat = Intl.NumberFormatOptions | ((value: number) => string);

/** Elemento elegido con clic o Enter. `datasetIndex` solo en barras y puntos concretos. */
export interface CbChartItemEvent {
  index: number;
  label: string;
}

const PALETTE = [
  'var(--cb-color-primary-500)',
  'var(--cb-color-warning-500)',
  'var(--cb-color-success-500)',
  'var(--cb-color-danger-500)',
  'var(--cb-color-info-500)',
  'var(--cb-color-help-500)',
];

/** Ancho lógico del lienzo; el SVG escala al ancho del contenedor. */
const W = 520;

let nextId = 0;

interface Series {
  index: number;
  label: string;
  data: number[];
  color: string;
  asLine: boolean;
}

interface Bar {
  key: string;
  category: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

interface Slice {
  index: number;
  label: string;
  value: number;
  percent: number;
  color: string;
  path: string;
  track?: string;
  tipX: number;
  tipY: number;
}

interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

/**
 * Chart de CaribeNG: gráficos SVG accesibles y sin dependencias.
 *
 * - Tipos: `bar`, `horizontalBar`, `line`, `area`, `pie`, `doughnut` y `radialBar`.
 * - `stacked` apila barras y áreas; en `bar`, una serie con `type: 'line'` se dibuja como línea.
 * - `sparkline` quita ejes, rejilla y leyenda (minigráfico para tarjetas o tablas).
 * - Eje de valores con escala legible y valores negativos; `valueFormat` y `locale` formatean.
 * - Tooltip con ratón y teclado (flechas), leyenda que oculta series y una tabla de
 *   datos para lectores de pantalla.
 *
 * @example
 * ```html
 * <cb-chart type="bar" [data]="ventas" [valueFormat]="{ style: 'currency', currency: 'COP' }" />
 * <cb-chart type="area" stacked [data]="trafico" />
 * <cb-chart type="line" sparkline [height]="48" [data]="tendencia" />
 * ```
 */
@Component({
  selector: 'cb-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-chart',
    '[class.cb-chart--sparkline]': 'sparkline()',
    '[class.cb-chart--animate]': 'animate()',
  },
  template: `
    <div
      class="cb-chart__plot"
      tabindex="0"
      role="group"
      [attr.aria-label]="name()"
      [attr.aria-describedby]="instructionsId"
      (keydown)="onKeydown($event)"
      (focus)="onFocus()"
      (blur)="active.set(null)"
    >
      <svg class="cb-chart__svg" [attr.viewBox]="'0 0 ' + width + ' ' + height()" aria-hidden="true" (mouseleave)="active.set(null)">
        @if (isEmpty()) {
          <text class="cb-chart__empty" [attr.x]="width / 2" [attr.y]="height() / 2" text-anchor="middle">{{ t().noData }}</text>
        } @else if (isCircular()) {
          @if (type() === 'radialBar') {
            @for (slice of slices(); track slice.index) {
              <path class="cb-chart__track" [attr.d]="slice.track" />
            }
          }
          @for (slice of slices(); track slice.index; let i = $index) {
            <path
              class="cb-chart__slice"
              [class.cb-is-dim]="active() !== null && active() !== i"
              [attr.d]="slice.path"
              [attr.fill]="slice.color"
              (mouseenter)="active.set(i)"
              (click)="select(i)"
            />
          }
          @if (centerText(); as text) {
            <text class="cb-chart__center" [attr.x]="width / 2" [attr.y]="height() / 2" text-anchor="middle" dominant-baseline="central">
              {{ text }}
            </text>
          }
        } @else {
          @if (!sparkline()) {
            @for (tick of valueTicks(); track tick.value) {
              @if (horizontal()) {
                <line class="cb-chart__grid" [class.cb-chart__grid--zero]="tick.value === 0" [attr.x1]="tick.pos" [attr.y1]="plot().top" [attr.x2]="tick.pos" [attr.y2]="plot().bottom" />
                <text class="cb-chart__axis" [attr.x]="tick.pos" [attr.y]="height() - 8" text-anchor="middle">{{ tick.text }}</text>
              } @else {
                <line class="cb-chart__grid" [class.cb-chart__grid--zero]="tick.value === 0" [attr.x1]="plot().left" [attr.y1]="tick.pos" [attr.x2]="plot().right" [attr.y2]="tick.pos" />
                <text class="cb-chart__axis" [attr.x]="plot().left - 8" [attr.y]="tick.pos" text-anchor="end" dominant-baseline="central">{{ tick.text }}</text>
              }
            }
            @for (label of categoryLabels(); track label.index) {
              @if (horizontal()) {
                <text class="cb-chart__axis" [attr.x]="plot().left - 8" [attr.y]="label.pos" text-anchor="end" dominant-baseline="central">{{ label.text }}</text>
              } @else {
                <text class="cb-chart__axis" [attr.x]="label.pos" [attr.y]="height() - 8" text-anchor="middle">{{ label.text }}</text>
              }
            }
          }

          @for (area of areas(); track area.index) {
            <path class="cb-chart__area" [attr.d]="area.path" [attr.fill]="area.color" />
          }
          @for (bar of bars(); track bar.key) {
            <rect
              class="cb-chart__bar"
              [class.cb-chart__bar--horizontal]="horizontal()"
              [class.cb-is-dim]="active() !== null && active() !== bar.category"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.w"
              [attr.height]="bar.h"
              [attr.rx]="sparkline() ? 1 : 3"
              [attr.fill]="bar.color"
            />
          }
          @if (active() !== null && !horizontal()) {
            <line class="cb-chart__cursor" [attr.x1]="bandCenter(active()!)" [attr.y1]="plot().top" [attr.x2]="bandCenter(active()!)" [attr.y2]="plot().bottom" />
          }
          @for (line of lines(); track line.index) {
            <path class="cb-chart__line" [attr.d]="line.path" [attr.stroke]="line.color" pathLength="1" />
            @if (!sparkline() || active() !== null) {
              @for (pt of line.points; track $index) {
                <circle
                  class="cb-chart__point"
                  [class.cb-is-active]="active() === $index"
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  [attr.r]="active() === $index ? 5 : sparkline() ? 0 : 3"
                  [attr.fill]="line.color"
                />
              }
            }
          }
          <!-- Franjas invisibles por categoría: reciben el ratón y el clic. -->
          @for (band of bands(); track band.index) {
            <rect
              class="cb-chart__hit"
              [attr.x]="band.x"
              [attr.y]="band.y"
              [attr.width]="band.w"
              [attr.height]="band.h"
              (mouseenter)="active.set(band.index)"
              (click)="select(band.index)"
            />
          }
        }
      </svg>

      @if (tooltip(); as tip) {
        <div class="cb-chart__tooltip" aria-hidden="true" [style.left.%]="tip.left" [style.top.%]="tip.top">
          <strong class="cb-chart__tooltip-title">{{ tip.title }}</strong>
          @for (row of tip.rows; track $index) {
            <span class="cb-chart__tooltip-row">
              <span class="cb-chart__swatch" [style.background]="row.color"></span>
              {{ row.label }}
              <strong class="cb-chart__tooltip-value">{{ row.value }}</strong>
            </span>
          }
        </div>
      }
    </div>

    @if (showLegend() && !sparkline() && legendItems().length) {
      <ul class="cb-chart__legend" [attr.aria-label]="t().chartLegend">
        @for (item of legendItems(); track item.index) {
          <li>
            <button
              type="button"
              class="cb-chart__legend-item"
              [class.cb-is-hidden]="hidden().has(item.index)"
              [attr.aria-pressed]="!hidden().has(item.index)"
              (click)="toggle(item.index)"
            >
              <span class="cb-chart__swatch" [style.background]="item.color"></span>
              {{ item.label }}
            </button>
          </li>
        }
      </ul>
    }

    <span class="cb-chart__sr" [id]="instructionsId">{{ t().chartInstructions }}</span>
    <span class="cb-chart__sr" aria-live="polite" aria-atomic="true">{{ announcement() }}</span>
    <!-- Los mismos datos como tabla, para lectores de pantalla. -->
    <table class="cb-chart__sr">
      <caption>{{ name() }}</caption>
      @if (isCircular()) {
        <tbody>
          @for (label of data().labels; track $index; let i = $index) {
            <tr>
              <th scope="row">{{ label }}</th>
              <td>{{ format(valueAt(0, i)) }}</td>
            </tr>
          }
        </tbody>
      } @else {
        <thead>
          <tr>
            <td></td>
            @for (ds of data().datasets; track $index) {
              <th scope="col">{{ ds.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (label of data().labels; track $index; let i = $index) {
            <tr>
              <th scope="row">{{ label }}</th>
              @for (ds of data().datasets; track $index; let d = $index) {
                <td>{{ format(valueAt(d, i)) }}</td>
              }
            </tr>
          }
        </tbody>
      }
    </table>
  `,
  styleUrl: './chart.component.css',
})
export class CbChart {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly width = W;
  protected readonly instructionsId = `cb-chart-${++nextId}-help`;

  readonly type = input<CbChartType>('bar');
  readonly data = input<CbChartData>({ labels: [], datasets: [] });
  /** Alto del lienzo (unidades del SVG; el ancho lógico es 520 y escala al contenedor). */
  readonly height = input<number>(220);
  readonly showLegend = input<boolean>(true);
  readonly ariaLabel = input<string | undefined>(undefined);
  /** Apila las series de barras o áreas. */
  readonly stacked = input(false, { transform: booleanAttribute });
  /** Minigráfico sin ejes, rejilla ni leyenda. */
  readonly sparkline = input(false, { transform: booleanAttribute });
  /** Formato de los valores (ejes, tooltip y tabla). */
  readonly valueFormat = input<CbChartValueFormat | undefined>(undefined);
  /** Locale BCP 47 para el formato (por defecto, el del navegador). */
  readonly locale = input<string | undefined>(undefined);
  /** Valor que representa el 100 % en `radialBar`. */
  readonly max = input<number>(100);
  /** Animación de entrada (se desactiva sola con `prefers-reduced-motion`). */
  readonly animate = input(true, { transform: booleanAttribute });

  /** Clic o Enter sobre una categoría o un segmento. */
  readonly itemSelect = output<CbChartItemEvent>();

  /** Categoría (cartesianos) o segmento visible (circulares) activo. */
  protected readonly active = signal<number | null>(null);
  /** Series (cartesianos) o elementos (circulares) ocultos desde la leyenda. */
  protected readonly hidden = signal<ReadonlySet<number>>(new Set());

  protected readonly isCircular = computed(() => ['pie', 'doughnut', 'radialBar'].includes(this.type()));
  protected readonly horizontal = computed(() => this.type() === 'horizontalBar');
  protected readonly name = computed(() => this.ariaLabel() ?? this.t().chart);
  protected readonly isEmpty = computed(() => !this.data().labels.length || !this.data().datasets.length);

  private readonly numberFormat = computed(() => {
    const vf = this.valueFormat();
    return typeof vf === 'function' ? vf : new Intl.NumberFormat(this.locale(), vf ?? { maximumFractionDigits: 2 }).format;
  });
  private readonly percentFormat = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 }).format,
  );

  // --- Área de dibujo ----------------------------------------------------------------
  protected readonly plot = computed(() => {
    const pad = this.sparkline()
      ? { t: 6, r: 6, b: 6, l: 6 }
      : this.horizontal()
        ? { t: 12, r: 20, b: 28, l: 96 }
        : { t: 16, r: 16, b: 28, l: 60 };
    const h = this.height();
    return { left: pad.l, right: W - pad.r, top: pad.t, bottom: h - pad.b, width: W - pad.l - pad.r, height: h - pad.t - pad.b };
  });

  private readonly series = computed<Series[]>(() =>
    this.data()
      .datasets.map((ds, index) => ({
        index,
        label: ds.label,
        data: ds.data,
        color: ds.color ?? PALETTE[index % PALETTE.length],
        asLine: this.type() === 'line' || this.type() === 'area' || (this.type() === 'bar' && ds.type === 'line'),
      }))
      .filter((s) => !this.hidden().has(s.index)),
  );
  private readonly barSeries = computed(() =>
    this.type() === 'bar' || this.type() === 'horizontalBar' ? this.series().filter((s) => !s.asLine) : [],
  );
  private readonly lineSeries = computed(() => this.series().filter((s) => s.asLine));
  /** Series que se apilan (barras, o áreas en `area`). */
  private readonly stackSeries = computed(() =>
    !this.stacked() ? [] : this.type() === 'area' ? this.lineSeries() : this.barSeries(),
  );

  protected readonly scale = computed(() => {
    const n = this.data().labels.length;
    const values: number[] = [];
    const stacking = new Set(this.stackSeries());
    for (const s of this.series()) if (!stacking.has(s)) values.push(...s.data.slice(0, n));
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
    return niceScale(Math.min(0, ...values), Math.max(0, ...values), this.sparkline() ? 2 : 4);
  });

  /** Posición (y en verticales, x en horizontales) de un valor. */
  protected valuePos(v: number): number {
    const { min, max } = this.scale();
    const p = this.plot();
    const ratio = (v - min) / (max - min || 1);
    return round(this.horizontal() ? p.left + ratio * p.width : p.bottom - ratio * p.height);
  }

  private band(): number {
    const p = this.plot();
    return (this.horizontal() ? p.height : p.width) / Math.max(1, this.data().labels.length);
  }

  protected bandCenter(i: number): number {
    const p = this.plot();
    return round((this.horizontal() ? p.top : p.left) + this.band() * (i + 0.5));
  }

  protected readonly valueTicks = computed(() =>
    this.scale().ticks.map((value) => ({ value, pos: this.valuePos(value), text: this.format(value) })),
  );

  protected readonly categoryLabels = computed(() => {
    const labels = this.data().labels;
    // Con muchas categorías se muestran solo algunas etiquetas para que no se pisen.
    const every = this.horizontal() ? 1 : Math.ceil(labels.length / 10);
    return labels
      .map((text, index) => ({ index, text, pos: this.bandCenter(index) }))
      .filter((l) => l.index % every === 0);
  });

  protected readonly bands = computed(() => {
    const p = this.plot();
    const band = this.band();
    return this.data().labels.map((_, index) =>
      this.horizontal()
        ? { index, x: p.left, y: round(p.top + band * index), w: p.width, h: round(band) }
        : { index, x: round(p.left + band * index), y: p.top, w: round(band), h: p.height },
    );
  });

  protected readonly bars = computed<Bar[]>(() => {
    const series = this.barSeries();
    if (!series.length) return [];
    const band = this.band();
    const stacked = this.stacked();
    const groupSize = stacked ? Math.min(48, band * 0.6) : Math.min(band * 0.75, 36 * series.length);
    const slot = stacked ? groupSize : groupSize / series.length;
    const zero = this.valuePos(0);
    const result: Bar[] = [];
    this.data().labels.forEach((_, i) => {
      const start = this.bandCenter(i) - groupSize / 2;
      let pos = 0;
      let neg = 0;
      series.forEach((s, si) => {
        const v = s.data[i] ?? 0;
        let from = 0;
        if (stacked) {
          from = v >= 0 ? pos : neg;
          if (v >= 0) pos += v;
          else neg += v;
        }
        const a = stacked ? this.valuePos(from) : zero;
        const b = this.valuePos(from + v);
        const offset = round(start + (stacked ? 0 : slot * si) + 1);
        const thickness = round(Math.max(2, slot - 2));
        const lo = Math.min(a, b);
        const length = round(Math.max(1, Math.abs(b - a)));
        result.push(
          this.horizontal()
            ? { key: `${s.index}-${i}`, category: i, x: lo, y: offset, w: length, h: thickness, color: s.color }
            : { key: `${s.index}-${i}`, category: i, x: offset, y: lo, w: thickness, h: length, color: s.color },
        );
      });
    });
    return result;
  });

  /** Puntos de las series de línea / área (acumulados si se apilan). */
  private readonly linePoints = computed(() => {
    const stacking = this.type() === 'area' && this.stacked();
    const totals = this.data().labels.map(() => 0);
    return this.lineSeries().map((s) => {
      const base = [...totals];
      const points = this.data().labels.map((_, i) => {
        const v = (s.data[i] ?? 0) + (stacking ? totals[i] : 0);
        if (stacking) totals[i] = v;
        return { x: this.bandCenter(i), y: this.valuePos(v) };
      });
      const floor = base.map((b, i) => ({ x: this.bandCenter(i), y: this.valuePos(stacking ? b : 0) }));
      return { series: s, points, floor };
    });
  });

  protected readonly lines = computed(() =>
    this.linePoints().map(({ series, points }) => ({
      index: series.index,
      color: series.color,
      points,
      path: points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '),
    })),
  );

  protected readonly areas = computed(() =>
    this.type() !== 'area'
      ? []
      : this.linePoints().map(({ series, points, floor }) => ({
          index: series.index,
          color: series.color,
          path: [
            ...points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`),
            ...[...floor].reverse().map((p) => `L ${p.x} ${p.y}`),
            'Z',
          ].join(' '),
        })),
  );

  // --- Circulares -------------------------------------------------------------------
  protected readonly slices = computed<Slice[]>(() => {
    if (!this.isCircular()) return [];
    const { labels, datasets } = this.data();
    const ds = datasets[0];
    if (!ds) return [];
    const cx = W / 2;
    const cy = this.height() / 2;
    const outer = Math.max(20, Math.min(cy - 10, 110));
    const items = labels
      .map((label, index) => ({
        index,
        label,
        value: Math.max(0, ds.data[index] ?? 0),
        color: ds.colors?.[index] ?? PALETTE[index % PALETTE.length],
      }))
      .filter((item) => !this.hidden().has(item.index));

    if (this.type() === 'radialBar') {
      const gap = 4;
      const thickness = Math.max(6, Math.min(16, (outer * 0.6) / Math.max(1, items.length) - gap));
      const max = this.max() || 1;
      return items.map((item, i) => {
        const r = outer - i * (thickness + gap);
        const percent = Math.min(1, item.value / max);
        const mid = r - thickness / 2;
        const angle = (360 * percent) / 2;
        return {
          ...item,
          percent,
          path: arcPath(cx, cy, r, r - thickness, 0, 360 * percent),
          track: arcPath(cx, cy, r, r - thickness, 0, 360),
          tipX: round(cx + mid * Math.sin((angle * Math.PI) / 180)),
          tipY: round(cy - mid * Math.cos((angle * Math.PI) / 180)),
        };
      });
    }

    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
    const inner = this.type() === 'doughnut' ? outer * 0.6 : 0;
    let angle = 0;
    return items.map((item) => {
      const sweep = (item.value / total) * 360;
      const start = angle;
      angle += sweep;
      const mid = ((start + sweep / 2) * Math.PI) / 180;
      const radius = (outer + inner) / 2 || outer * 0.6;
      return {
        ...item,
        percent: item.value / total,
        path: arcPath(cx, cy, outer, inner, start, start + sweep),
        tipX: round(cx + radius * Math.sin(mid)),
        tipY: round(cy - radius * Math.cos(mid)),
      };
    });
  });

  /** Texto central: total en la dona, porcentaje en un radial de un solo anillo. */
  protected readonly centerText = computed(() => {
    const slices = this.slices();
    if (this.type() === 'doughnut') return this.format(slices.reduce((sum, s) => sum + s.value, 0));
    if (this.type() === 'radialBar' && slices.length === 1) return this.percentFormat()(slices[0].percent);
    return '';
  });

  // --- Leyenda, tooltip y anuncio ---------------------------------------------------------
  protected readonly legendItems = computed(() => {
    const { labels, datasets } = this.data();
    if (this.isCircular()) {
      const colors = datasets[0]?.colors;
      return labels.map((label, index) => ({ index, label, color: colors?.[index] ?? PALETTE[index % PALETTE.length] }));
    }
    return datasets.map((ds, index) => ({ index, label: ds.label, color: ds.color ?? PALETTE[index % PALETTE.length] }));
  });

  private readonly activeDetail = computed<{ title: string; rows: TooltipRow[]; x: number; y: number } | null>(() => {
    const i = this.active();
    if (i === null || this.isEmpty()) return null;
    if (this.isCircular()) {
      const slice = this.slices()[i];
      if (!slice) return null;
      const value = `${this.format(slice.value)} (${this.percentFormat()(slice.percent)})`;
      return { title: slice.label, rows: [{ label: '', value, color: slice.color }], x: slice.tipX, y: slice.tipY };
    }
    const rows = this.series().map((s) => ({ label: s.label, value: this.format(s.data[i] ?? 0), color: s.color }));
    const tops = [
      ...this.bars().filter((b) => b.category === i).map((b) => (this.horizontal() ? b.x + b.w : b.y)),
      ...this.lines().map((l) => (this.horizontal() ? 0 : l.points[i]?.y ?? this.plot().top)),
    ];
    return this.horizontal()
      ? { title: this.data().labels[i], rows, x: Math.max(this.plot().left, ...tops), y: this.bandCenter(i) }
      : { title: this.data().labels[i], rows, x: this.bandCenter(i), y: Math.min(this.plot().bottom, ...tops) };
  });

  protected readonly tooltip = computed(() => {
    const d = this.activeDetail();
    if (!d) return null;
    return { title: d.title, rows: d.rows, left: clamp((d.x / W) * 100, 12, 88), top: (d.y / this.height()) * 100 };
  });

  /** Lo que anuncia el lector de pantalla al recorrer el gráfico con el teclado. */
  protected readonly announcement = computed(() => {
    const d = this.activeDetail();
    if (!d) return '';
    return `${d.title}: ${d.rows.map((r) => (r.label ? `${r.label} ${r.value}` : r.value)).join(', ')}`;
  });

  // --- Interacción --------------------------------------------------------------------
  private count(): number {
    return this.isCircular() ? this.slices().length : this.data().labels.length;
  }

  protected onFocus(): void {
    if (this.active() === null && this.count()) this.active.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.count();
    if (!count) return;
    const cur = this.active() ?? -1;
    let next: number | null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (cur + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = cur <= 0 ? count - 1 : cur - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      case 'Enter':
        if (cur >= 0) this.select(cur);
        return;
      case 'Escape':
        next = null;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.active.set(next);
  }

  protected select(i: number): void {
    const label = this.isCircular() ? this.slices()[i]?.label : this.data().labels[i];
    const index = this.isCircular() ? this.slices()[i]?.index : i;
    if (label !== undefined && index !== undefined) this.itemSelect.emit({ index, label });
  }

  /** Oculta o muestra una serie (o un elemento en los circulares). */
  toggle(index: number): void {
    this.active.set(null);
    this.hidden.update((set) => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  /** Valor de una serie en una categoría (0 si falta). */
  protected valueAt(dataset: number, index: number): number {
    return this.data().datasets.at(dataset)?.data.at(index) ?? 0;
  }

  protected format(value: number): string {
    return this.numberFormat()(value);
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
