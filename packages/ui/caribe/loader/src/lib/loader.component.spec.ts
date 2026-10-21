import { TestBed } from '@angular/core/testing';
import { CbLoader } from './loader.component';

describe('CbLoader', () => {
  it('muestra el texto de carga dentro de una región role="status"', () => {
    const fixture = TestBed.createComponent(CbLoader);
    fixture.componentRef.setInput('text', 'Validando datos');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Validando datos');
  });

  it('es un status que anuncia el texto, con el spinner decorativo y la clase de tamaño', () => {
    const fixture = TestBed.createComponent(CbLoader);
    fixture.componentRef.setInput('text', 'Procesando pago');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const box = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')!;
    expect(box.getAttribute('aria-live')).toBe('polite');
    expect(box.classList).toContain('cb-loader--lg');
    expect(box.querySelector('.cb-loader__spinner')!.getAttribute('aria-hidden')).toBe('true');
    expect(box.querySelector('.cb-loader__text')!.textContent).toBe('Procesando pago');
  });
});
