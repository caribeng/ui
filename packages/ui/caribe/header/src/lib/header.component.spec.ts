import { TestBed } from '@angular/core/testing';
import { CbHeader } from './header.component';

describe('CbHeader', () => {
  it('renderiza el título del encabezado', () => {
    const fixture = TestBed.createComponent(CbHeader);
    fixture.componentRef.setInput('title', 'Sucursal Virtual');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sucursal Virtual');
  });
});
