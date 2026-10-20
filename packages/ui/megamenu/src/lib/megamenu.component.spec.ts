import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbMegaMenu, type CbMegaMenuItem } from './megamenu.component';

@Component({ imports: [CbMegaMenu], template: `<cb-megamenu [items]="items" (itemSelect)="selected=$event.label" />` })
class HostComponent {
  items: CbMegaMenuItem[] = [
    { label: 'Productos', groups: [{ label: 'Audio', items: [{ label: 'Auriculares' }] }, { label: 'Video', items: [{ label: 'Monitores', url: '/monitors' }] }] },
    { label: 'Servicios', groups: [{ label: 'Soporte', items: [{ label: 'Ayuda' }] }] },
  ];
  selected = '';
}

describe('CbMegaMenu', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('opens category panels with grouped columns', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.cb-megamenu__group')).toHaveLength(2);
  });
  it('emits link selection and closes the panel', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('.cb-megamenu__link')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Auriculares');
    expect(fixture.nativeElement.querySelector('.cb-megamenu__panel')).toBeNull();
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const triggers = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-megamenu__trigger'));
    const key = (k: string) => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, el, triggers, key };
  }

  it('las flechas recorren las categorías y relacionan el panel con aria-controls', () => {
    const { el, triggers, key } = setup();
    triggers()[0].focus();
    key('ArrowRight');
    expect(document.activeElement).toBe(triggers()[1]);
    key('ArrowRight'); // vuelve al inicio
    expect(document.activeElement).toBe(triggers()[0]);
    triggers()[0].click();
    TestBed.tick();
    const panel = el.querySelector('.cb-megamenu__panel')!;
    expect(triggers()[0].getAttribute('aria-controls')).toBe(panel.id);
    expect(triggers()[0].hasAttribute('aria-haspopup')).toBe(false);
  });

  it('↓ abre el panel y entra al primer enlace; Escape vuelve a la categoría', async () => {
    const { el, triggers, key } = setup();
    triggers()[0].focus();
    key('ArrowDown');
    TestBed.tick();
    const links = Array.from(el.querySelectorAll<HTMLElement>('.cb-megamenu__link'));
    expect(document.activeElement).toBe(links[0]);
    key('ArrowDown');
    expect(document.activeElement).toBe(links[1]);
    key('Escape');
    expect(el.querySelector('.cb-megamenu__panel')).toBeNull();
    expect(document.activeElement).toBe(triggers()[0]);
  });
});
