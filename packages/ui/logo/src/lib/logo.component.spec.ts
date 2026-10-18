import { TestBed } from '@angular/core/testing';
import { CbLogoComponent } from './logo.component';

describe('CbLogoComponent', () => {
  it('renderiza el SVG del logo con su etiqueta accesible', () => {
    const fixture = TestBed.createComponent(CbLogoComponent);
    fixture.componentRef.setInput('alt', 'Marca Caribe');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-label')).toBe('Marca Caribe');
  });
});
