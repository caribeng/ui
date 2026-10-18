import { TestBed } from '@angular/core/testing';
import { CbStroke } from './stroke.component';

describe('CbStroke', () => {
  it('renderiza el trazo SVG decorativo oculto para lectores por defecto', () => {
    const fixture = TestBed.createComponent(CbStroke);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
