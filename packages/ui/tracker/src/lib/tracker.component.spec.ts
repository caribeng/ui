import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbTrackerComponent } from './tracker.component';

describe('CbTrackerComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbTrackerComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbTrackerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
