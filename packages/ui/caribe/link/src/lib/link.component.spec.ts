import { TestBed } from '@angular/core/testing';
import { CbLink } from './link.component';

describe('CbLink', () => {
  it('configura rel="noopener noreferrer" cuando external es true', () => {
    const fixture = TestBed.createComponent(CbLink);
    fixture.componentRef.setInput('label', 'Términos');
    fixture.componentRef.setInput('external', true);
    fixture.detectChanges();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('rel')).toContain('noopener');
  });

  it('un enlace externo abre otra pestaña y lo avisa al lector de pantalla', () => {
    const fixture = TestBed.createComponent(CbLink);
    fixture.componentRef.setInput('label', 'Términos');
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.componentRef.setInput('external', true);
    fixture.detectChanges();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.querySelector('.cb-link__external')!.getAttribute('aria-hidden')).toBe('true');
    expect(a.querySelector('.cb-link__sr')!.textContent).toBe('(se abre en una pestaña nueva)');
  });

  it('un enlace interno no abre otra pestaña ni añade el aviso', () => {
    const fixture = TestBed.createComponent(CbLink);
    fixture.componentRef.setInput('href', '/ayuda');
    fixture.detectChanges();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('href')).toBe('/ayuda');
    expect(a.hasAttribute('target')).toBe(false);
    expect(a.querySelector('.cb-link__sr')).toBeNull();
  });

  it('deshabilitado quita el href, sale del orden de tabulación y expone aria-disabled', () => {
    const fixture = TestBed.createComponent(CbLink);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.hasAttribute('href')).toBe(false);
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.getAttribute('aria-disabled')).toBe('true');
    expect(a.getAttribute('role')).toBe('link');
  });
});
