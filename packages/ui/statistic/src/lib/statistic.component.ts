import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Tendencia de una cifra: sube o baja. */
export type CbStatisticTrend = 'up' | 'down';

/**
 * Statistic de CaribeNG: cifra destacada para dashboards, con título, prefijo,
 * sufijo, formato con `Intl.NumberFormat` y tendencia opcional.
 *
 * @example
 * ```html
 * <cb-statistic title="Saldo disponible" [value]="12450000" locale="es-CO"
 *               [format]="{ style: 'currency', currency: 'COP', maximumFractionDigits: 0 }" />
 * <cb-statistic title="Gastos del mes" [value]="8.4" suffix="%" trend="down" trendLabel="vs. septiembre" />
 * ```
 */
@Component({
  selector: 'cb-statistic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-statistic' },
  template: `
    @if (title()) {
      <span class="cb-statistic__title">{{ title() }}</span>
    }
    <span class="cb-statistic__value">
      @if (prefix()) {
        <span class="cb-statistic__affix">{{ prefix() }}</span>
      }
      <span class="cb-statistic__number">{{ formatted() }}</span>
      @if (suffix()) {
        <span class="cb-statistic__affix">{{ suffix() }}</span>
      }
    </span>
    @if (trend()) {
      <span class="cb-statistic__trend" [class.cb-statistic__trend--up]="trend() === 'up'" [class.cb-statistic__trend--down]="trend() === 'down'">
        <cb-icon [name]="trend() === 'up' ? 'trending-up' : 'trending-down'" [size]="14" aria-hidden="true" />
        <!-- El color y la flecha no bastan: el sentido también se dice con texto. -->
        <span class="cb-statistic__sr">{{ trend() === 'up' ? t().trendUp : t().trendDown }}</span>
        @if (trendLabel()) {
          <span>{{ trendLabel() }}</span>
        }
      </span>
    }
  `,
  styleUrl: './statistic.component.css',
})
export class CbStatistic {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly title = input<string>('');
  readonly value = input<number | string | null>(null);
  readonly prefix = input<string>('');
  readonly suffix = input<string>('');
  /** Opciones de `Intl.NumberFormat` (moneda, porcentaje, decimales…). */
  readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
  /** Locale BCP 47 del formato (por defecto, el del navegador). */
  readonly locale = input<string | undefined>(undefined);
  /** Tendencia: añade flecha, color y el texto "aumenta" / "disminuye". */
  readonly trend = input<CbStatisticTrend | null>(null);
  /** Texto junto a la tendencia (p. ej. "+12 % vs. septiembre"). */
  readonly trendLabel = input<string>('');

  protected readonly formatted = computed(() => {
    const v = this.value();
    if (v === null || v === '') return '—';
    return typeof v === 'number' ? new Intl.NumberFormat(this.locale(), this.format()).format(v) : v;
  });
}

/**
 * Countdown de CaribeNG: cuenta regresiva hasta una fecha (vencimientos,
 * códigos OTP, ofertas). Emite `finished` al llegar a cero.
 *
 * @example
 * ```html
 * <cb-countdown title="Tu código vence en" [target]="vence" (finished)="pedirOtro()" />
 * ```
 */
@Component({
  selector: 'cb-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-statistic cb-countdown' },
  template: `
    @if (title()) {
      <span class="cb-statistic__title">{{ title() }}</span>
    }
    <!-- role="timer": los lectores no anuncian cada segundo, pero el valor se puede consultar. -->
    <span class="cb-statistic__value" role="timer" [attr.aria-label]="title() || null">
      <span class="cb-statistic__number">{{ display() }}</span>
    </span>
  `,
  styleUrl: './statistic.component.css',
})
export class CbCountdown {
  readonly title = input<string>('');
  /** Momento final (fecha o milisegundos desde 1970). */
  readonly target = input.required<Date | number>();
  /** Mostrar los días aunque sean 0. Por defecto solo cuando quedan días. */
  readonly showDays = input<boolean>(false);
  /** Se emite una vez al llegar a cero. */
  readonly finished = output<void>();

  private readonly now = signal(Date.now());
  private finishedFor: number | null = null;

  /** Milisegundos restantes (nunca negativos). */
  protected readonly remaining = computed(() => Math.max(0, +this.target() - this.now()));
  protected readonly display = computed(() => {
    const total = Math.floor(this.remaining() / 1000);
    const days = Math.floor(total / 86400);
    const hh = pad(Math.floor((total % 86400) / 3600));
    const mm = pad(Math.floor((total % 3600) / 60));
    const ss = pad(total % 60);
    return days > 0 || this.showDays() ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  });

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    effect(() => {
      const target = +this.target();
      if (this.remaining() === 0 && this.finishedFor !== target) {
        this.finishedFor = target;
        this.finished.emit();
      }
    });
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
