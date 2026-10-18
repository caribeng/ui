import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardMoveComponent } from './card-move.component';

describe('CbCardMoveComponent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardMoveComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardMoveComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
