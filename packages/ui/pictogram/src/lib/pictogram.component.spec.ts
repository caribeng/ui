import { TestBed } from '@angular/core/testing';
import { CbPictogramComponent } from './pictogram.component';

describe('CbPictogramComponent', () => {
  it('renderiza el pictograma con el nombre configurado', () => {
    const fixture = TestBed.createComponent(CbPictogramComponent);
    fixture.componentRef.setInput('name', 'security');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });
});
