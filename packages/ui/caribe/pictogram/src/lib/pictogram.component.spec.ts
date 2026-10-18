import { TestBed } from '@angular/core/testing';
import { CbPictogram } from './pictogram.component';

describe('CbPictogram', () => {
  it('renderiza el pictograma con el nombre configurado', () => {
    const fixture = TestBed.createComponent(CbPictogram);
    fixture.componentRef.setInput('name', 'security');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });
});
