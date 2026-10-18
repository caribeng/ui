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
});
