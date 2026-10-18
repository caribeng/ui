import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbPopOverComponent } from './pop-over.component';

describe('CbPopOverComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbPopOverComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbPopOverComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
