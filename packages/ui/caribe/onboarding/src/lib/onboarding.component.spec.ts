import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbOnboarding } from './onboarding.component';

describe('CbOnboarding', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbOnboarding] }).compileComponents();
    const fixture = TestBed.createComponent(CbOnboarding);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
