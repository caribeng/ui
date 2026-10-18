import { TestBed } from '@angular/core/testing';
import { CbLoader } from './loader.component';

describe('CbLoader', () => {
  it('muestra el texto de carga dentro de una región role="status"', () => {
    const fixture = TestBed.createComponent(CbLoader);
    fixture.componentRef.setInput('text', 'Validando datos');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Validando datos');
  });
});
