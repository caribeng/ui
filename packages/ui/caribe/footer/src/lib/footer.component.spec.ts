import { TestBed } from '@angular/core/testing';
import { CbFooter } from './footer.component';

describe('CbFooter', () => {
  it('renderiza el texto legal del pie de página', () => {
    const fixture = TestBed.createComponent(CbFooter);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CaribeNG');
  });
});
