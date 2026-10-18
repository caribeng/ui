import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbStatusComponent } from './status.component';

describe('CbStatusComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbStatusComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbStatusComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
