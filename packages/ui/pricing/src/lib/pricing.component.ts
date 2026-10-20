import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { injectCbTranslation } from '@caribeng/ui';

/** Ciclo de facturación del selector de precios. */
export type CbPricingBilling = 'monthly' | 'annual';

/** Una característica de un plan. Puede ser texto o un objeto con estado. */
export type CbPricingFeature = string | { label: string; included?: boolean };

/** Definición de un plan de precios. */
export interface CbPricingPlan {
  /** Nombre del plan (p. ej. "Starter"). */
  name: string;
  /** Precio mensual. */
  priceMonthly: number;
  /** Precio anual (si se omite, se calcula como mensual × 10). */
  priceAnnual?: number;
  /** Precio mensual anterior (tachado). */
  oldMonthly?: number;
  /** Precio anual anterior (tachado). */
  oldAnnual?: number;
  /** Descripción corta. */
  description?: string;
  /** Lista de características. */
  features?: CbPricingFeature[];
  /** Resalta el plan (destacado). */
  featured?: boolean;
  /** Texto del botón (por defecto "Elegir {name}"). */
  ctaLabel?: string;
}

/**
 * Tabla de precios de CaribeNG: selector Mensual/Anual opcional y planes
 * data-driven con características y un plan destacado. Emite `planSelect` al
 * elegir un plan.
 *
 * @example
 * ```html
 * <cb-pricing [plans]="plans" [(billing)]="billing" (planSelect)="choose($event)" />
 * ```
 */
@Component({
  selector: 'cb-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbButton],
  host: {
    class: 'cb-pricing',
    '[class.cb-pricing--horizontal]': "layout() === 'horizontal'",
  },
  template: `
    @if (title()) {
      <h2 class="cb-pricing__title">{{ title() }}</h2>
    }

    @if (showToggle()) {
      <div class="cb-pricing__toggle-wrap">
        <div class="cb-pricing__toggle" [class.cb-pricing__toggle--annual]="billing() === 'annual'">
          <span class="cb-pricing__toggle-thumb"></span>
          <button
            type="button"
            class="cb-pricing__toggle-btn"
            [class.cb-pricing__toggle-btn--on]="billing() === 'monthly'"
            (click)="billing.set('monthly')"
          >
            {{ (monthlyLabel() ?? t().monthly) }}
          </button>
          <button
            type="button"
            class="cb-pricing__toggle-btn"
            [class.cb-pricing__toggle-btn--on]="billing() === 'annual'"
            (click)="billing.set('annual')"
          >
            {{ (annualLabel() ?? t().yearly) }}
          </button>
        </div>
      </div>
    }

    <div class="cb-pricing__grid">
      @for (p of plans(); track p.name) {
        <div class="cb-pricing__plan" [class.cb-pricing__plan--featured]="p.featured">
          <div class="cb-pricing__head">
            <span class="cb-pricing__plan-name">{{ p.name }}</span>
            <div class="cb-pricing__price-row">
              <div class="cb-pricing__price">
                <strong>{{ currency() }}{{ priceOf(p) }}</strong>
                <span class="cb-pricing__per">{{ billing() === 'annual' ? (perYearLabel() ?? t().perYear) : (perMonthLabel() ?? t().perMonth) }}</span>
              </div>
              @if (oldPriceOf(p); as old) {
                <span class="cb-pricing__old">{{ currency() }}{{ old }}</span>
              }
            </div>
            @if (p.description) {
              <p class="cb-pricing__desc">{{ p.description }}</p>
            }
          </div>
          <div class="cb-pricing__divider"></div>
          @if (p.features?.length) {
            <ul class="cb-pricing__features">
              @for (f of p.features; track labelOf(f)) {
                <li [class.cb-pricing__feature--off]="!includedOf(f)">
                  <cb-icon [name]="includedOf(f) ? 'check' : 'x'" [size]="16" class="cb-pricing__check" aria-hidden="true" />
                  {{ labelOf(f) }}
                </li>
              }
            </ul>
          }
          <cb-button
            class="cb-pricing__cta"
            [fullWidth]="true"
            [severity]="p.featured ? 'primary' : 'secondary'"
            [variant]="p.featured ? 'solid' : 'outlined'"
            (click)="planSelect.emit(p)"
          >
            {{ p.ctaLabel || (ctaLabel() ?? t().choose) + ' ' + p.name }}
          </cb-button>
        </div>
      }
    </div>
  `,
  styleUrl: './pricing.component.css',
})
export class CbPricing {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Planes a mostrar. */
  readonly plans = input<readonly CbPricingPlan[]>([]);
  /** Ciclo activo (two-way). */
  readonly billing = model<CbPricingBilling>('monthly');
  /** Muestra el selector Mensual/Anual. */
  readonly showToggle = input<boolean>(true);
  /** Disposición de los planes: 'grid' (tarjetas) u 'horizontal' (filas). */
  readonly layout = input<'grid' | 'horizontal'>('grid');
  /** Título opcional sobre la tabla. */
  readonly title = input<string>('');
  /** Símbolo de moneda. */
  readonly currency = input<string>('$');
  /** Etiquetas configurables. */
  readonly monthlyLabel = input<string | undefined>(undefined);
  readonly annualLabel = input<string | undefined>(undefined);
  readonly perMonthLabel = input<string | undefined>(undefined);
  readonly perYearLabel = input<string | undefined>(undefined);
  /** Prefijo del CTA cuando el plan no define `ctaLabel`. */
  readonly ctaLabel = input<string | undefined>(undefined);

  /** Emite el plan elegido. */
  readonly planSelect = output<CbPricingPlan>();

  protected readonly annual = computed(() => this.billing() === 'annual');

  protected priceOf(p: CbPricingPlan): number {
    return this.annual() ? (p.priceAnnual ?? p.priceMonthly * 10) : p.priceMonthly;
  }

  protected oldPriceOf(p: CbPricingPlan): number | undefined {
    return this.annual() ? p.oldAnnual : p.oldMonthly;
  }

  protected labelOf(f: CbPricingFeature): string {
    return typeof f === 'string' ? f : f.label;
  }

  protected includedOf(f: CbPricingFeature): boolean {
    return typeof f === 'string' ? true : f.included !== false;
  }
}
