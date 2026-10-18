import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardContent } from './card-content.component';

describe('CbCardContent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardContent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardContent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
