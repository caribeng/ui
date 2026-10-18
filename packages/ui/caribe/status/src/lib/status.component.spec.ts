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
});
