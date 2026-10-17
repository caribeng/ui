import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbOrganizationChartComponent } from './organizationchart.component';

describe('CbOrganizationChartComponent', () => {
  it('expands nested branches and selects a node', () => {
    TestBed.configureTestingModule({ imports: [CbOrganizationChartComponent] });
    const fixture = TestBed.createComponent(CbOrganizationChartComponent);
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
    TestBed.configureTestingModule({ imports: [CbOrganizationChartComponent] });
    const fixture = TestBed.createComponent(CbOrganizationChartComponent);
    fixture.componentRef.setInput('value', [{ key: 'root', label: 'Raíz', children: [{ key: 'child', label: 'Hijo' }] }]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Expandir Raíz"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Contraer Raíz"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Hijo');
  });
});
