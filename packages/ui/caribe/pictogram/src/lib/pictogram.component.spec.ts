import { TestBed } from '@angular/core/testing';
import { CbPictogram } from './pictogram.component';

describe('CbPictogram', () => {
  it('renderiza el pictograma con el nombre configurado', () => {
    const fixture = TestBed.createComponent(CbPictogram);
    fixture.componentRef.setInput('name', 'security');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('es una imagen nombrada con alt o con el nombre por defecto', () => {
    const fixture = TestBed.createComponent(CbPictogram);
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBeTruthy();
    fixture.componentRef.setInput('alt', 'Seguridad');
    fixture.detectChanges();
    expect(svg.getAttribute('aria-label')).toBe('Seguridad');
  });
});
