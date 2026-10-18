import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbPopOver } from './pop-over.component';

describe('CbPopOver', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbPopOver] }).compileComponents();
    const fixture = TestBed.createComponent(CbPopOver);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
