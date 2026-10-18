import { TestBed } from '@angular/core/testing';
import { CbFloatMenuComponent } from './float-menu.component';

describe('CbFloatMenuComponent', () => {
  it('renderiza los botones del menú flotante', () => {
    const fixture = TestBed.createComponent(CbFloatMenuComponent);
    fixture.componentRef.setInput('items', [{ id: 'home', label: 'Inicio' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Inicio');
  });
});
