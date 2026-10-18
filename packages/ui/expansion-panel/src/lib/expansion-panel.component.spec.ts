import { TestBed } from '@angular/core/testing';
import { CbExpansionPanelComponent } from './expansion-panel.component';

describe('CbExpansionPanelComponent', () => {
  it('alterna expanded al pulsar el encabezado', () => {
    const fixture = TestBed.createComponent(CbExpansionPanelComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.expanded()).toBe(true);
  });
});
