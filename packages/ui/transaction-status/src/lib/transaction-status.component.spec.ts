import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbTransactionStatus } from './transaction-status.component';

describe('CbTransactionStatus', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbTransactionStatus] }).compileComponents();
    const fixture = TestBed.createComponent(CbTransactionStatus);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('aplica la clase del estado con icono decorativo', () => {
    const fixture = TestBed.createComponent(CbTransactionStatus);
    fixture.componentRef.setInput('status', 'error');
    fixture.componentRef.setInput('label', 'Rechazada');
    fixture.detectChanges();
    const box = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')!;
    expect(box.classList).toContain('cb-txn--error');
    expect(box.querySelector('.cb-txn__icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(box.querySelector('.cb-txn__label')!.textContent).toBe('Rechazada');
  });
});
