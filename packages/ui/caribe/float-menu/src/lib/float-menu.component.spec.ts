import { TestBed } from '@angular/core/testing';
import { CbFloatMenu } from './float-menu.component';

describe('CbFloatMenu', () => {
  it('renderiza los botones del menú flotante', () => {
    const fixture = TestBed.createComponent(CbFloatMenu);
    fixture.componentRef.setInput('items', [{ id: 'home', label: 'Inicio' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Inicio');
  });
});
