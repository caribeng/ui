import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbPricing, type CbPricingBilling, type CbPricingPlan } from '@caribeng/ui/pricing';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

/**
 * Template (receta copiable): página de precios construida con el componente
 * genérico `cb-pricing`.
 */
@Component({
  selector: 'doc-pricing-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPricing, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Pricing"
      lead="Página de precios lista para copiar, construida con el componente genérico cb-pricing: toggle Mensual/Anual, planes y plan destacado."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <cb-pricing
        [plans]="plans"
        [(billing)]="billing"
        title="Planes flexibles a la medida de tus necesidades"
      />
    </doc-section>
  `,
})
export class PricingTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly billing = signal<CbPricingBilling>('monthly');

  protected readonly plans: CbPricingPlan[] = [
    {
      name: 'Starter',
      priceMonthly: 5,
      priceAnnual: 50,
      oldMonthly: 12,
      oldAnnual: 120,
      description: 'Para diseñadores y freelancers.',
      features: ['5 sitios web', '500 MB de almacenamiento', 'Subdominios ilimitados', 'Certificado SSL gratis', 'Tráfico ilimitado'],
    },
    {
      name: 'Medium',
      priceMonthly: 10.99,
      priceAnnual: 109,
      oldMonthly: 30,
      oldAnnual: 300,
      description: 'Para proyectos comerciales.',
      features: ['10 sitios web', '1 GB de almacenamiento', 'Subdominios ilimitados', '5 dominios propios', 'Tráfico ilimitado'],
      featured: true,
    },
    {
      name: 'Large',
      priceMonthly: 15,
      priceAnnual: 150,
      oldMonthly: 59,
      oldAnnual: 590,
      description: 'Para equipos de más de 5 personas.',
      features: ['15 sitios web', '10 GB de almacenamiento', 'Subdominios ilimitados', '10 dominios propios', 'Tráfico ilimitado'],
    },
  ];

  protected readonly htmlCode = `<cb-pricing [plans]="plans" [(billing)]="billing"
  title="Planes flexibles a la medida de tus necesidades" />`;

  protected readonly tsCode = `import { CbPricing, CbPricingPlan, CbPricingBilling } from '@caribeng/ui/pricing';

readonly billing = signal<CbPricingBilling>('monthly');
readonly plans: CbPricingPlan[] = [
  { name: 'Starter', priceMonthly: 5, priceAnnual: 50, oldMonthly: 12,
    features: ['5 sitios web', '500 MB de almacenamiento'] },
  { name: 'Medium', priceMonthly: 10.99, priceAnnual: 109, featured: true,
    features: ['10 sitios web', '1 GB de almacenamiento'] },
  // …
];`;
}
