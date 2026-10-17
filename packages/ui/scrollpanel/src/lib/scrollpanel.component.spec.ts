import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbScrollPanelComponent } from './scrollpanel.component';

@Component({
  imports: [CbScrollPanelComponent],
  template: `
    <cb-scroll-panel width="300px" height="160px" ariaLabel="Historial">
      <p class="scroll-inner">Línea 1</p>
    </cb-scroll-panel>
  `,
})
class HostComponent {}

describe('CbScrollPanelComponent', () => {
  it('aplica dimensiones, role="region", aria-label y proyecta contenido', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('cb-scroll-panel') as HTMLElement;
    const viewport = host.querySelector('.cb-scroll-panel__viewport') as HTMLElement;

    expect(host.style.width).toBe('300px');
    expect(host.style.height).toBe('160px');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Historial');
    expect(host.querySelector('.scroll-inner')?.textContent).toBe('Línea 1');
  });
});
