import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbPanel } from './panel.component';

@Component({
  imports: [CbPanel],
  template: `
    <cb-panel
      [header]="header()"
      [toggleable]="toggleable()"
      [(collapsed)]="collapsed"
    >
      <p class="body-content">Contenido interno</p>
      <div cb-panel-footer class="footer-content">Pie de panel</div>
    </cb-panel>
  `,
})
class HostComponent {
  header = signal('Resumen');
  toggleable = signal(true);
  collapsed = signal(false);
}

describe('CbPanel', () => {
  it('renderiza encabezado, cuerpo y pie cuando no está colapsado', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-panel__title')?.textContent).toBe('Resumen');
    expect(el.querySelector('.body-content')?.textContent).toBe('Contenido interno');
    expect(el.querySelector('.footer-content')?.textContent).toBe('Pie de panel');
  });

  it('alterna el estado colapsado con el botón toggler y actualiza aria-expanded', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector<HTMLButtonElement>('.cb-panel__toggler')!;
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    btn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.cb-panel__content')).toBeNull();
  });

  it('oculta el botón toggler si toggleable es false', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.toggleable.set(false);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-panel__toggler')).toBeNull();
  });
  it('la región se nombra solo con el título y aria-controls sigue al estado', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const region = el.querySelector('[role="region"]')!;
    expect(el.querySelector('#' + region.getAttribute('aria-labelledby'))!.textContent!.trim()).toBe('Resumen');
    const toggler = el.querySelector<HTMLButtonElement>('.cb-panel__toggler')!;
    expect(toggler.getAttribute('aria-controls')).toBe(region.id);
    fixture.componentInstance.collapsed.set(true);
    fixture.detectChanges();
    expect(el.querySelector('[role="region"]')).toBeNull();
    expect(toggler.hasAttribute('aria-controls')).toBe(false);
  });
});
