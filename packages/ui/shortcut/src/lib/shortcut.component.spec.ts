import { TestBed } from '@angular/core/testing';
import { CbShortcut } from './shortcut.component';

describe('CbShortcut', () => {
  it('emite action al hacer clic en el atajo', () => {
    const fixture = TestBed.createComponent(CbShortcut);
    fixture.componentRef.setInput('label', 'Pagar');
    fixture.detectChanges();
    let clicked = false;
    fixture.componentInstance.action.subscribe(() => (clicked = true));
    fixture.nativeElement.querySelector('button').click();
    expect(clicked).toBe(true);
  });

  it('sin label visible usa ariaLabel como nombre; el icono es decorativo', () => {
    const fixture = TestBed.createComponent(CbShortcut);
    fixture.componentRef.setInput('ariaLabel', 'Pagar servicios');
    fixture.componentRef.setInput('icon', 'house');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Pagar servicios');
    expect(button.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('deshabilitado no emite action', () => {
    const fixture = TestBed.createComponent(CbShortcut);
    fixture.componentRef.setInput('label', 'Pagar');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let clicked = false;
    fixture.componentInstance.action.subscribe(() => (clicked = true));
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('aria-label')).toBe(false);
    button.click();
    expect(clicked).toBe(false);
  });
});
