import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbAlertComponent } from './alert.component';

describe('CbAlertComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbAlertComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbAlertComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
