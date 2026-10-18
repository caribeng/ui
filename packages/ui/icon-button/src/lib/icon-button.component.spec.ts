import { TestBed } from '@angular/core/testing';
import { CbIconButtonComponent } from './icon-button.component';

describe('CbIconButtonComponent', () => {
  it('renderiza el botón circular con su aria-label', () => {
    const fixture = TestBed.createComponent(CbIconButtonComponent);
    fixture.componentRef.setInput('ariaLabel', 'Agregar favorito');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe('Agregar favorito');
  });
});
