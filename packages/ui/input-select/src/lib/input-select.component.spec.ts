import { TestBed } from '@angular/core/testing';
import { CbInputSelectComponent } from './input-select.component';

describe('CbInputSelectComponent', () => {
  it('renderiza las opciones configuradas', () => {
    const fixture = TestBed.createComponent(CbInputSelectComponent);
    fixture.componentRef.setInput('options', [
      { label: 'Ahorros', value: 'ahorros' },
      { label: 'Corriente', value: 'corriente' },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('option').length).toBeGreaterThanOrEqual(2);
  });
});
