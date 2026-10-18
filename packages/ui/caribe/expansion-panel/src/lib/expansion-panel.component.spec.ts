import { TestBed } from '@angular/core/testing';
import { CbExpansionPanel } from './expansion-panel.component';

describe('CbExpansionPanel', () => {
  it('alterna expanded al pulsar el encabezado', () => {
    const fixture = TestBed.createComponent(CbExpansionPanel);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.expanded()).toBe(true);
  });
});
