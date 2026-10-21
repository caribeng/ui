import { TestBed } from '@angular/core/testing';
import { CbStroke } from './stroke.component';

describe('CbStroke', () => {
  it('renderiza el trazo SVG decorativo oculto para lectores por defecto', () => {
    const fixture = TestBed.createComponent(CbStroke);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('es decorativo por defecto y, si no, una imagen con nombre', () => {
    const fixture = TestBed.createComponent(CbStroke);
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);

    fixture.componentRef.setInput('ariaHidden', false);
    fixture.componentRef.setInput('alt', 'Subrayado');
    fixture.detectChanges();
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Subrayado');
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });
});
