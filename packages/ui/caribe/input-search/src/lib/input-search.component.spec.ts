import { TestBed } from '@angular/core/testing';
import { CbInputSearch } from './input-search.component';

describe('CbInputSearch', () => {
  it('permite limpiar el término buscado con clear()', () => {
    const fixture = TestBed.createComponent(CbInputSearch);
    fixture.componentRef.setInput('value', 'Caribe');
    fixture.detectChanges();
    fixture.componentInstance.clear();
    expect(fixture.componentInstance.value()).toBe('');
  });
});
