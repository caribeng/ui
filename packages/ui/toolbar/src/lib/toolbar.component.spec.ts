import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbToolbarComponent } from './toolbar.component';

@Component({
  imports: [CbToolbarComponent],
  template: `
    <cb-toolbar ariaLabel="Acciones del editor">
      <div cb-toolbar-start><button class="btn-start">Nuevo</button></div>
      <div cb-toolbar-center><span class="txt-center">Título</span></div>
      <div cb-toolbar-end><button class="btn-end">Exportar</button></div>
    </cb-toolbar>
  `,
})
class HostComponent {}

describe('CbToolbarComponent', () => {
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
});
