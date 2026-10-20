import { TestBed } from '@angular/core/testing';
import { CbFooter } from './footer.component';

describe('CbFooter', () => {
  it('renderiza el texto legal del pie de página', () => {
    const fixture = TestBed.createComponent(CbFooter);
    fixture.componentRef.setInput('copyright', '© 2026 CaribeNG');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('© 2026 CaribeNG');
  });

  it('no muestra texto legal si copyright está vacío', () => {
    const fixture = TestBed.createComponent(CbFooter);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('©');
  });
});
