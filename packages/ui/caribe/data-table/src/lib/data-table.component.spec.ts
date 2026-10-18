import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbDataTable } from './data-table.component';

describe('CbDataTable', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbDataTable] }).compileComponents();
    const fixture = TestBed.createComponent(CbDataTable);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
