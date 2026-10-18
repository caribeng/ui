import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

export type CbChartType = 'bar' | 'line' | 'doughnut' | 'pie';

export interface CbChartDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface CbChartData {
  labels: string[];
  datasets: CbChartDataset[];
}

const DEFAULT_PALETTE = [
  'var(--cb-color-primary-500, #0077b6)',
  'var(--cb-color-secondary-500, #f59e0b)',
  'var(--cb-color-success-500, #10b981)',
  'var(--cb-color-danger-500, #ef4444)',
  'var(--cb-color-info-500, #0ea5e9)',
];

/**
 * Chart de CaribeNG: gráficos vectoriales SVG accesibles sin dependencias externas
 * (soporta tipos `bar`, `line`, `doughnut` y `pie`).
 */
@Component({
  selector: 'cb-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-chart',
  },
  template: `
    <svg
      class="cb-chart__svg"
      [attr.viewBox]="'0 0 520 ' + height()"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      @if (type() === 'bar' || type() === 'line') {
        @for (lineY of gridLines(); track lineY) {
          <line
            class="cb-chart__grid-line"
            x1="40"
            [attr.y1]="lineY"
            x2="496"
            [attr.y2]="lineY"
          />
        }

        @if (type() === 'bar') {
          @for (bar of bars(); track bar.key) {
            <rect
              class="cb-chart__bar"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.w"
              [attr.height]="bar.h"
              rx="4"
              [attr.fill]="bar.color"
            >
              <title>{{ bar.title }}</title>
            </rect>
          }
        }

        @if (type() === 'line') {
          @for (series of lines(); track series.label) {
            <polyline
              fill="none"
              [attr.stroke]="series.color"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              [attr.points]="series.pointsAttr"
            />
            @for (pt of series.points; track pt.key) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                r="4"
                [attr.fill]="series.color"
              >
                <title>{{ pt.title }}</title>
              </circle>
            }
          }
        }

        @for (lbl of xLabels(); track lbl.index) {
          <text
            class="cb-chart__axis-label"
            [attr.x]="lbl.x"
            [attr.y]="height() - 8"
            text-anchor="middle"
          >
            {{ lbl.text }}
          </text>
        }
      } @else {
        @for (seg of circularSegments(); track seg.key) {
          <circle
            cx="260"
            [attr.cy]="height() / 2"
            [attr.r]="circularRadius()"
            fill="transparent"
            [attr.stroke]="seg.color"
            [attr.stroke-width]="type() === 'pie' ? circularRadius() * 2 : 34"
            [attr.stroke-dasharray]="seg.dashArray"
            [attr.stroke-dashoffset]="seg.dashOffset"
            [attr.transform]="'rotate(-90 260 ' + height() / 2 + ')'"
          >
            <title>{{ seg.title }}</title>
          </circle>
        }
      }
    </svg>

    @if (showLegend() && legendItems().length > 0) {
      <ul class="cb-chart__legend" aria-label="Leyenda del gráfico">
        @for (item of legendItems(); track item.label) {
          <li class="cb-chart__legend-item">
            <span class="cb-chart__swatch" [style.background]="item.color"></span>
            <span>{{ item.label }}</span>
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './chart.component.css',
})
export class CbChart {
  readonly type = input<CbChartType>('bar');
  readonly data = input<CbChartData>({ labels: [], datasets: [] });
  readonly height = input<number>(220);
  readonly showLegend = input<boolean>(true);
  readonly ariaLabel = input<string>('Gráfico de datos');

  protected readonly gridLines = computed(() => {
    const plotTop = 18;
    const plotBottom = Math.max(60, this.height() - 32);
    const step = (plotBottom - plotTop) / 3;
    return [plotTop, plotTop + step, plotTop + step * 2, plotBottom];
  });

  private readonly maxValue = computed(() => {
    const all = this.data().datasets.flatMap((d) => d.data);
    return Math.max(1, ...all, 0);
  });

  protected readonly xLabels = computed(() => {
    const labels = this.data().labels;
    if (!labels.length) return [];
    const plotLeft = 48;
    const plotWidth = 440;
    const step = plotWidth / labels.length;
    return labels.map((text, index) => ({
      index,
      text,
      x: plotLeft + step * index + step / 2,
    }));
  });

  protected readonly bars = computed(() => {
    const { labels, datasets } = this.data();
    if (!labels.length || !datasets.length) return [];
    const plotTop = 18;
    const plotBottom = Math.max(60, this.height() - 32);
    const plotHeight = plotBottom - plotTop;
    const plotLeft = 48;
    const plotWidth = 440;
    const groupWidth = plotWidth / labels.length;
    const barWidth = Math.max(8, Math.min(34, (groupWidth - 16) / datasets.length));
    const max = this.maxValue();

    const result: {
      key: string;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      title: string;
    }[] = [];

    labels.forEach((lbl, li) => {
      const groupStart =
        plotLeft + groupWidth * li + (groupWidth - barWidth * datasets.length) / 2;
      datasets.forEach((ds, di) => {
        const val = Math.max(0, ds.data[li] ?? 0);
        const h = (val / max) * plotHeight;
        const color = ds.color ?? DEFAULT_PALETTE[di % DEFAULT_PALETTE.length];
        result.push({
          key: `${di}-${li}`,
          x: Number((groupStart + di * barWidth).toFixed(2)),
          y: Number((plotBottom - h).toFixed(2)),
          w: Number(Math.max(4, barWidth - 3).toFixed(2)),
          h: Number(Math.max(2, h).toFixed(2)),
          color,
          title: `${ds.label} (${lbl}): ${val}`,
        });
      });
    });

    return result;
  });

  protected readonly lines = computed(() => {
    const { labels, datasets } = this.data();
    if (!labels.length || !datasets.length) return [];
    const plotTop = 18;
    const plotBottom = Math.max(60, this.height() - 32);
    const plotHeight = plotBottom - plotTop;
    const plotLeft = 48;
    const plotWidth = 440;
    const step = plotWidth / labels.length;
    const max = this.maxValue();

    return datasets.map((ds, di) => {
      const color = ds.color ?? DEFAULT_PALETTE[di % DEFAULT_PALETTE.length];
      const points = labels.map((lbl, li) => {
        const val = Math.max(0, ds.data[li] ?? 0);
        const x = Number((plotLeft + step * li + step / 2).toFixed(2));
        const y = Number((plotBottom - (val / max) * plotHeight).toFixed(2));
        return {
          key: `${di}-${li}`,
          x,
          y,
          title: `${ds.label} (${lbl}): ${val}`,
        };
      });
      return {
        label: ds.label,
        color,
        points,
        pointsAttr: points.map((p) => `${p.x},${p.y}`).join(' '),
      };
    });
  });

  protected readonly circularRadius = computed(() =>
    this.type() === 'pie' ? 38 : 62
  );

  protected readonly circularSegments = computed(() => {
    const { labels, datasets } = this.data();
    const first = datasets[0];
    if (!first || !first.data.length) return [];
    const r = this.circularRadius();
    const circumference = 2 * Math.PI * r;
    const total = Math.max(
      1,
      first.data.reduce((sum, v) => sum + Math.max(0, v), 0)
    );
    let accumulated = 0;

    return first.data.map((raw, idx) => {
      const val = Math.max(0, raw);
      const len = (val / total) * circumference;
      const offset = -accumulated;
      accumulated += len;
      const lbl = labels[idx] ?? `Item ${idx + 1}`;
      return {
        key: `${idx}-${lbl}`,
        color: DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
        dashArray: `${len.toFixed(2)} ${(circumference - len).toFixed(2)}`,
        dashOffset: offset.toFixed(2),
        title: `${lbl}: ${val}`,
      };
    });
  });

  protected readonly legendItems = computed(() => {
    const { labels, datasets } = this.data();
    if (this.type() === 'doughnut' || this.type() === 'pie') {
      return labels.map((label, idx) => ({
        label,
        color: DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
      }));
    }
    return datasets.map((ds, idx) => ({
      label: ds.label,
      color: ds.color ?? DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
    }));
  });
}
