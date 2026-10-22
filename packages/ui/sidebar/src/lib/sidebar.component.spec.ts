import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CbAppShell } from './app-shell.component';
import { CbSidebar } from './sidebar.component';
import { CbSidebarToggle } from './sidebar-toggle.directive';
import type { CbSidebarGroup } from './sidebar.types';

const GROUPS: CbSidebarGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Inicio', icon: 'house', url: '/inicio' },
      { label: 'Clientes', icon: 'user', url: '/clientes', badge: 3 },
      {
        label: 'Ajustes',
        icon: 'settings',
        children: [
          { label: 'Perfil', url: '/ajustes/perfil' },
          { label: 'Seguridad', url: '/ajustes/seguridad' },
        ],
      },
    ],
  },
  { label: 'Ayuda', items: [{ label: 'Documentación', icon: 'info', url: 'https://caribeng.dev', target: '_blank' }] },
];

@Component({
  imports: [CbSidebar],
  template: `<cb-sidebar [groups]="groups" [(active)]="active" [(collapsed)]="collapsed" [navigate]="navigate" />`,
})
class SidebarHost {
  groups = GROUPS;
  active = signal<string | null>('/inicio');
  collapsed = signal(false);
  navigate = vi.fn();
}

describe('CbSidebar', () => {
  function setup() {
    const fixture = TestBed.createComponent(SidebarHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const item = (label: string) =>
      Array.from(el.querySelectorAll<HTMLElement>('.cb-sidebar__item')).find((i) => i.querySelector('.cb-sidebar__label')!.textContent === label)!;
    return { fixture, el, item, host: fixture.componentInstance };
  }

  it('es una navegación con secciones nombradas y marca el activo con aria-current', () => {
    const { el, item } = setup();
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Navegación principal');
    const list = el.querySelector('ul')!;
    expect(el.querySelector(`#${list.getAttribute('aria-labelledby')}`)!.textContent).toBe('General');
    expect(item('Inicio').getAttribute('aria-current')).toBe('page');
    expect(item('Clientes').getAttribute('aria-current')).toBeNull();
    expect(item('Clientes').querySelector('.cb-sidebar__badge')!.textContent).toBe('3');
  });

  it('los enlaces internos usan navigate y marcan el activo; los externos navegan normal', () => {
    const { fixture, item, host } = setup();
    const internal = new MouseEvent('click', { bubbles: true, cancelable: true });
    item('Clientes').dispatchEvent(internal);
    fixture.detectChanges();
    expect(internal.defaultPrevented).toBe(true);
    expect(host.navigate).toHaveBeenCalledWith('/clientes');
    expect(host.active()).toBe('/clientes');

    const external = new MouseEvent('click', { bubbles: true, cancelable: true });
    item('Documentación').dispatchEvent(external);
    expect(external.defaultPrevented).toBe(false);
    expect(host.navigate).toHaveBeenCalledTimes(1);
  });

  it('un grupo con hijos se despliega con aria-expanded y se abre solo si contiene el activo', () => {
    const { fixture, el, item, host } = setup();
    const ajustes = item('Ajustes');
    expect(ajustes.getAttribute('aria-expanded')).toBe('false');
    ajustes.click();
    fixture.detectChanges();
    expect(ajustes.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector(`#${ajustes.getAttribute('aria-controls')}`)!.textContent).toContain('Seguridad');
    ajustes.click();
    fixture.detectChanges();
    expect(ajustes.getAttribute('aria-expanded')).toBe('false');

    host.active.set('/ajustes/seguridad');
    fixture.detectChanges();
    expect(item('Ajustes').getAttribute('aria-expanded')).toBe('true');
    expect(item('Ajustes').classList).toContain('cb-sidebar__item--has-active');
  });

  it('contraído conserva los nombres accesibles y el botón del pie lo alterna', () => {
    const { fixture, el, item, host } = setup();
    const collapse = el.querySelector<HTMLButtonElement>('.cb-sidebar__collapse')!;
    expect(collapse.getAttribute('aria-label')).toBe('Contraer menú lateral');
    collapse.click();
    fixture.detectChanges();
    expect(host.collapsed()).toBe(true);
    expect(el.querySelector('cb-sidebar')!.classList).toContain('cb-sidebar--collapsed');
    expect(item('Inicio').textContent).toContain('Inicio');
    expect(collapse.getAttribute('aria-label')).toBe('Expandir menú lateral');
    // Pulsar un grupo contraído expande el sidebar y abre el grupo.
    item('Ajustes').click();
    fixture.detectChanges();
    expect(host.collapsed()).toBe(false);
    expect(item('Ajustes').getAttribute('aria-expanded')).toBe('true');
  });
});

@Component({
  imports: [CbAppShell, CbSidebar, CbSidebarToggle],
  template: `
    <cb-app-shell [forceMobile]="mobile()" [breakpoint]="mobile() ? 768 : 0" [(sidebarOpen)]="open" [(collapsed)]="collapsed">
      <cb-sidebar [groups]="groups" />
      <header cb-app-shell-header><button type="button" id="toggle" cbSidebarToggle>☰</button></header>
      <p>Contenido</p>
    </cb-app-shell>
  `,
})
class ShellHost {
  groups = GROUPS;
  mobile = signal(true);
  open = signal(false);
  collapsed = signal(false);
}

describe('CbAppShell', () => {
  async function setup() {
    const fixture = TestBed.createComponent(ShellHost);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const el = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await settle();
    return { fixture, el, settle, host: fixture.componentInstance, toggle: () => el.querySelector<HTMLButtonElement>('#toggle')!, panel: () => el.querySelector<HTMLElement>('.cb-app-shell__sidebar')! };
  }

  it('en móvil el panel está inerte hasta abrirlo con el toggle, que enfoca el primer enlace', async () => {
    const { el, settle, host, toggle, panel, fixture } = await setup();
    expect(panel().hasAttribute('inert')).toBe(true);
    expect(toggle().getAttribute('aria-controls')).toBe(panel().id);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-label')).toBe('Abrir menú');
    expect(el.querySelector('.cb-sidebar__collapse')).toBeNull();

    toggle().focus();
    toggle().click();
    await settle();
    expect(host.open()).toBe(true);
    expect(panel().hasAttribute('inert')).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.cb-app-shell__backdrop')).not.toBeNull();
    expect(document.activeElement!.textContent).toContain('Inicio');

    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle();
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(toggle());
    fixture.nativeElement.remove();
  });

  it('el fondo y elegir un item cierran el panel móvil', async () => {
    const { el, settle, host, toggle, fixture } = await setup();
    toggle().click();
    await settle();
    el.querySelector<HTMLElement>('.cb-app-shell__backdrop')!.click();
    await settle();
    expect(host.open()).toBe(false);

    toggle().click();
    await settle();
    const link = el.querySelector<HTMLAnchorElement>('a.cb-sidebar__item')!;
    link.addEventListener('click', (e) => e.preventDefault());
    link.click();
    await settle();
    expect(host.open()).toBe(false);
    fixture.nativeElement.remove();
  });

  it('en escritorio el toggle contrae el sidebar', async () => {
    const { el, settle, host, toggle, panel, fixture } = await setup();
    host.mobile.set(false);
    await settle();
    expect(panel().hasAttribute('inert')).toBe(false);
    expect(toggle().getAttribute('aria-label')).toBe('Contraer menú lateral');
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    toggle().click();
    await settle();
    expect(host.collapsed()).toBe(true);
    expect(el.querySelector('cb-sidebar')!.classList).toContain('cb-sidebar--collapsed');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    fixture.nativeElement.remove();
  });
});
