import { TestBed } from '@angular/core/testing';
import { CbInputSelect } from './input-select.component';

describe('CbInputSelect', () => {
  it('renderiza las opciones configuradas', () => {
    const fixture = TestBed.createComponent(CbInputSelect);
    fixture.componentRef.setInput('options', [
      { label: 'Ahorros', value: 'ahorros' },
      { label: 'Corriente', value: 'corriente' },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('option').length).toBeGreaterThanOrEqual(2);
  });
});
