import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbInlineAlert } from './inline-alert.component';

describe('CbInlineAlert', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbInlineAlert] }).compileComponents();
    const fixture = TestBed.createComponent(CbInlineAlert);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
