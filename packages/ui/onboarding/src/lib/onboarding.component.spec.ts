import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbOnboardingComponent } from './onboarding.component';

describe('CbOnboardingComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbOnboardingComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbOnboardingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
