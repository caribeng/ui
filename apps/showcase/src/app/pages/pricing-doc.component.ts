import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbPricing, type CbPricingBilling, type CbPricingPlan } from '@caribeng/ui/pricing';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-pricing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPricing, DocPageHeaderComponent, DocSectionComponent, CodeBlockComponent],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="Pricing"
      lead="Tabla de precios genérica y data-driven: selector Mensual/Anual opcional, planes con características, plan destacado y evento al elegir."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Pasa los planes y enlaza billing con two-way binding para el selector Mensual/Anual."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <cb-pricing
        [plans]="plans"
        [(billing)]="billing"
        title="Planes flexibles a la medida de tus necesidades"
        (planSelect)="onSelect($event)"
      />
      <p style="margin: 1rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Último elegido: {{ chosen() || '—' }} · Ciclo: {{ billing() }}
      </p>
    </doc-section>

    <doc-section
      id="horizontal"
      title="Horizontal"
      description="layout=&quot;horizontal&quot; pone todas las tarjetas en una fila (con scroll si no caben) y el selector de facturación junto al título. En anual muestra el precio por mes con el total facturado y el ahorro (annualDisplay lo cambia). Cada característica puede llevar su icono."
      [code]="horizontalCode"
      [codeTs]="horizontalTs"
    >
      <cb-pricing
        [plans]="accountingPlans"
        [(billing)]="accountingBilling"
        layout="horizontal"
        title="Contabilidad"
        subtitle="Elige según los ingresos mensuales de tu negocio."
        annualBadge="25% OFF"
        (planSelect)="onSelect($event)"
      />
    </doc-section>

    <doc-section
      id="list"
      title="Lista"
      description="layout=&quot;list&quot; dispone cada plan como una fila: cabecera y precio a la izquierda, características en el centro y CTA a la derecha."
      [code]="listCode"
    >
      <cb-pricing [plans]="plans" [(billing)]="billing" layout="list" />
    </doc-section>

    <doc-section
      id="no-toggle"
      title="Sin selector"
      description="Con showToggle=false se ocultan Mensual/Anual y se muestran los precios mensuales."
      [code]="noToggleCode"
    >
      <cb-pricing [plans]="plans" [showToggle]="false" />
    </doc-section>
  `,
})
export class PricingDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly billing = signal<CbPricingBilling>('monthly');
  protected readonly chosen = signal<string>('');
  protected readonly accountingBilling = signal<CbPricingBilling>('annual');

  protected onSelect(plan: CbPricingPlan): void {
    this.chosen.set(plan.name);
  }

  protected readonly plans: CbPricingPlan[] = [
    {
      name: 'Starter',
      priceMonthly: 5,
      priceAnnual: 50,
      oldMonthly: 12,
      oldAnnual: 120,
      description: 'Para diseñadores y freelancers.',
      features: ['5 sitios web', '500 MB de almacenamiento', 'Subdominios ilimitados', 'Certificado SSL gratis'],
    },
    {
      name: 'Medium',
      priceMonthly: 10.99,
      priceAnnual: 109,
      oldMonthly: 30,
      oldAnnual: 300,
      description: 'Para proyectos comerciales.',
      features: ['10 sitios web', '1 GB de almacenamiento', 'Subdominios ilimitados', 'Certificado SSL gratis'],
      featured: true,
    },
    {
      name: 'Large',
      priceMonthly: 15,
      priceAnnual: 150,
      oldMonthly: 59,
      oldAnnual: 590,
      description: 'Para equipos de más de 5 personas.',
      features: ['15 sitios web', '10 GB de almacenamiento', 'Subdominios ilimitados', 'Certificado SSL gratis'],
    },
  ];

  protected readonly accountingPlans: CbPricingPlan[] = [
    accountingPlan('Emprendedor', 74900, 674100, ['10.000.000', 1, 1, '1 bodega de inventario'], ['Soporte 24/7 gratis', 'Asistente IA']),
    accountingPlan('Pyme', 163900, 1475100, ['40.000.000', 2, 1, '2 bodegas de inventario'], ['Soporte 24/7 gratis', 'Asistente IA']),
    { ...accountingPlan('Pro', 250900, 2258100, ['180.000.000', 3, 1, '10 bodegas de inventario'], ['Soporte 24/7 gratis', 'Asistente IA']), featured: true },
    accountingPlan('Plus', 319900, 2879100, ['500.000.000', 8, 1, '100 bodegas de inventario'], ['Soporte 24/7 gratis', 'Asistente IA']),
  ];

  protected readonly importCode = `import { CbPricing, CbPricingPlan } from '@caribeng/ui/pricing';`;

  protected readonly basicCode = `<cb-pricing
  [plans]="plans"
  [(billing)]="billing"
  title="Planes flexibles a la medida de tus necesidades"
  (planSelect)="onSelect($event)"
/>`;

  protected readonly basicTs = `readonly billing = signal<CbPricingBilling>('monthly');

readonly plans: CbPricingPlan[] = [
  { name: 'Starter', priceMonthly: 5, priceAnnual: 50, oldMonthly: 12,
    description: 'Para diseñadores y freelancers.',
    features: ['5 sitios web', '500 MB de almacenamiento'] },
  { name: 'Medium', priceMonthly: 10.99, priceAnnual: 109, featured: true,
    features: ['10 sitios web', '1 GB de almacenamiento'] },
  // …
];

onSelect(plan: CbPricingPlan) { /* … */ }`;

  protected readonly horizontalCode = `<cb-pricing
  [plans]="plans"
  [(billing)]="billing"
  layout="horizontal"
  title="Contabilidad"
  subtitle="Elige según los ingresos mensuales de tu negocio."
  annualBadge="25% OFF"
/>`;

  protected readonly horizontalTs = `readonly billing = signal<CbPricingBilling>('annual');

readonly plans: CbPricingPlan[] = [
  {
    name: 'Pyme',
    priceMonthly: 163900,
    priceAnnual: 1475100, // se muestra como 122.925 / mes y "Ahorras 491.700"
    ctaLabel: 'Probar gratis',
    features: [
      { label: 'Facturas de venta ilimitadas', icon: 'check' },
      { label: '2 Usuarios con acceso', icon: 'users' },
      { label: '2 bodegas de inventario', icon: 'warehouse' },
      { label: 'Asistente IA', icon: 'sparkles' },
    ],
  },
  { name: 'Pro', priceMonthly: 250900, priceAnnual: 2258100, featured: true /* "Recomendado" */ },
  // …
];`;

  protected readonly listCode = `<cb-pricing [plans]="plans" [(billing)]="billing" layout="list" />`;

  protected readonly noToggleCode = `<cb-pricing [plans]="plans" [showToggle]="false" />`;
}

function accountingPlan(
  name: string,
  priceMonthly: number,
  priceAnnual: number,
  [income, users, accountants, warehouses]: [string, number, number, string],
  extras: string[],
): CbPricingPlan {
  return {
    name,
    priceMonthly,
    priceAnnual,
    ctaLabel: 'Probar gratis',
    features: [
      { label: 'Facturas de venta ilimitadas', icon: 'check' },
      { label: `Ingresos hasta $ ${income} mensuales`, icon: 'file' },
      { label: `${users} ${users === 1 ? 'Usuario' : 'Usuarios'} con acceso`, icon: 'users' },
      { label: `${accountants} Usuario gratis para tu contador`, icon: 'users' },
      { label: warehouses, icon: 'warehouse' },
      ...extras.map((label, i) => ({ label, icon: i === 0 ? 'clock' : 'sparkles' })),
    ],
  };
}
