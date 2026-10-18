import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardSelect } from './card-select.component';

describe('CbCardSelect', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardSelect] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardSelect);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
