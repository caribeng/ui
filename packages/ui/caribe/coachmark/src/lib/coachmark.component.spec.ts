import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCoachmark } from './coachmark.component';

describe('CbCoachmark', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCoachmark] }).compileComponents();
    const fixture = TestBed.createComponent(CbCoachmark);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
