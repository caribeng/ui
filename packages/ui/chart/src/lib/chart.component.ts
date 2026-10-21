import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import {
  W,
  emptyScene,
  paletteColor,
  type CbChartBand,
  type CbChartData,
  type CbChartItemEvent,
  type CbChartType,
  type CbChartValueFormat,
  type ChartContext,
  type ChartScene,
  type ChartShape,
  type ComposedSpec,
  type SeriesSpec,
} from './chart-model';
import {
  CbChartAxis,
  CbChartReferenceBand,
  CbChartReferenceLine,
  CbChartSeries,
  type CbChartRecord,
} from './chart-parts';
import { CHART_RENDERERS } from './renderers';
import { renderComposed } from './renderers/composed';

export type { CbChartBand, CbChartData, CbChartDataset, CbChartItemEvent, CbChartType, CbChartValueFormat } from './chart-model';

let nextId = 0;

/**
 * Chart de CaribeNG: gráficos SVG accesibles y sin dependencias.
 *
 * - Cartesianos: `bar`, `horizontalBar`, `line`, `area` y `waterfall` (cascada).
 * - Circulares: `pie`, `doughnut`, `radialBar` y `gauge` (medidor).
 * - Radiales: `radar` y `polarArea`. Matrices: `heatmap` y `treemap`.
 * - `stacked` apila barras y áreas; en `bar`, una serie con `type: 'line'` se dibuja como línea.
 * - `sparkline` quita ejes, rejilla y leyenda (minigráfico para tarjetas o tablas).
 * - `valueFormat` y `locale` formatean los valores.
 * - Tooltip con ratón y teclado (flechas), leyenda que oculta series y una tabla de
 *   datos para lectores de pantalla.
 *
 * Cada tipo lo dibuja un renderer (`renderers/`) que devuelve una escena: formas,
 * zonas de clic y elementos navegables. Este componente solo la pinta.
 *
 * @example
 * ```html
 * <cb-chart type="bar" [data]="ventas" [valueFormat]="{ style: 'currency', currency: 'COP' }" />
 * <cb-chart type="radar" [data]="evaluacion" />
 * <cb-chart type="gauge" [data]="{ labels: ['Cumplimiento'], datasets: [{ label: 'Meta', data: [72] }] }" />
 * ```
 */
