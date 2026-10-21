import { NgTemplateOutlet } from '@angular/common';
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
import { injectCbTranslation } from '@caribeng/ui';
import {
  W,
  emptyScene,
  type CbChartBand,
  type CbChartData,
  type CbChartItemEvent,
  type CbChartType,
  type CbChartValueFormat,
  type ChartContext,
  type ChartScene,
  type ChartShape,
} from './chart-model';
import { CHART_RENDERERS } from './renderers';

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
        } @else {
          @for (s of scene().shapes; track $index) {
            <ng-container *ngTemplateOutlet="shapeTpl; context: { $implicit: s }" />
          }
          @if (activeItem()?.cursor; as c) {
            <line class="cb-chart__cursor" [attr.x1]="c.x" [attr.y1]="c.y1" [attr.x2]="c.x" [attr.y2]="c.y2" />
          }
          @for (s of scene().front ?? []; track $index) {
            <ng-container *ngTemplateOutlet="shapeTpl; context: { $implicit: s }" />
          }
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

    <span class="cb-chart__sr" [id]="instructionsId">{{ t().chartInstructions }}</span>
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
  /** Valor mínimo del medidor (`gauge`). */
  readonly min = input<number>(0);
  /** Valor que representa el 100 % en `radialBar` y el máximo del medidor (`gauge`). */
  readonly max = input<number>(100);
  /** Franjas de color del medidor (`gauge`), p. ej. `[{ from: 0, to: 40, color: 'red' }]`. */
  readonly bands = input<readonly CbChartBand[]>([]);
  /** Animación de entrada (se desactiva sola con `prefers-reduced-motion`). */
  readonly animate = input(true, { transform: booleanAttribute });

  /** Clic o Enter sobre una categoría, un segmento o una celda. */
  readonly itemSelect = output<CbChartItemEvent>();

  /** Posición del elemento activo en `scene().items`. */
  protected readonly active = signal<number | null>(null);
  /** Series o elementos ocultos desde la leyenda. */
  protected readonly hidden = signal<ReadonlySet<number>>(new Set());

  protected readonly name = computed(() => this.ariaLabel() ?? this.t().chart);
  protected readonly isEmpty = computed(() => {
    const { labels, datasets } = this.data();
    return !datasets.length || (this.type() !== 'gauge' && !labels.length);
  });

  private readonly numberFormat = computed(() => {
    const vf = this.valueFormat();
    return typeof vf === 'function' ? vf : new Intl.NumberFormat(this.locale(), vf ?? { maximumFractionDigits: 2 }).format;
  });
  private readonly percentFormat = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 }).format,
  );

  private readonly context = computed<ChartContext>(() => ({
    type: this.type(),
    data: this.data(),
    width: W,
    height: this.height(),
    sparkline: this.sparkline(),
    stacked: this.stacked(),
    hidden: this.hidden(),
    min: this.min(),
    max: this.max(),
    bands: this.bands(),
    format: this.numberFormat(),
    percent: this.percentFormat(),
    text: { total: this.t().chartTotal, change: this.t().chartChange },
  }));

  /** Lo que se dibuja: lo calcula el renderer del tipo. */
  protected readonly scene = computed<ChartScene>(() => {
    if (this.isEmpty()) return emptyScene();
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
      left: clamp((item.x / W) * 100, 12, 88),
      top: (item.y / this.height()) * 100,
    };
  });

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
