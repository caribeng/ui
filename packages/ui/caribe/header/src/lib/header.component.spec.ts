import { TestBed } from '@angular/core/testing';
import { CbHeader } from './header.component';

describe('CbHeader', () => {
  it('renderiza el título del encabezado', () => {
    const fixture = TestBed.createComponent(CbHeader);
    fixture.componentRef.setInput('title', 'Sucursal Virtual');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sucursal Virtual');
  });

  it('muestra subtítulo y el botón Atrás con nombre que emite backClick', () => {
    const fixture = TestBed.createComponent(CbHeader);
    fixture.componentRef.setInput('title', 'Transferir');
    fixture.componentRef.setInput('subtitle', 'Paso 1');
    fixture.componentRef.setInput('showBack', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-header__subtitle')!.textContent).toBe('Paso 1');
    const back = el.querySelector<HTMLButtonElement>('.cb-header__back')!;
    expect(back.getAttribute('aria-label')).toBe('Atrás');
    let clicks = 0;
    fixture.componentInstance.backClick.subscribe(() => clicks++);
    back.click();
    expect(clicks).toBe(1);
  });

  it('sin showBack ni subtítulo no los renderiza', () => {
    const fixture = TestBed.createComponent(CbHeader);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-header__back')).toBeNull();
    expect(el.querySelector('.cb-header__subtitle')).toBeNull();
    expect(el.querySelector('header')).not.toBeNull();
  });
});
