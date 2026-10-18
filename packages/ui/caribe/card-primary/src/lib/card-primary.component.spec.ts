import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardPrimary } from './card-primary.component';

describe('CbCardPrimary', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardPrimary] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardPrimary);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
