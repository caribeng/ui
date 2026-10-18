import { TestBed } from '@angular/core/testing';
import { CbFooterComponent } from './footer.component';

describe('CbFooterComponent', () => {
  it('renderiza el texto legal del pie de página', () => {
    const fixture = TestBed.createComponent(CbFooterComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CaribeNG');
  });
});
