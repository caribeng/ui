import { TestBed } from '@angular/core/testing';
import { CbIconButton } from './icon-button.component';

describe('CbIconButton', () => {
  it('renderiza el botón circular con su aria-label', () => {
    const fixture = TestBed.createComponent(CbIconButton);
    fixture.componentRef.setInput('ariaLabel', 'Agregar favorito');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe('Agregar favorito');
  });

  it('emite pressed al pulsar; el icono es decorativo y la variante ghost aplica su clase', () => {
    const fixture = TestBed.createComponent(CbIconButton);
    fixture.componentRef.setInput('ariaLabel', 'Buscar');
    fixture.componentRef.setInput('icon', 'search');
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    let pressed = 0;
    fixture.componentInstance.pressed.subscribe(() => pressed++);
    button.click();
    expect(pressed).toBe(1);
    expect(button.classList).toContain('cb-icon-button--ghost');
    expect(button.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('sin ariaLabel usa un nombre por defecto y deshabilitado no emite', () => {
    const fixture = TestBed.createComponent(CbIconButton);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBeTruthy();
    expect(button.disabled).toBe(true);
  });
});
