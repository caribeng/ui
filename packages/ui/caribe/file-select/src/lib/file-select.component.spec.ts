import { TestBed } from '@angular/core/testing';
import { CbFileSelect } from './file-select.component';

describe('CbFileSelect', () => {
  it('renderiza el input file con el atributo accept', () => {
    const fixture = TestBed.createComponent(CbFileSelect);
    fixture.componentRef.setInput('accept', '.pdf');
    fixture.detectChanges();
    const inp: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    expect(inp.getAttribute('accept')).toBe('.pdf');
  });
});
