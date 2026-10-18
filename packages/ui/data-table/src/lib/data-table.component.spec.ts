import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbDataTableComponent } from './data-table.component';

describe('CbDataTableComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbDataTableComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbDataTableComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
