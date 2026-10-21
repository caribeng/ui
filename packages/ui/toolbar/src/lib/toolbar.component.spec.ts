import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbToolbar } from './toolbar.component';

@Component({
  imports: [CbToolbar],
  template: `
    <cb-toolbar ariaLabel="Acciones del editor">
      <div cb-toolbar-start><button class="btn-start">Nuevo</button></div>
      <div cb-toolbar-center><span class="txt-center">Título</span></div>
      <div cb-toolbar-end><button class="btn-end">Exportar</button></div>
    </cb-toolbar>
  `,
})
class HostComponent {}

describe('CbToolbar', () => {
  it('renderiza role="toolbar", aria-label y los tres grupos proyectados', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('cb-toolbar') as HTMLElement;
    expect(host.getAttribute('role')).toBe('toolbar');
    expect(host.getAttribute('aria-label')).toBe('Acciones del editor');
    expect(host.querySelector('.cb-toolbar__start .btn-start')?.textContent).toBe('Nuevo');
    expect(host.querySelector('.cb-toolbar__center .txt-center')?.textContent).toBe('Título');
    expect(host.querySelector('.cb-toolbar__end .btn-end')?.textContent).toBe('Exportar');
  });

  it('sin ariaLabel usa el nombre por defecto del idioma activo', () => {
    const fixture = TestBed.createComponent(CbToolbar);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Barra de herramientas');
  });
});
