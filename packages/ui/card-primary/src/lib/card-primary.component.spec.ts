import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardPrimaryComponent } from './card-primary.component';

describe('CbCardPrimaryComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardPrimaryComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardPrimaryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
