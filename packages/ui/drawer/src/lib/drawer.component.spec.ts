import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDrawer } from './drawer.component';

@Component({
  imports: [CbDrawer],
  template: `
    <cb-drawer
      [visible]="open()"
      (visibleChange)="open.set($event)"
      (onHide)="hidden = true"
      header="Filtros"
      position="right"
    >
      <p class="cuerpo">Contenido del drawer</p>
    </cb-drawer>
  `,
})
class HostComponent {
  open = signal(false);
  hidden = false;
}

describe('CbDrawer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const drawer = (): HTMLElement | null => document.querySelector('.cb-drawer[role="dialog"]');
    const openDrawer = () => {
      fixture.componentInstance.open.set(true);
      fixture.detectChanges();
      TestBed.tick();
    };
    return { fixture, drawer, openDrawer };
  }

  it('no renderiza el drawer mientras visible es false', () => {
    const { drawer } = setup();
    expect(drawer()).toBeNull();
  });

  it('abre un panel con encabezado, contenido y clase de posición', () => {
    const { drawer, openDrawer } = setup();
    openDrawer();
    expect(drawer()).toBeTruthy();
    expect(drawer()!.getAttribute('aria-modal')).toBe('true');
    expect(drawer()!.classList).toContain('cb-drawer--right');
    expect(document.querySelector('.cb-drawer__title')?.textContent?.trim()).toBe('Filtros');
    expect(document.querySelector('.cb-drawer__body .cuerpo')).toBeTruthy();
  });

  it('el botón cerrar oculta el drawer y emite onHide', () => {
    const { fixture, drawer, openDrawer } = setup();
    openDrawer();
    document.querySelector<HTMLButtonElement>('.cb-drawer__close')!.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.hidden).toBe(true);
    expect(drawer()).toBeNull();
  });
});
