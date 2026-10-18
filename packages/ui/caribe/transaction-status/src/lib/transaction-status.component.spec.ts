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
});