@Component({
  selector: 'cb-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet],
  host: {
    class: 'cb-chart',
    '[class.cb-chart--sparkline]': 'sparkline()',
    '[class.cb-chart--animate]': 'animate()',
  },
  template: `
    <ng-template #shapeTpl let-s>
      @switch (s.k) {
        @case ('rect') {
          <svg:rect
            [attr.class]="shapeClass(s)"
            [attr.x]="s.x"
            [attr.y]="s.y"
            [attr.width]="s.w"
            [attr.height]="s.h"
            [attr.rx]="s.rx"
            [attr.fill]="s.fill"
            (mouseenter)="hover(s.item)"
            (click)="select(s.item)"
          />
        }
        @case ('path') {
          <svg:path
            [attr.class]="shapeClass(s)"
            [attr.d]="s.d"
            [attr.fill]="s.fill"
            [attr.stroke]="s.stroke"
            [attr.pathLength]="s.pathLength"
            (mouseenter)="hover(s.item)"
            (click)="select(s.item)"
          />
        }
        @case ('circle') {
          <svg:circle
            [attr.class]="shapeClass(s)"
            [attr.cx]="s.cx"
            [attr.cy]="s.cy"
            [attr.r]="s.item !== undefined && active() === s.item ? s.rActive : s.r"
            [attr.fill]="s.fill"
          />
        }
        @case ('line') {
          <svg:line [attr.class]="s.cls" [attr.x1]="s.x1" [attr.y1]="s.y1" [attr.x2]="s.x2" [attr.y2]="s.y2" [attr.stroke]="s.stroke" />
        }
        @case ('text') {
          <svg:text
            [attr.class]="s.cls"
            [attr.x]="s.x"
            [attr.y]="s.y"
            [attr.text-anchor]="s.anchor"
            [attr.dominant-baseline]="s.baseline"
            [attr.fill]="s.fill"
          >{{ s.text }}</svg:text>
        }
      }
    </ng-template>

    <div
      #plot
      class="cb-chart__plot"
      tabindex="0"
      role="group"
      [attr.aria-label]="name()"
      [attr.aria-describedby]="instructionsId"
      (keydown)="onKeydown($event)"
      (focus)="onFocus()"
      (blur)="active.set(null)"
    >
      <svg
        class="cb-chart__svg"
        [class.cb-chart__svg--pannable]="scene().zoomed"
        [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
        aria-hidden="true"
        (mouseleave)="active.set(null)"
        (wheel)="onWheel($event)"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="dragging = null"
        (pointercancel)="dragging = null"
        (dblclick)="resetZoom()"
      >
        @if (scene().clip; as clip) {
          <defs>
            <clipPath [attr.id]="clipId">
              <rect [attr.x]="clip.x" [attr.y]="clip.y" [attr.width]="clip.w" [attr.height]="clip.h" />
            </clipPath>
          </defs>
        }
        @if (isEmpty()) {
          <text class="cb-chart__empty" [attr.x]="width() / 2" [attr.y]="height() / 2" text-anchor="middle">{{ t().noData }}</text>
        } @else {
          @for (s of scene().shapes; track $index) {
            <ng-container *ngTemplateOutlet="shapeTpl; context: { $implicit: s }" />
          }
          <g [attr.clip-path]="scene().clip ? 'url(#' + clipId + ')' : null">
            @for (s of scene().data ?? []; track $index) {
              <ng-container *ngTemplateOutlet="shapeTpl; context: { $implicit: s }" />
            }
            @if (activeItem()?.cursor; as c) {
              <line class="cb-chart__cursor" [attr.x1]="c.x" [attr.y1]="c.y1" [attr.x2]="c.x" [attr.y2]="c.y2" />
            }
            @for (s of scene().front ?? []; track $index) {
              <ng-container *ngTemplateOutlet="shapeTpl; context: { $implicit: s }" />
            }
          </g>
          @if (scene().center; as center) {
            <text class="cb-chart__center" [attr.x]="center.x" [attr.y]="center.y" text-anchor="middle" dominant-baseline="central">
              {{ center.text }}
            </text>
            @if (center.sub) {
              <text class="cb-chart__center-sub" [attr.x]="center.x" [attr.y]="center.y + 22" text-anchor="middle" dominant-baseline="central">
                {{ center.sub }}
              </text>
            }
          }
          <!-- Zonas invisibles por elemento: reciben el ratón y el clic. -->
          @for (hit of scene().hits; track $index) {
            @if (hit.k === 'rect') {
              <rect
                class="cb-chart__hit"
                [attr.x]="hit.x"
                [attr.y]="hit.y"
                [attr.width]="hit.w"
                [attr.height]="hit.h"
                (mouseenter)="hover(hit.item)"
                (click)="select(hit.item)"
              />
            } @else {
              <path class="cb-chart__hit" [attr.d]="hit.d" (mouseenter)="hover(hit.item)" (click)="select(hit.item)" />
            }
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
      @if (scene().zoomed) {
        <button type="button" class="cb-chart__reset" (click)="resetZoom()">{{ t().chartResetZoom }}</button>
      }
    </div>

    @if (showLegend() && !sparkline() && scene().legend.length) {
      <ul class="cb-chart__legend" [attr.aria-label]="t().chartLegend">
        @for (item of scene().legend; track item.index) {
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

    <span class="cb-chart__sr" [id]="instructionsId">{{ t().chartInstructions }} {{ zoomEnabled() ? t().chartZoomInstructions : '' }}</span>
    <span class="cb-chart__sr" aria-live="polite" aria-atomic="true">{{ announcement() }}</span>
    <!-- Los mismos datos como tabla, para lectores de pantalla. -->
    <table class="cb-chart__sr">
      <caption>{{ name() }}</caption>
      @if (scene().table.head; as head) {
        <thead>
          <tr>
            <td></td>
            @for (col of head; track $index) {
              <th scope="col">{{ col }}</th>
            }
          </tr>
        </thead>
      }
      <tbody>
        @for (row of scene().table.rows; track $index) {
          <tr>
            <th scope="row">{{ row.label }}</th>
            @for (cell of row.cells; track $index) {
              <td>{{ cell }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  styleUrl: './chart.component.css',
})
export class CbChart {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly instructionsId = `cb-chart-${++nextId}-help`;
  protected readonly clipId = `cb-chart-${nextId}-clip`;

  readonly type = input<CbChartType>('bar');
  /**
   * Datos. En el modo rápido, `{ labels, datasets }`. En el modo composable (con
   * series hijas como `<cb-chart-line>`), un array de registros.
   */
  readonly data = input<CbChartData | readonly CbChartRecord[]>({ labels: [], datasets: [] });
  /** Alto del gráfico en píxeles; el ancho se adapta al contenedor. */
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
  /** Valor mínimo del medidor (`gauge`). */
  readonly min = input<number>(0);
  /** Valor que representa el 100 % en `radialBar` y el máximo del medidor (`gauge`). */
  readonly max = input<number>(100);
  /** Franjas de color del medidor (`gauge`), p. ej. `[{ from: 0, to: 40, color: 'red' }]`. */
  readonly bands = input<readonly CbChartBand[]>([]);
  /** Animación de entrada (se desactiva sola con `prefers-reduced-motion`). */
  readonly animate = input(true, { transform: booleanAttribute });
  /** Modo composable: zoom y desplazamiento en el eje X (rueda, arrastre, `+` / `-` / `0`). */
  readonly zoom = input(false, { transform: booleanAttribute });

  /** Clic o Enter sobre una categoría, un segmento o una celda. */
  readonly itemSelect = output<CbChartItemEvent>();

  /** Series, ejes y referencias declarados como hijos (modo composable). */
  private readonly seriesDefs = contentChildren(CbChartSeries);
  private readonly axisDefs = contentChildren(CbChartAxis);
  private readonly lineDefs = contentChildren(CbChartReferenceLine);
  private readonly bandDefs = contentChildren(CbChartReferenceBand);

  /** Posición del elemento activo en `scene().items`. */
  protected readonly active = signal<number | null>(null);
  /** Series o elementos ocultos desde la leyenda. */
  protected readonly hidden = signal<ReadonlySet<number>>(new Set());
  /** Ventana visible del eje X (fracción del dominio) en el modo composable. */
  protected readonly view = signal<readonly [number, number]>([0, 1]);
  /** Ancho real del área del gráfico (px); hasta medirlo, el ancho lógico por defecto. */
  protected readonly width = signal(W);

  private readonly plotRef = viewChild.required<ElementRef<HTMLElement>>('plot');
  protected dragging: { x: number; view: readonly [number, number] } | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const w = Math.round(entry.contentRect.width);
        if (w > 0) this.width.set(w);
      });
      observer.observe(this.plotRef().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected readonly name = computed(() => this.ariaLabel() ?? this.t().chart);
  protected readonly composed = computed(() => this.seriesDefs().length > 0);
  protected readonly zoomEnabled = computed(() => this.zoom() && this.composed() && !this.sparkline());

  /** Datos del modo rápido (en el composable, `data` es un array de registros). */
  private readonly chartData = computed<CbChartData>(() => {
    const data = this.data();
    return Array.isArray(data) ? { labels: [], datasets: [] } : (data as CbChartData);
  });

  protected readonly isEmpty = computed(() => {
    if (this.composed()) return !this.composedSpec()!.series.some((s) => s.records.length);
    const { labels, datasets } = this.chartData();
    return !datasets.length || (this.type() !== 'gauge' && !labels.length);
  });

  private readonly numberFormat = computed(() => this.formatter(this.valueFormat()));
  private readonly percentFormat = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 }).format,
  );

  private formatter(vf: CbChartValueFormat | undefined): (value: number) => string {
    return typeof vf === 'function' ? vf : new Intl.NumberFormat(this.locale(), vf ?? { maximumFractionDigits: 2 }).format;
  }

  /** Lo declarado en los hijos, como datos planos para el renderer. */
  private readonly composedSpec = computed<ComposedSpec | undefined>(() => {
    const defs = this.seriesDefs();
    if (!defs.length) return undefined;
    const shared = this.data();
    const records = Array.isArray(shared) ? (shared as readonly CbChartRecord[]) : [];
    const series: SeriesSpec[] = defs.map((d, index) => {
      const field = (name: string) => (name in d ? (d as unknown as Record<string, () => string>)[name]() : name);
      return {
        kind: d.kind,
        index,
        name: d.name() || `${index + 1}`,
        color: d.color() ?? paletteColor(index),
        axis: d.axis(),
        records: d.data() ?? records,
        x: d.x(),
        y: field('y'),
        low: field('low'),
        high: field('high'),
        open: field('open'),
        close: field('close'),
        curve: 'curve' in d ? (d.curve as () => SeriesSpec['curve'])() : 'linear',
        dashed: 'dashed' in d ? (d.dashed as () => boolean)() : false,
        points: 'points' in d ? (d.points as () => boolean)() : true,
        stack: 'stack' in d ? (d.stack as () => string | undefined)() : undefined,
        size: 'size' in d ? (d.size as () => number)() : 5,
        variant: 'variant' in d ? (d.variant as () => 'candle' | 'ohlc')() : 'candle',
        upColor: 'upColor' in d ? (d.upColor as () => string)() : '',
        downColor: 'downColor' in d ? (d.downColor as () => string)() : '',
      };
    });
    return {
      series,
      axes: this.axisDefs().map((a) => ({
        position: a.position(),
        type: a.type(),
        min: a.min(),
        max: a.max(),
        label: a.label(),
        format: a.format() === undefined ? undefined : this.formatter(a.format()),
        grid: a.grid(),
      })),
      refs: [
        ...this.bandDefs().map((b) => ({ kind: 'band' as const, axis: b.axis(), from: b.from(), to: b.to(), label: b.label(), color: b.color() })),
        ...this.lineDefs().map((l) => ({ kind: 'line' as const, axis: l.axis(), value: l.value(), label: l.label(), color: l.color() })),
      ],
      view: this.zoomEnabled() ? this.view() : [0, 1],
    };
  });

  private readonly context = computed<ChartContext>(() => {
    const t = this.t();
    return {
      type: this.type(),
      data: this.chartData(),
      width: this.width(),
      height: this.height(),
      sparkline: this.sparkline(),
      stacked: this.stacked(),
      hidden: this.hidden(),
      min: this.min(),
      max: this.max(),
      bands: this.bands(),
      format: this.numberFormat(),
      percent: this.percentFormat(),
      locale: this.locale(),
      text: { total: t.chartTotal, change: t.chartChange, open: t.chartOpen, high: t.chartHigh, low: t.chartLow, close: t.chartClose },
      composed: this.composedSpec(),
    };
  });

  /** Lo que se dibuja: lo calcula el renderer del tipo (o el composable si hay series hijas). */
  protected readonly scene = computed<ChartScene>(() => {
    if (this.isEmpty()) return emptyScene();
    if (this.composed()) return renderComposed(this.context());
    const render = CHART_RENDERERS[this.type()] ?? CHART_RENDERERS.bar;
    return render(this.context());
  });

  protected readonly activeItem = computed(() => {
    const i = this.active();
    return i === null ? null : (this.scene().items[i] ?? null);
  });

  protected readonly tooltip = computed(() => {
    const item = this.activeItem();
    if (!item) return null;
    return {
      title: item.title,
      rows: item.rows,
      left: clamp((item.x / this.width()) * 100, 12, 88),
      top: (item.y / this.height()) * 100,
    };
  });

  // --- Zoom (modo composable) ----------------------------------------------------------
  /** Acerca (`factor` < 1) o aleja la ventana alrededor de `anchor` (0–1 dentro del área). */
  zoomBy(factor: number, anchor = 0.5): void {
    if (!this.zoomEnabled()) return;
    const [a, b] = this.view();
    const w = b - a;
    const minW = Math.min(1, Math.max(0.005, (this.scene().domainSize ?? 0.01) * 2));
    const next = clamp(w * factor, minW, 1);
    const center = a + w * anchor;
    const start = clamp(center - next * anchor, 0, 1 - next);
    this.active.set(null);
    this.view.set([start, start + next]);
  }

  /** Vuelve a mostrar todo el eje X. */
  resetZoom(): void {
    this.active.set(null);
    this.view.set([0, 1]);
  }

  /** Posición del ratón dentro del área de dibujo (0–1). */
  private pointerFraction(event: MouseEvent): number {
    const clip = this.scene().clip;
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    if (!clip || !rect.width) return 0.5;
    const x = ((event.clientX - rect.left) * this.width()) / rect.width;
    return clamp((x - clip.x) / clip.w, 0, 1);
  }

  protected onWheel(event: WheelEvent): void {
    if (!this.zoomEnabled() || !event.deltaY) return;
    event.preventDefault();
    this.zoomBy(event.deltaY < 0 ? 0.8 : 1.25, this.pointerFraction(event));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.zoomEnabled() || !this.scene().zoomed || event.button !== 0) return;
    this.dragging = { x: event.clientX, view: this.view() };
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this.dragging;
    const clip = this.scene().clip;
    if (!drag || !clip) return;
    const svg = event.currentTarget as SVGSVGElement;
    const scale = this.width() / (svg.getBoundingClientRect().width || this.width());
    const [a, b] = drag.view;
    const shift = (((drag.x - event.clientX) * scale) / clip.w) * (b - a);
    const start = clamp(a + shift, 0, 1 - (b - a));
    this.active.set(null);
    this.view.set([start, start + (b - a)]);
  }

  /** Lo que anuncia el lector de pantalla al recorrer el gráfico con el teclado. */
  protected readonly announcement = computed(() => {
    const item = this.activeItem();
    if (!item) return '';
    return `${item.title}: ${item.rows.map((r) => (r.label ? `${r.label} ${r.value}` : r.value)).join(', ')}`;
  });

  /** Clases de una forma: atenuada si hay otro elemento activo, resaltada si es el activo. */
  protected shapeClass(s: ChartShape): string {
    const active = this.active();
    if (s.item === undefined || active === null) return s.cls;
    if (s.item === active) return `${s.cls} cb-is-active`;
    return s.k === 'circle' ? s.cls : `${s.cls} cb-is-dim`;
  }

  // --- Interacción --------------------------------------------------------------------
  protected hover(item: number | undefined): void {
    if (item !== undefined) this.active.set(item);
  }

  protected onFocus(): void {
    if (this.active() === null && this.scene().items.length) this.active.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.scene().items.length;
    if (!count) return;
    const cols = this.scene().columns;
    const cur = this.active() ?? -1;
    let next: number | null;
    switch (event.key) {
      case 'ArrowRight':
        next = (cur + 1) % count;
        break;
      case 'ArrowLeft':
        next = cur <= 0 ? count - 1 : cur - 1;
        break;
      case 'ArrowDown':
        next = cols ? Math.min(count - 1, cur < 0 ? 0 : cur + cols) : (cur + 1) % count;
        break;
      case 'ArrowUp':
        next = cols ? Math.max(0, cur - cols) : cur <= 0 ? count - 1 : cur - 1;
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
      case '+':
      case '=':
      case '-':
      case '0': {
        if (!this.zoomEnabled()) return;
        event.preventDefault();
        if (event.key === '0') return this.resetZoom();
        const item = this.activeItem();
        const clip = this.scene().clip;
        const anchor = item && clip ? clamp((item.x - clip.x) / clip.w, 0, 1) : 0.5;
        return this.zoomBy(event.key === '-' ? 1.5 : 1 / 1.5, anchor);
      }
      default:
        return;
    }
    event.preventDefault();
    this.active.set(next);
  }

  protected select(position: number | undefined): void {
    const item = position === undefined ? undefined : this.scene().items[position];
    if (item) this.itemSelect.emit({ index: item.index, label: item.label });
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
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
