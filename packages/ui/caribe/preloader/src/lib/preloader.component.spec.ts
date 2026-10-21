import { TestBed } from '@angular/core/testing';
import { CbPreloader } from './preloader.component';

describe('CbPreloader', () => {
  it('renderiza la pantalla de preloader cuando active es true', () => {
    const fixture = TestBed.createComponent(CbPreloader);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cb-preloader')).toBeTruthy();
  });

  it('anuncia el aviso de carga (sin aria-busy, que lo silenciaría) y se oculta al desactivarse', () => {
    const fixture = TestBed.createComponent(CbPreloader);
    fixture.componentRef.setInput('title', 'Sucursal Virtual');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const box = el.querySelector<HTMLElement>('[role="alert"]')!;
    expect(box.hasAttribute('aria-busy')).toBe(false);
    expect(box.querySelector('.cb-preloader__title')!.textContent).toBe('Sucursal Virtual');
    expect(box.querySelector('.cb-preloader__label')!.textContent).toBeTruthy();
    expect(box.querySelector('.cb-preloader__bar')!.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });
});
