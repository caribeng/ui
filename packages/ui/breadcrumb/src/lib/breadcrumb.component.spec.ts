import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbBreadcrumbComponent, type CbBreadcrumbItem } from './breadcrumb.component';

const ITEMS: CbBreadcrumbItem[] = [
  { label: 'Inicio', url: '/', icon: 'house' },
  { label: 'Productos', url: '/productos' },
  { label: 'Detalle' },
];

describe('CbBreadcrumbComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbBreadcrumbComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbBreadcrumbComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('renderiza enlaces para los items con url y el último como actual', () => {
    const { host } = setup();
    const links = host().querySelectorAll('a.cb-breadcrumb__link');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/');
    const current = host().querySelector('.cb-breadcrumb__current');
    expect(current?.textContent?.trim()).toBe('Detalle');
    expect(current?.getAttribute('aria-current')).toBe('page');
  });

  it('coloca un separador entre elementos (n-1)', () => {
    const { host } = setup();
    expect(host().querySelectorAll('.cb-breadcrumb__sep').length).toBe(ITEMS.length - 1);
  });

  it('nav accesible con aria-label', () => {
    const { host } = setup();
    expect(host().querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
  });
});
