import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardMove } from './card-move.component';

describe('CbCardMove', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardMove] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardMove);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
