import { TestBed } from '@angular/core/testing';
import { CbTagButton } from './tag-button.component';

describe('CbTagButton', () => {
  it('alterna el estado selected al hacer clic', () => {
    const fixture = TestBed.createComponent(CbTagButton);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.selected()).toBe(true);
  });
});
