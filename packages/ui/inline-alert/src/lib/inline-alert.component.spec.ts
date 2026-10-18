import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbInlineAlertComponent } from './inline-alert.component';

describe('CbInlineAlertComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbInlineAlertComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbInlineAlertComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
