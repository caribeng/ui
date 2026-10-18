import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbModal } from './modal.component';

describe('CbModal', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbModal] }).compileComponents();
    const fixture = TestBed.createComponent(CbModal);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
