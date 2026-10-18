import { TestBed } from '@angular/core/testing';
import { CbLoaderComponent } from './loader.component';

describe('CbLoaderComponent', () => {
  it('muestra el texto de carga dentro de una región role="status"', () => {
    const fixture = TestBed.createComponent(CbLoaderComponent);
    fixture.componentRef.setInput('text', 'Validando datos');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Validando datos');
  });
});
