import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { CB_CONFIG, cbFormat, cbFormatAmount, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Formato del valor del indicador. */
export type CbKpiFormat = 'currency' | 'number' | 'integer' | 'percent';

let nextUid = 0;

/**
 * Indicador (KPI) de CaribeNG: valor, variación frente al periodo anterior,
 * minigráfica de tendencia y avance hacia una meta.
 *
 * - `better` dice si subir es bueno (`up`, ingresos) o malo (`down`, gastos): el
 *   color de la variación lo sigue.
 * - La variación se calcula sola a partir de `previous` y se dice con texto
 *   («sube 12,3 %»), no solo con el color o la flecha.
 *
 * @example
 * ```html
 * <cb-kpi label="Ingresos del mes" [value]="208330000" [previous]="167440000" [series]="ventas" compareLabel="vs. octubre 2025" />
 * ```
 */
@Component({
  selector: 'cb-kpi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-kpi', role: 'group', '[attr.aria-labelledby]': 'uid + "-label"' },
  template: `
    <div class="cb-kpi__head">
      <span class="cb-kpi__label" [id]="uid + '-label'">{{ label() }}</span>
      @if (delta(); as d) {
        <span class="cb-kpi__delta" [class.cb-kpi__delta--good]="d.good === true" [class.cb-kpi__delta--bad]="d.good === false">
          <cb-icon [name]="d.change > 0 ? 'trending-up' : d.change < 0 ? 'trending-down' : 'minus'" [size]="14" aria-hidden="true" />
          <span aria-hidden="true">{{ d.text }}</span>
          <span class="cb-kpi__sr">{{ d.spoken }}</span>
        </span>
      }
    </div>
    <div class="cb-kpi__value">{{ format(value()) }}</div>
    @if (previous() !== null) {
      <div class="cb-kpi__compare">{{ compareLabel() || t().kpiPrevious }}: {{ format(previous()) }}</div>
    }
    @if (points(); as p) {
      <svg class="cb-kpi__spark" viewBox="0 0 100 32" preserveAspectRatio="none" role="img" [attr.aria-label]="sparkLabel()">
        <path class="cb-kpi__area" [attr.d]="p.area" />
        <path class="cb-kpi__line" [attr.d]="p.line" vector-effect="non-scaling-stroke" />
      </svg>
    }
    @if (progress(); as g) {
      <div class="cb-kpi__goal">
        <div class="cb-kpi__bar" role="progressbar" [attr.aria-valuenow]="g.pct" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="t().kpiGoal">
          <span [style.width.%]="Math.min(100, g.pct)"></span>
        </div>
        <span class="cb-kpi__goal-text">{{ fmt(t().kpiOfGoal, g.pct, format(target())) }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
        padding: 1rem 1.1rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 0.75rem);
        background: var(--cb-color-surface-raised, var(--cb-color-bg));
        color: var(--cb-color-text);
        font-family: var(--cb-font-sans);
      }
      .cb-kpi__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .cb-kpi__label {
        color: var(--cb-color-text-muted);
        font-size: var(--cb-text-sm, 0.875rem);
        font-weight: var(--cb-font-weight-medium, 500);
      }
      .cb-kpi__delta {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        background: var(--cb-color-surface-subtle);
        color: var(--cb-color-text-muted);
        font-size: var(--cb-text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        font-weight: var(--cb-font-weight-semibold, 600);
        white-space: nowrap;
      }
      .cb-kpi__delta--good {
        background: color-mix(in srgb, var(--cb-color-success-500, #10b981) 14%, transparent);
        color: var(--cb-color-success-700, #047857);
      }
      .cb-kpi__delta--bad {
        background: color-mix(in srgb, var(--cb-color-danger-500, #ef4444) 12%, transparent);
        color: var(--cb-color-danger-700, #b91c1c);
      }
      .cb-kpi__value {
        overflow: hidden;
        font-size: var(--cb-text-2xl, 1.5rem);
        font-variant-numeric: tabular-nums;
        font-weight: var(--cb-font-weight-bold, 700);
        letter-spacing: -0.01em;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .cb-kpi__compare {
        color: var(--cb-color-text-muted);
        font-size: var(--cb-text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
      }
      .cb-kpi__spark {
        width: 100%;
        height: 2.25rem;
        margin-top: 0.25rem;
        overflow: visible;
      }
      .cb-kpi__line {
        fill: none;
        stroke: var(--cb-color-primary-500);
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
      }
      .cb-kpi__area {
        fill: color-mix(in srgb, var(--cb-color-primary-500) 14%, transparent);
      }
      .cb-kpi__goal {
        display: grid;
        gap: 0.25rem;
        margin-top: 0.25rem;
      }
      .cb-kpi__bar {
        height: 0.4rem;
        overflow: hidden;
        border-radius: 999px;
        background: var(--cb-color-surface-subtle);
      }
      .cb-kpi__bar span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--cb-color-primary-500);
      }
      .cb-kpi__goal-text {
        color: var(--cb-color-text-muted);
        font-size: var(--cb-text-xs, 0.75rem);
      }
      .cb-kpi__sr {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
    `,
  ],
})
export class CbKpi {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly Math = Math;
  private readonly config = inject(CB_CONFIG);
  protected readonly uid = `cb-kpi-${++nextUid}`;

