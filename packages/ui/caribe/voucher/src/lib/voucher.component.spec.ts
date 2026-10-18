import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbVoucher } from './voucher.component';

describe('CbVoucher', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbVoucher] }).compileComponents();
    const fixture = TestBed.createComponent(CbVoucher);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
