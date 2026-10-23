import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbOrganizationChart } from './organizationchart.component';

describe('CbOrganizationChart', () => {
  it('expands nested branches and selects a node', () => {
    TestBed.configureTestingModule({ imports: [CbOrganizationChart] });
    const fixture = TestBed.createComponent(CbOrganizationChart);
    fixture.componentRef.setInput('value', [
      { key: 'ceo', label: 'Dirección', children: [
        { key: 'eng', label: 'Ingeniería', children: [{ key: 'dev', label: 'Desarrollo' }] },
      ] },
    ]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[aria-label="Expandir Dirección"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ingeniería');

    fixture.nativeElement.querySelector('[aria-label="Expandir Ingeniería"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Seleccionar Desarrollo"]').click();
    expect(fixture.componentInstance.selection()?.key).toBe('dev');
  });

  it('collapses expanded branches', () => {
    TestBed.configureTestingModule({ imports: [CbOrganizationChart] });
    const fixture = TestBed.createComponent(CbOrganizationChart);
    fixture.componentRef.setInput('value', [{ key: 'root', label: 'Raíz', children: [{ key: 'child', label: 'Hijo' }] }]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Expandir Raíz"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Contraer Raíz"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Hijo');
  });
  it('es un grupo de listas anidadas con botones (sin role tree) y el elegido expone aria-pressed', () => {
    TestBed.configureTestingModule({ imports: [CbOrganizationChart] });
    const fixture = TestBed.createComponent(CbOrganizationChart);
    fixture.componentRef.setInput('value', [{ key: 'ceo', label: 'Dirección' }]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="tree"], [role="treeitem"]')).toBeNull();
    expect(el.querySelector('[role="group"]')!.getAttribute('aria-label')).toBeTruthy();
    expect(el.querySelector('ul > li')).toBeTruthy();
    const select = el.querySelector<HTMLButtonElement>('[aria-label="Seleccionar Dirección"]')!;
    expect(select.getAttribute('aria-pressed')).toBe('false');
    select.click();
    fixture.detectChanges();
    expect(select.getAttribute('aria-pressed')).toBe('true');
  });
});
