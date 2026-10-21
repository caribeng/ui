import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbTracker } from './tracker.component';

describe('CbTracker', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbTracker] }).compileComponents();
    const fixture = TestBed.createComponent(CbTracker);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('marca pasos completados, el actual con aria-current="step" y numera los pendientes', () => {
    const fixture = TestBed.createComponent(CbTracker);
    fixture.componentRef.setInput('steps', ['Recibido', 'En revisión', 'Aprobado']);
    fixture.componentRef.setInput('currentIndex', 1);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ol')!.getAttribute('aria-label')).toBeTruthy();
    const steps = Array.from(el.querySelectorAll('li'));
    expect(steps.map((s) => s.getAttribute('aria-current'))).toEqual([null, 'step', null]);
    expect(steps[0].classList).toContain('cb-is-complete');
    expect(steps[1].classList).toContain('cb-is-current');
    expect(steps.map((s) => s.querySelector('.cb-tracker__marker')!.textContent)).toEqual(['✓', '2', '3']);
  });
});
