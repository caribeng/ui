import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CbBreadcrumb, type CbBreadcrumbItem } from './breadcrumb.component';

describe('CbBreadcrumb: command y visible', () => {
  it('ejecuta command al hacer clic y oculta los items con visible: false', () => {
    const command = vi.fn();
    const items: CbBreadcrumbItem[] = [
      { label: 'Inicio', url: '/', command },
      { label: 'Oculto', url: '/oculto', visible: false },
      { label: 'Detalle' },
    ];
    TestBed.configureTestingModule({ imports: [CbBreadcrumb] });
    const fixture = TestBed.createComponent(CbBreadcrumb);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).not.toContain('Oculto');
    const link = host.querySelector<HTMLAnchorElement>('a')!;
    link.addEventListener('click', (event) => event.preventDefault());
    link.click();
    expect(command).toHaveBeenCalledOnce();
    expect(command.mock.calls[0][0].item).toBe(items[0]);
  });
});
