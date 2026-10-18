import { TestBed } from '@angular/core/testing';
import { CbStrokeComponent } from './stroke.component';

describe('CbStrokeComponent', () => {
  it('renderiza el trazo SVG decorativo oculto para lectores por defecto', () => {
    const fixture = TestBed.createComponent(CbStrokeComponent);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
