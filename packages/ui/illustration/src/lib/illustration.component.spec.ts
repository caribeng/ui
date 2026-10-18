import { TestBed } from '@angular/core/testing';
import { CbIllustrationComponent } from './illustration.component';

describe('CbIllustrationComponent', () => {
  it('renderiza la ilustración SVG accesible', () => {
    const fixture = TestBed.createComponent(CbIllustrationComponent);
    fixture.componentRef.setInput('alt', 'Éxito en transferencia');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-label')).toBe('Éxito en transferencia');
  });
});
