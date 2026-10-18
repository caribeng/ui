import { TestBed } from '@angular/core/testing';
import { CbIllustration } from './illustration.component';

describe('CbIllustration', () => {
  it('renderiza la ilustración SVG accesible', () => {
    const fixture = TestBed.createComponent(CbIllustration);
    fixture.componentRef.setInput('alt', 'Éxito en transferencia');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-label')).toBe('Éxito en transferencia');
  });
});
