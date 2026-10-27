import { TestBed } from '@angular/core/testing';
import { CbIllustration } from './illustration.component';

describe('CbIllustration', () => {
  it('renderiza la ilustración SVG accesible', () => {
    const fixture = TestBed.createComponent(CbIllustration);
    fixture.componentRef.setInput('alt', 'Éxito en transferencia');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-label')).toBe('Éxito en transferencia');
  });

  it('es una imagen nombrada con alt o con el nombre por defecto', () => {
    const fixture = TestBed.createComponent(CbIllustration);
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBeTruthy();
    fixture.componentRef.setInput('alt', 'Transferencia completada');
    fixture.detectChanges();
    expect(svg.getAttribute('aria-label')).toBe('Transferencia completada');
  });
});
