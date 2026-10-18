import { TestBed } from '@angular/core/testing';
import { CbFabMenuComponent } from './fab-menu.component';

describe('CbFabMenuComponent', () => {
  it('despliega las opciones cuando open es true', () => {
    const fixture = TestBed.createComponent(CbFabMenuComponent);
    fixture.componentRef.setInput('items', [{ id: '1', label: 'Enviar dinero' }]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(1);
  });
});
