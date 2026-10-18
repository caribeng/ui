import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbTransactionStatusComponent } from './transaction-status.component';

describe('CbTransactionStatusComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbTransactionStatusComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbTransactionStatusComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
