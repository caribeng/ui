import { TestBed } from '@angular/core/testing';
import { CbInputDateComponent } from './input-date.component';

describe('CbInputDateComponent', () => {
  it('actualiza el valor ISO de fecha y renderiza la etiqueta', () => {
    const fixture = TestBed.createComponent(CbInputDateComponent);
    fixture.componentRef.setInput('label', 'Fecha de corte');
    fixture.componentRef.setInput('value', '2026-10-17');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Fecha de corte');
    expect(fixture.nativeElement.querySelector('input').value).toBe('2026-10-17');
  });
});
