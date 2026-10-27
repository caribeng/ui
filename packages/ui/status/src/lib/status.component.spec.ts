import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbStatus } from './status.component';

describe('CbStatus', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbStatus] }).compileComponents();
    const fixture = TestBed.createComponent(CbStatus);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('aplica la clase del estado y el punto es decorativo', () => {
    const fixture = TestBed.createComponent(CbStatus);
    fixture.componentRef.setInput('status', 'warning');
    fixture.componentRef.setInput('text', 'Pendiente');
    fixture.detectChanges();
    const pill = (fixture.nativeElement as HTMLElement).querySelector('.cb-status')!;
    expect(pill.classList).toContain('cb-status--warning');
    expect(pill.querySelector('.cb-status__dot')!.getAttribute('aria-hidden')).toBe('true');
    expect(pill.textContent!.trim()).toBe('Pendiente');
  });
});
