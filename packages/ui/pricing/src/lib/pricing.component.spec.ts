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

  it('layout="list" mantiene la vista de filas', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('layout', 'list');
    fixture.detectChanges();
    expect(el().classList).toContain('cb-pricing--list');
    expect(el().classList).not.toContain('cb-pricing--horizontal');
    expect(el().querySelector('.cb-pricing__toggle')).not.toBeNull();
  });

  it('el plan destacado muestra "Recomendado" salvo que badge lo cambie', () => {
    const { fixture, el } = setup();
    expect(el().querySelectorAll('.cb-pricing__badge').length).toBe(1);
    expect(el().querySelector('.cb-pricing__plan--featured .cb-pricing__badge')!.textContent!.trim()).toBe('Recomendado');
    fixture.componentRef.setInput('plans', [{ ...PLANS[1], badge: '' }, { ...PLANS[0], badge: 'Nuevo' }]);
    fixture.detectChanges();
    const badges = [...el().querySelectorAll('.cb-pricing__badge')].map((b) => b.textContent!.trim());
    expect(badges).toEqual(['Nuevo']);
  });

  it('formatea los importes con el idioma activo', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('plans', [{ name: 'Plus', priceMonthly: 239925.5 }, { name: 'Pyme', priceMonthly: 122925 }]);
    fixture.detectChanges();
    const prices = [...el().querySelectorAll('.cb-pricing__price strong')].map((p) => p.textContent!.trim());
    expect(prices).toEqual(['$239.925,50', '$122.925']);
  });

  describe('layout horizontal', () => {
    const ACCOUNTING: CbPricingPlan[] = [
      { name: 'Pyme', priceMonthly: 163900, priceAnnual: 1475100, features: [{ label: 'Facturas', icon: 'users' }] },
      { name: 'Pro', priceMonthly: 250900, priceAnnual: 2258100, featured: true },
    ];

    function setupH() {
      const ctx = setup();
      ctx.fixture.componentRef.setInput('layout', 'horizontal');
      ctx.fixture.componentRef.setInput('plans', ACCOUNTING);
      ctx.fixture.componentRef.setInput('title', 'Contabilidad');
      ctx.fixture.componentRef.setInput('subtitle', 'Elige según tus ingresos.');
      ctx.fixture.componentRef.setInput('annualBadge', '25% OFF');
      ctx.fixture.componentRef.setInput('billing', 'annual');
      ctx.fixture.detectChanges();
      return ctx;
    }

    it('muestra título, ayuda y el selector como grupo de opciones', () => {
      const { el } = setupH();
      expect(el().classList).toContain('cb-pricing--horizontal');
      expect(el().querySelector('.cb-pricing__top .cb-pricing__title')!.textContent!.trim()).toBe('Contabilidad');
      expect(el().querySelector('.cb-pricing__subtitle')!.textContent!.trim()).toBe('Elige según tus ingresos.');
      expect(el().querySelector('.cb-pricing__toggle')).toBeNull();
      const group = el().querySelector('[role="radiogroup"]')!;
      expect(group.getAttribute('aria-label')).toBe('Ciclo de facturación');
      const radios = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
      expect(radios.map((r) => r.textContent!.replace(/\s+/g, ' ').trim())).toEqual(['Paga anualmente 25% OFF', 'Paga mensualmente']);
      expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);
      expect(radios.map((r) => r.tabIndex)).toEqual([0, -1]);
    });

    it('en anual muestra el precio por mes, el total facturado y el ahorro', () => {
      const { el } = setupH();
      const plan = el().querySelector('.cb-pricing__plan')!;
      expect(plan.querySelector('.cb-pricing__price strong')!.textContent!.trim()).toBe('$122.925');
      expect(plan.querySelector('.cb-pricing__per')!.textContent!.trim()).toBe('/mes');
      expect(plan.querySelector('.cb-pricing__billed')!.textContent!.trim()).toBe('Facturado $1.475.100 anualmente');
      expect(plan.querySelector('.cb-pricing__saving')!.textContent!.trim()).toBe('Ahorras $491.700');
    });

    it('en mensual oculta el total facturado y el ahorro', () => {
      const { fixture, el } = setupH();
      el().querySelector<HTMLButtonElement>('[data-billing="monthly"]')!.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.billing()).toBe('monthly');
      expect(el().querySelector('.cb-pricing__price strong')!.textContent!.trim()).toBe('$163.900');
      expect(el().querySelector('.cb-pricing__billed')).toBeNull();
      expect(el().querySelector('.cb-pricing__saving')).toBeNull();
    });

    it('annualDisplay="total" vuelve al importe anual', () => {
      const { fixture, el } = setupH();
      fixture.componentRef.setInput('annualDisplay', 'total');
      fixture.detectChanges();
      expect(el().querySelector('.cb-pricing__price strong')!.textContent!.trim()).toBe('$1.475.100');
      expect(el().querySelector('.cb-pricing__per')!.textContent!.trim()).toBe('/año');
      expect(el().querySelector('.cb-pricing__billed')).toBeNull();
    });

    it('las flechas cambian la opción y mueven el foco', () => {
      const { fixture, el } = setupH();
      const annual = el().querySelector<HTMLButtonElement>('[data-billing="annual"]')!;
      annual.focus();
      annual.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.billing()).toBe('monthly');
      expect(document.activeElement).toBe(el().querySelector('[data-billing="monthly"]'));
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.billing()).toBe('annual');
    });

    it('usa el icono propio de cada característica y CTA primario', () => {
      const { el } = setupH();
      const featureSvg = el().querySelector('.cb-pricing__features cb-icon')!.innerHTML;
      const checkSvg = el().querySelector('.cb-pricing__box cb-icon')!.innerHTML;
      expect(featureSvg).not.toBe('');
      expect(featureSvg).not.toBe(checkSvg);
      const ctas = [...el().querySelectorAll('.cb-pricing__cta button')];
      expect(ctas.length).toBe(2);
    });
  });
  it('el conmutador mensual/anual es un grupo nombrado con aria-pressed', () => {
    const { fixture, el } = setup();
    const group = el().querySelector('.cb-pricing__toggle')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Ciclo de facturación');
    const [monthly, annual] = Array.from(group.querySelectorAll<HTMLButtonElement>('.cb-pricing__toggle-btn'));
    expect(monthly.getAttribute('aria-pressed')).toBe('true');
    expect(annual.getAttribute('aria-pressed')).toBe('false');
    annual.click();
    fixture.detectChanges();
    expect(annual.getAttribute('aria-pressed')).toBe('true');
  });

  it('las características no incluidas se anuncian como tales', () => {
    const fixture = TestBed.createComponent(CbPricing);
    fixture.componentRef.setInput('plans', [{ name: 'Base', priceMonthly: 1, priceAnnual: 10, features: ['A', { label: 'Soporte', included: false }] }]);
    fixture.detectChanges();
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.cb-pricing__features li'));
    expect(items[0].querySelector('.cb-pricing__sr')).toBeNull();
    expect(items[1].textContent!.replace(/\s+/g, ' ').trim()).toBe('Soporte (no incluido)');
  });
});
