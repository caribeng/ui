import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCoachmarkComponent } from './coachmark.component';

describe('CbCoachmarkComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCoachmarkComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCoachmarkComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
