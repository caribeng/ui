import { TestBed } from '@angular/core/testing';
import { CbShortcutComponent } from './shortcut.component';

describe('CbShortcutComponent', () => {
  it('emite action al hacer clic en el atajo', () => {
    const fixture = TestBed.createComponent(CbShortcutComponent);
    fixture.componentRef.setInput('label', 'Pagar');
    fixture.detectChanges();
    let clicked = false;
    fixture.componentInstance.action.subscribe(() => (clicked = true));
    fixture.nativeElement.querySelector('button').click();
    expect(clicked).toBe(true);
  });
});
