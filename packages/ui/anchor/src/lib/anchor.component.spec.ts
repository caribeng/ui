import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CbAnchor, type CbAnchorLink } from './anchor.component';

@Component({
  imports: [CbAnchor],
  template: `
    <cb-anchor [links]="links" [offset]="64" (activeChange)="changes.push($event)" />
    <section id="resumen">Resumen</section>
    <section id="movimientos">Movimientos</section>
    <section id="pendientes">Pendientes</section>
  `,
})
class HostComponent {
  links: CbAnchorLink[] = [
    { label: 'Resumen', href: '#resumen' },
    { label: 'Movimientos', href: '#movimientos', children: [{ label: 'Pendientes', href: '#pendientes' }] },
  ];
  changes: (string | null)[] = [];
}

/** Simula la posición de cada sección respecto a la ventana. */
function placeSections(tops: Record<string, number>) {
  for (const [id, top] of Object.entries(tops)) {
    vi.spyOn(document.getElementById(id)!, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
  }
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const anchor = fixture.debugElement.query((d) => d.name === 'cb-anchor').componentInstance as CbAnchor;
  const links = () => Array.from(el.querySelectorAll<HTMLAnchorElement>('.cb-anchor__link'));
  return { fixture, el, anchor, links, host: fixture.componentInstance };
}

describe('CbAnchor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.querySelectorAll('[ng-version]').forEach((n) => n.remove());
  });

  it('es una navegación nombrada "En esta página" con listas anidadas', async () => {
    const { el, links } = await setup();
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('En esta página');
    expect(links().map((l) => l.getAttribute('href'))).toEqual(['#resumen', '#movimientos', '#pendientes']);
    expect(el.querySelectorAll('.cb-anchor__list--nested')).toHaveLength(1);
  });

  it('marca como activa la última sección que ya pasó la cabecera fija', async () => {
    const { fixture, anchor, links, host } = await setup();
    placeSections({ resumen: -500, movimientos: 40, pendientes: 600 });
    anchor.update();
    fixture.detectChanges();
    expect(links()[1].getAttribute('aria-current')).toBe('location');
    expect(links()[0].hasAttribute('aria-current')).toBe(false);
    expect(host.changes.at(-1)).toBe('#movimientos');

    placeSections({ resumen: -900, movimientos: -400, pendientes: 70 });
    anchor.update();
    fixture.detectChanges();
    expect(links()[2].classList).toContain('cb-is-active');
  });

  it('al hacer clic desplaza teniendo en cuenta el offset y deja el foco en la sección', async () => {
    const { fixture, links } = await setup();
    placeSections({ resumen: 0, movimientos: 900, pendientes: 1400 });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    links()[1].click();
    fixture.detectChanges();
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 900 + window.scrollY - 64 }));
    const section = document.getElementById('movimientos')!;
    expect(section.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(section);
    expect(links()[1].getAttribute('aria-current')).toBe('location');
  });
});
