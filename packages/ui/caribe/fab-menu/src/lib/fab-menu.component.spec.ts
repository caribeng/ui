import { TestBed } from '@angular/core/testing';
import { CbFabMenu } from './fab-menu.component';

describe('CbFabMenu', () => {
  it('despliega las opciones cuando open es true', () => {
    const fixture = TestBed.createComponent(CbFabMenu);
    fixture.componentRef.setInput('items', [{ id: '1', label: 'Enviar dinero' }]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(1);
  });
});
