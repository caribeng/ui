import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

interface Plan {
  name: string;
  monthly: number;
  annual: number;
  oldMonthly: number;
  oldAnnual: number;
  desc: string;
  features: string[];
  featured?: boolean;
}

/**
 * Template (receta copiable): tabla de precios genérica con toggle Mensual/Anual
 * y 3 planes data-driven, uno destacado. Composición con componentes CaribeNG.
 */
@Component({
  selector: 'doc-pricing-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIcon, CbButton, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Pricing"
      lead="Tabla de precios genérica: toggle Mensual/Anual que cambia los precios, 3 planes data-driven con lista de features y un plan destacado."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="pr">
        <h2 class="pr__title">Planes flexibles a la medida de tus necesidades</h2>

        <!-- Toggle -->
        <div class="pr__toggle-wrap">
          <div class="pr__toggle" [class.pr__toggle--annual]="annual()">
            <span class="pr__toggle-thumb"></span>
            <button type="button" class="pr__toggle-btn" [class.pr__toggle-btn--on]="!annual()" (click)="annual.set(false)">
              Mensual
            </button>
            <button type="button" class="pr__toggle-btn" [class.pr__toggle-btn--on]="annual()" (click)="annual.set(true)">
              Anual
            </button>
          </div>
        </div>

        <!-- Planes -->
        <div class="pr__grid">
          @for (p of plans; track p.name) {
            <div class="pr__plan" [class.pr__plan--featured]="p.featured">
              <span class="pr__plan-name">{{ p.name }}</span>
              <div class="pr__price-row">
                <div class="pr__price">
                  <strong>{{ '$' + (annual() ? p.annual : p.monthly) }}</strong>
                  <span class="pr__per">{{ annual() ? '/año' : '/mes' }}</span>
                </div>
                <span class="pr__old">{{ '$' + (annual() ? p.oldAnnual : p.oldMonthly) }}</span>
              </div>
              <p class="pr__desc">{{ p.desc }}</p>
              <div class="pr__divider"></div>
              <ul class="pr__features">
                @for (f of p.features; track f) {
                  <li>
                    <cb-icon name="check" [size]="16" class="pr__check" aria-hidden="true" />
                    {{ f }}
                  </li>
                }
              </ul>
              <cb-button
                class="pr__cta"
                [fullWidth]="true"
                [severity]="p.featured ? 'primary' : 'secondary'"
                [variant]="p.featured ? 'solid' : 'outlined'"
              >
                Elegir {{ p.name }}
              </cb-button>
            </div>
          }
        </div>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .pr {
        width: 100%;
        font-family: var(--cb-font-sans);
      }
      .pr__title {
        max-width: 30rem;
        margin: 0 auto 1.75rem;
        text-align: center;
        font-size: 1.4rem;
        line-height: 1.3;
      }
      .pr__toggle-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
      }
      .pr__toggle {
        position: relative;
        display: inline-flex;
        padding: 4px;
        border-radius: 999px;
        background: var(--cb-color-surface-hover, rgba(0, 0, 0, 0.06));
      }
      .pr__toggle-thumb {
        position: absolute;
        top: 4px;
        left: 4px;
        width: 110px;
        height: calc(100% - 8px);
        border-radius: 999px;
        background: var(--cb-color-surface-raised, #fff);
        box-shadow: var(--cb-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
        transition: transform 0.2s ease;
      }
      .pr__toggle--annual .pr__toggle-thumb {
        transform: translateX(110px);
      }
      .pr__toggle-btn {
        position: relative;
        z-index: 1;
        width: 110px;
        height: 40px;
        border: 0;
        background: transparent;
        color: var(--cb-color-text-muted);
        font: inherit;
        font-weight: 500;
        cursor: pointer;
      }
      .pr__toggle-btn--on {
        color: var(--cb-color-text);
      }
      .pr__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--cb-space-4, 1rem);
        align-items: start;
      }
      .pr__plan {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 16px);
        background: var(--cb-color-surface);
      }
      .pr__plan--featured {
        background: var(--cb-color-primary-600, #059669);
        border-color: var(--cb-color-primary-600, #059669);
        color: #fff;
      }
      .pr__plan-name {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
      }
      .pr__price-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .pr__price {
        display: flex;
        align-items: flex-end;
        gap: 0.25rem;
      }
      .pr__price strong {
        font-size: 1.9rem;
        line-height: 1;
      }
      .pr__per {
        font-size: 0.85rem;
        opacity: 0.7;
        margin-bottom: 0.2rem;
      }
      .pr__old {
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: line-through;
        opacity: 0.45;
      }
      .pr__desc {
        margin: 0.5rem 0 0;
        font-size: 0.85rem;
        opacity: 0.8;
      }
      .pr__divider {
        height: 1px;
        margin: 1.25rem 0;
        background: currentColor;
        opacity: 0.15;
      }
      .pr__features {
        flex: 1;
        margin: 0 0 1.5rem;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .pr__features li {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.875rem;
      }
      .pr__check {
        color: var(--cb-color-success-500, #22c55e);
        flex: none;
      }
      .pr__plan--featured .pr__check {
        color: #fff;
      }
    `,
  ],
})
export class PricingTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly annual = signal(false);

  protected readonly plans: Plan[] = [
    {
      name: 'Starter',
      monthly: 5,
      annual: 50,
      oldMonthly: 12,
      oldAnnual: 120,
      desc: 'Para diseñadores y freelancers.',
      features: ['5 sitios web', '500 MB de almacenamiento', 'Subdominios ilimitados', '3 dominios propios', 'Certificado SSL gratis', 'Tráfico ilimitado'],
    },
    {
      name: 'Medium',
      monthly: 10.99,
      annual: 109,
      oldMonthly: 30,
      oldAnnual: 300,
      desc: 'Para proyectos comerciales.',
      features: ['10 sitios web', '1 GB de almacenamiento', 'Subdominios ilimitados', '5 dominios propios', 'Certificado SSL gratis', 'Tráfico ilimitado'],
      featured: true,
    },
    {
      name: 'Large',
      monthly: 15,
      annual: 150,
      oldMonthly: 59,
      oldAnnual: 590,
      desc: 'Para equipos de más de 5 personas.',
      features: ['15 sitios web', '10 GB de almacenamiento', 'Subdominios ilimitados', '10 dominios propios', 'Certificado SSL gratis', 'Tráfico ilimitado'],
    },
  ];

  protected readonly htmlCode = `<!-- Toggle Mensual/Anual -->
<div class="toggle" [class.annual]="annual()">
  <span class="thumb"></span>
  <button (click)="annual.set(false)">Mensual</button>
  <button (click)="annual.set(true)">Anual</button>
</div>

<div class="grid">
  @for (p of plans; track p.name) {
    <div class="plan" [class.featured]="p.featured">
      <span class="name">{{ p.name }}</span>
      <div class="price">
        <strong>{{ '$' + (annual() ? p.annual : p.monthly) }}</strong>
        <span>{{ annual() ? '/año' : '/mes' }}</span>
        <span class="old">{{ '$' + (annual() ? p.oldAnnual : p.oldMonthly) }}</span>
      </div>
      <p>{{ p.desc }}</p>
      <ul>
        @for (f of p.features; track f) {
          <li><cb-icon name="check" [size]="16" /> {{ f }}</li>
        }
      </ul>
      <cb-button [fullWidth]="true" [severity]="p.featured ? 'primary' : 'secondary'"
                 [variant]="p.featured ? 'solid' : 'outlined'">Elegir {{ p.name }}</cb-button>
    </div>
  }
</div>`;

  protected readonly tsCode = `import { Component, signal } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';

interface Plan {
  name: string; monthly: number; annual: number;
  oldMonthly: number; oldAnnual: number;
  desc: string; features: string[]; featured?: boolean;
}

@Component({
  selector: 'app-pricing',
  imports: [CbIcon, CbButton],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  readonly annual = signal(false);

  readonly plans: Plan[] = [
    { name: 'Starter', monthly: 5, annual: 50, oldMonthly: 12, oldAnnual: 120,
      desc: 'Para diseñadores y freelancers.',
      features: ['5 sitios web', '500 MB de almacenamiento', 'Subdominios ilimitados', '3 dominios propios', 'SSL gratis', 'Tráfico ilimitado'] },
    { name: 'Medium', monthly: 10.99, annual: 109, oldMonthly: 30, oldAnnual: 300,
      desc: 'Para proyectos comerciales.', featured: true,
      features: ['10 sitios web', '1 GB de almacenamiento', 'Subdominios ilimitados', '5 dominios propios', 'SSL gratis', 'Tráfico ilimitado'] },
    { name: 'Large', monthly: 15, annual: 150, oldMonthly: 59, oldAnnual: 590,
      desc: 'Para equipos de más de 5 personas.',
      features: ['15 sitios web', '10 GB de almacenamiento', 'Subdominios ilimitados', '10 dominios propios', 'SSL gratis', 'Tráfico ilimitado'] },
  ];
}`;
}
