import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

/** Ciclo de facturación del selector de precios. */
export type CbPricingBilling = 'monthly' | 'annual';

/**
 * Disposición de los planes:
 * - `grid`: tarjetas que se reparten en varias filas según el ancho.
 * - `horizontal`: todas las tarjetas en una sola fila (con scroll si no caben),
 *   selector de facturación a la derecha del título y precio anual expresado por mes.
 * - `list`: cada plan es una fila (cabecera, características y CTA).
 */
export type CbPricingLayout = 'grid' | 'horizontal' | 'list';

/** Una característica de un plan. Puede ser texto o un objeto con estado e icono. */
export type CbPricingFeature = string | { label: string; included?: boolean; icon?: string };

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
  /** Etiqueta junto al nombre. En el plan destacado vale "Recomendado" si se omite; `''` la oculta. */
  badge?: string;
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
    '[class.cb-pricing--list]': "layout() === 'list'",
  },
  template: `
    @if (horizontal()) {
      @if (title() || subtitle() || showToggle()) {
        <div class="cb-pricing__top">
          <div class="cb-pricing__intro">
            @if (title()) {
              <h2 class="cb-pricing__title">{{ title() }}</h2>
            }
            @if (subtitle()) {
              <p class="cb-pricing__subtitle">
                <cb-icon name="info" [size]="16" aria-hidden="true" />
                {{ subtitle() }}
              </p>
            }
          </div>
          @if (showToggle()) {
            <div class="cb-pricing__choices" role="radiogroup" [attr.aria-label]="t().billingCycle" (keydown)="onChoiceKey($event)">
              @for (c of choices; track c) {
                <button
                  type="button"
                  role="radio"
                  class="cb-pricing__choice"
                  [attr.data-billing]="c"
                  [attr.aria-checked]="billing() === c"
                  [attr.tabindex]="billing() === c ? 0 : -1"
                  (click)="billing.set(c)"
                >
                  <span class="cb-pricing__box" aria-hidden="true">
                    @if (billing() === c) {
                      <cb-icon name="check" [size]="12" />
                    }
                  </span>
                  {{ c === 'annual' ? (annualLabel() ?? t().payAnnually) : (monthlyLabel() ?? t().payMonthly) }}
                  @if (c === 'annual' && annualBadge()) {
                    <span class="cb-pricing__discount">{{ annualBadge() }}</span>
                  }
                </button>
              }
            </div>
          }
        </div>
      }
    } @else {
      @if (title()) {
        <h2 class="cb-pricing__title">{{ title() }}</h2>
      }

      @if (showToggle()) {
        <div class="cb-pricing__toggle-wrap">
          <div class="cb-pricing__toggle" [class.cb-pricing__toggle--annual]="billing() === 'annual'" role="group" [attr.aria-label]="t().billingCycle">
            <span class="cb-pricing__toggle-thumb"></span>
            <button
              type="button"
              class="cb-pricing__toggle-btn"
              [class.cb-pricing__toggle-btn--on]="billing() === 'monthly'"
              [attr.aria-pressed]="billing() === 'monthly'"
              (click)="billing.set('monthly')"
            >
              {{ (monthlyLabel() ?? t().monthly) }}
            </button>
            <button
              type="button"
              class="cb-pricing__toggle-btn"
              [class.cb-pricing__toggle-btn--on]="billing() === 'annual'"
              [attr.aria-pressed]="billing() === 'annual'"
              (click)="billing.set('annual')"
            >
              {{ (annualLabel() ?? t().yearly) }}
            </button>
          </div>
        </div>
      }
    }

    <div class="cb-pricing__grid">
      @for (p of plans(); track p.name) {
        <div class="cb-pricing__plan" [class.cb-pricing__plan--featured]="p.featured">
          <div class="cb-pricing__head">
            <span class="cb-pricing__plan-name">
              {{ p.name }}
              @if (badgeOf(p); as badge) {
                <span class="cb-pricing__badge">
                  <cb-icon name="star" [size]="12" aria-hidden="true" />
                  {{ badge }}
                </span>
              }
            </span>
            <div class="cb-pricing__price-row">
              <div class="cb-pricing__price">
                <strong><span class="cb-pricing__currency">{{ currency() }}</span>{{ num(priceOf(p)) }}</strong>
                <span class="cb-pricing__per">{{ perMonthShown() ? (perMonthLabel() ?? t().perMonth) : (perYearLabel() ?? t().perYear) }}</span>
              </div>
              @if (oldPriceOf(p); as old) {
                <span class="cb-pricing__old">{{ currency() }}{{ num(old) }}</span>
              }
            </div>
            @if (perMonthShown() && annual()) {
              <p class="cb-pricing__billed">{{ billedOf(p) }}</p>
              @if (savingOf(p) > 0) {
                <span class="cb-pricing__saving">{{ savingLabel(p) }}</span>
              }
            }
            @if (p.description) {
              <p class="cb-pricing__desc">{{ p.description }}</p>
            }
          </div>
          <div class="cb-pricing__divider"></div>
          @if (p.features?.length) {
            <ul class="cb-pricing__features">
              @for (f of p.features; track labelOf(f)) {
                <li [class.cb-pricing__feature--off]="!includedOf(f)">
                  <cb-icon [name]="iconOf(f)" [size]="16" class="cb-pricing__check" aria-hidden="true" />
                  {{ labelOf(f) }}
                  @if (!includedOf(f)) {
                    <span class="cb-pricing__sr">({{ t().notIncluded }})</span>
                  }
                </li>
              }
            </ul>
          }
          <cb-button
            class="cb-pricing__cta"
            [fullWidth]="true"
            [severity]="p.featured || horizontal() ? 'primary' : 'secondary'"
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Planes a mostrar. */
  readonly plans = input<readonly CbPricingPlan[]>([]);
  /** Ciclo activo (two-way). */
  readonly billing = model<CbPricingBilling>('monthly');
  /** Muestra el selector Mensual/Anual. */
  readonly showToggle = input<boolean>(true);
  /** Disposición de los planes (ver {@link CbPricingLayout}). */
  readonly layout = input<CbPricingLayout>('grid');
  /** Título opcional sobre la tabla. */
  readonly title = input<string>('');
  /** Texto de ayuda bajo el título (solo en `horizontal`). */
  readonly subtitle = input<string>('');
  /** Etiqueta junto a la opción anual (p. ej. "25% OFF"; solo en `horizontal`). */
  readonly annualBadge = input<string>('');
  /**
   * Cómo se muestra el precio anual: `total` (importe del año, "/año") o `monthly`
   * (equivalente mensual, "/mes", con el total facturado y el ahorro debajo).
   * Por defecto `monthly` en `horizontal` y `total` en el resto.
   */
  readonly annualDisplay = input<'total' | 'monthly' | undefined>(undefined);
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

  protected readonly choices: readonly CbPricingBilling[] = ['annual', 'monthly'];
  protected readonly horizontal = computed(() => this.layout() === 'horizontal');
  protected readonly annual = computed(() => this.billing() === 'annual');
  private readonly annualMonthly = computed(
    () => (this.annualDisplay() ?? (this.horizontal() ? 'monthly' : 'total')) === 'monthly',
  );
  /** El precio visible es mensual (ciclo mensual, o anual expresado por mes). */
  protected readonly perMonthShown = computed(() => !this.annual() || this.annualMonthly());
  private readonly numberFormat = computed(() => ({
    whole: new Intl.NumberFormat(this.t().intlLocale, { maximumFractionDigits: 0 }),
    cents: new Intl.NumberFormat(this.t().intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  }));

  protected num(n: number): string {
    const f = this.numberFormat();
    return Number.isInteger(Math.round(n * 100) / 100) ? f.whole.format(n) : f.cents.format(n);
  }

  private annualOf(p: CbPricingPlan): number {
    return p.priceAnnual ?? p.priceMonthly * 10;
  }

  protected priceOf(p: CbPricingPlan): number {
    if (!this.annual()) return p.priceMonthly;
    return this.annualMonthly() ? this.annualOf(p) / 12 : this.annualOf(p);
  }

  protected oldPriceOf(p: CbPricingPlan): number | undefined {
    if (!this.annual()) return p.oldMonthly;
    return p.oldAnnual !== undefined && this.annualMonthly() ? p.oldAnnual / 12 : p.oldAnnual;
  }

  protected billedOf(p: CbPricingPlan): string {
    return cbFormat(this.t().billedAnnually, this.currency() + this.num(this.annualOf(p)));
  }

  protected savingOf(p: CbPricingPlan): number {
    return Math.round((p.priceMonthly * 12 - this.annualOf(p)) * 100) / 100;
  }

  protected savingLabel(p: CbPricingPlan): string {
    return cbFormat(this.t().youSave, this.currency() + this.num(this.savingOf(p)));
  }

  protected badgeOf(p: CbPricingPlan): string {
    return p.badge ?? (p.featured ? this.t().recommended : '');
  }

  protected labelOf(f: CbPricingFeature): string {
    return typeof f === 'string' ? f : f.label;
  }

  protected includedOf(f: CbPricingFeature): boolean {
    return typeof f === 'string' ? true : f.included !== false;
  }

  protected iconOf(f: CbPricingFeature): string {
    if (!this.includedOf(f)) return 'x';
    return (typeof f === 'string' ? undefined : f.icon) ?? 'check';
  }

  /** Flechas dentro del grupo de opciones de facturación (patrón radiogroup). */
  protected onChoiceKey(event: KeyboardEvent): void {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const i = this.choices.indexOf(this.billing());
    const next =
      event.key === 'Home'
        ? this.choices[0]
        : event.key === 'End'
          ? this.choices[this.choices.length - 1]
          : this.choices[(i + (event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1) + this.choices.length) % this.choices.length];
    this.billing.set(next);
    this.host.nativeElement.querySelector<HTMLElement>(`.cb-pricing__choice[data-billing="${next}"]`)?.focus();
  }
}
