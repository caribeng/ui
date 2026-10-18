import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbAlert } from './alert.component';

describe('CbAlert', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbAlert] }).compileComponents();
    const fixture = TestBed.createComponent(CbAlert);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
