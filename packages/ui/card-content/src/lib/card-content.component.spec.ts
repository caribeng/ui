import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardContentComponent } from './card-content.component';

describe('CbCardContentComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardContentComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardContentComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
