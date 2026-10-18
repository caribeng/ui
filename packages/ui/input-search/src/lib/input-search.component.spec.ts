import { TestBed } from '@angular/core/testing';
import { CbInputSearchComponent } from './input-search.component';

describe('CbInputSearchComponent', () => {
  it('permite limpiar el término buscado con clear()', () => {
    const fixture = TestBed.createComponent(CbInputSearchComponent);
    fixture.componentRef.setInput('value', 'Caribe');
    fixture.detectChanges();
    fixture.componentInstance.clear();
    expect(fixture.componentInstance.value()).toBe('');
  });
});
