import { TestBed } from '@angular/core/testing';
import { CbLogo } from './logo.component';

describe('CbLogo', () => {
  it('renderiza el SVG del logo con su etiqueta accesible', () => {
    const fixture = TestBed.createComponent(CbLogo);
    fixture.componentRef.setInput('alt', 'Marca Caribe');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-label')).toBe('Marca Caribe');
  });

  it('el SVG es una imagen nombrada con alt', () => {
    const fixture = TestBed.createComponent(CbLogo);
    fixture.componentRef.setInput('alt', 'Banco Caribe');
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Banco Caribe');
  });
});
