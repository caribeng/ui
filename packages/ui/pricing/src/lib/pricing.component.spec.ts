import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbPricing, type CbPricingPlan } from './pricing.component';

const PLANS: CbPricingPlan[] = [
  { name: 'Starter', priceMonthly: 5, priceAnnual: 50, oldMonthly: 12, features: ['A', 'B'] },
  { name: 'Pro', priceMonthly: 10, priceAnnual: 100, features: ['A', 'B', 'C'], featured: true },
];

describe('CbPricing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbPricing] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbPricing);
    fixture.componentRef.setInput('plans', PLANS);
    fixture.detectChanges();
    const el = (): HTMLElement => fixture.nativeElement;
    return { fixture, el };
  }

  it('renderiza un plan por entrada y marca el destacado', () => {
    const { el } = setup();
    expect(el().querySelectorAll('.cb-pricing__plan').length).toBe(2);
    expect(el().querySelectorAll('.cb-pricing__plan--featured').length).toBe(1);
  });

  it('muestra el precio mensual por defecto y cambia al anual', () => {
    const { fixture, el } = setup();
    const price = () => el().querySelector('.cb-pricing__price strong')!.textContent!.trim();
    expect(price()).toBe('$5');
    fixture.componentRef.setInput('billing', 'annual');
    fixture.detectChanges();
    expect(price()).toBe('$50');
  });

  it('emite planSelect con el plan al pulsar el CTA', () => {
    const { fixture, el } = setup();
    let selected: CbPricingPlan | undefined;
    fixture.componentInstance.planSelect.subscribe((p) => (selected = p));
    el().querySelector<HTMLButtonElement>('.cb-pricing__plan .cb-pricing__cta button, .cb-pricing__cta')!.click();
    expect(selected?.name).toBe('Starter');
  });
});
