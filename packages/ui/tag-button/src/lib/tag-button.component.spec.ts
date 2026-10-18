import { TestBed } from '@angular/core/testing';
import { CbTagButtonComponent } from './tag-button.component';

describe('CbTagButtonComponent', () => {
  it('alterna el estado selected al hacer clic', () => {
    const fixture = TestBed.createComponent(CbTagButtonComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.selected()).toBe(true);
  });
});
