import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbModalComponent } from './modal.component';

describe('CbModalComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbModalComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbModalComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
