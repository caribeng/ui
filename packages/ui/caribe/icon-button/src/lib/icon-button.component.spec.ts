import { TestBed } from '@angular/core/testing';
import { CbIconButton } from './icon-button.component';

describe('CbIconButton', () => {
  it('renderiza el botón circular con su aria-label', () => {
    const fixture = TestBed.createComponent(CbIconButton);
    fixture.componentRef.setInput('ariaLabel', 'Agregar favorito');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe('Agregar favorito');
  });
});
