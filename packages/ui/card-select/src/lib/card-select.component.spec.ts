import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardSelectComponent } from './card-select.component';

describe('CbCardSelectComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardSelectComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardSelectComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
