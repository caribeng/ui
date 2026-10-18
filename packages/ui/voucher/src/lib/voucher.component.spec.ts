import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbVoucherComponent } from './voucher.component';

describe('CbVoucherComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbVoucherComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbVoucherComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
