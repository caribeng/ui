import { TestBed } from '@angular/core/testing';
import { CbHeaderComponent } from './header.component';

describe('CbHeaderComponent', () => {
  it('renderiza el título del encabezado', () => {
    const fixture = TestBed.createComponent(CbHeaderComponent);
    fixture.componentRef.setInput('title', 'Sucursal Virtual');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sucursal Virtual');
  });
});