  readonly label = input<string>('');
  readonly value = input<number | null>(null);
  /** Valor del periodo con el que se compara. */
  readonly previous = input<number | null>(null);
  /** Texto de la comparación («vs. mes anterior»). */
  readonly compareLabel = input<string>('');
  /** `up`: subir es bueno (ingresos); `down`: subir es malo (gastos); `none`: sin color. */
  readonly better = input<'up' | 'down' | 'none'>('up');
  readonly format_ = input<CbKpiFormat>('currency', { alias: 'format' });
  readonly currency = input<string | undefined>(undefined);
  readonly decimals = input<number | undefined>(undefined);
  /** Serie para la minigráfica (del más antiguo al más reciente). */
  readonly series = input<readonly number[]>([]);
  /** Meta: muestra el avance del valor hacia ella. */
  readonly target = input<number | null>(null);

  private readonly locale = computed(() => this.config.numberLocale ?? this.t().intlLocale);

  protected format(v: number | null): string {
    if (v === null) return '—';
    const locale = this.locale();
    switch (this.format_()) {
      case 'percent':
        return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: this.decimals() ?? 1 }).format(v);
      case 'integer':
        return cbFormatAmount(v, locale, { decimals: 0 });
      case 'number':
        return cbFormatAmount(v, locale, { decimals: this.decimals() });
      default:
        return cbFormatAmount(v, locale, { currency: this.currency() ?? this.config.currency ?? null, decimals: this.decimals() ?? 0 });
    }
  }

  protected readonly delta = computed(() => {
    const v = this.value();
    const p = this.previous();
    if (v === null || p === null) return null;
    const change = p === 0 ? (v === 0 ? 0 : null) : (v - p) / Math.abs(p);
    if (change === null) return null;
    const pct = new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 }).format(Math.abs(change));
    const t = this.t();
    const better = this.better();
    const good = change === 0 || better === 'none' ? null : (change > 0) === (better === 'up');
    return {
      change,
      good,
      text: `${change > 0 ? '+' : change < 0 ? '−' : ''}${pct}`,
      spoken: change === 0 ? t.kpiSame : cbFormat(change > 0 ? t.kpiUp : t.kpiDown, pct),
    };
  });

  protected readonly points = computed(() => {
    const s = this.series();
    if (s.length < 2) return null;
    const min = Math.min(...s);
    const max = Math.max(...s);
    const span = max - min || 1;
    const xy = s.map((v, i) => [(i / (s.length - 1)) * 100, 30 - ((v - min) / span) * 28] as const);
    const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    return { line, area: `${line} L100,32 L0,32 Z` };
  });

  protected readonly sparkLabel = computed(() => {
    const s = this.series();
    return s.length ? cbFormat(this.t().kpiTrend, this.format(s[0]), this.format(s[s.length - 1]), s.length) : '';
  });

  protected readonly progress = computed(() => {
    const v = this.value();
    const g = this.target();
    if (v === null || !g) return null;
    return { pct: Math.round((v / g) * 100) };
  });
}
