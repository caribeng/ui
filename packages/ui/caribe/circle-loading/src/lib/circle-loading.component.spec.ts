import { TestBed } from '@angular/core/testing';
import { CbCircleLoading } from './circle-loading.component';

describe('CbCircleLoading', () => {
  it('expone role="progressbar" con el porcentaje actual', () => {
    const fixture = TestBed.createComponent(CbCircleLoading);
    fixture.componentRef.setInput('progress', 80);
    fixture.detectChanges();
    const pb = fixture.nativeElement.querySelector('[role="progressbar"]');
    expect(pb.getAttribute('aria-valuenow')).toBe('80');
  });

  it('determinado expone el progreso; indeterminado omite aria-valuenow', () => {
    const fixture = TestBed.createComponent(CbCircleLoading);
    fixture.componentRef.setInput('progress', 40);
    fixture.componentRef.setInput('label', 'Subiendo');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const bar = el.querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-label')).toBe('Subiendo');
    expect(el.querySelector('.cb-circle-loading__label')!.textContent).toBe('Subiendo');

    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.querySelector('svg')!.classList).toContain('cb-is-indeterminate');
  });
});
