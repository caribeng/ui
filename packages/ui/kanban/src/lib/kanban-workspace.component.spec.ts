import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKanbanWorkspace, type CbKanbanViewType } from './kanban-workspace.component';
import type { CbKanbanCardEvent, CbKanbanColumn } from './kanban-view';
import type { CbKanbanTask } from './kanban-task';

const start = (): CbKanbanColumn<CbKanbanTask>[] => [
  { id: 'todo', title: 'Por hacer', items: [{ id: 'a', title: 'Revisar plan', endDate: '2030-03-12' }] },
  { id: 'done', title: 'Hecho', items: [{ id: 'b', title: 'Publicar', completed: true }] },
];

@Component({
  imports: [CbKanbanWorkspace],
  template: `
    <cb-kanban-workspace
      [(columns)]="columns"
      [(views)]="views"
      [(sideBySide)]="side"
      [multiple]="multiple()"
      editable
      (cardEdit)="log.push($event)"
    />
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn<CbKanbanTask>[]>(start());
  views = signal<readonly CbKanbanViewType[]>(['board']);
  side = signal(false);
  multiple = signal(true);
  log: CbKanbanCardEvent[] = [];
}

async function setup(init?: (h: Host) => void) {
  const fixture = TestBed.createComponent(Host);
  init?.(fixture.componentInstance);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const tab = (view: string) => el.querySelector<HTMLButtonElement>(`.cb-kanban-workspace__tab[data-view="${view}"]`)!;
  const panes = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-kanban-workspace__pane')).map((p) => p.dataset['pane']);
  const pane = (view: string) => el.querySelector<HTMLElement>(`[data-pane="${view}"]`)!;
  const cleanup = () => fixture.nativeElement.remove();
  return { fixture, el, host, settle, tab, panes, pane, cleanup };
}

describe('CbKanbanWorkspace', () => {
  it('ofrece las cinco vistas y muestra la elegida', async () => {
    const { el, tab, panes, pane, cleanup } = await setup();
    const tabs = Array.from(el.querySelectorAll('.cb-kanban-workspace__tab')).map((t) => t.textContent!.trim());
    expect(tabs).toEqual(['Lista', 'Tablero', 'Cronograma', 'Panel', 'Calendario']);
    const group = el.querySelector('.cb-kanban-workspace__tabs')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Vistas');
    expect(el.querySelector('#' + group.getAttribute('aria-describedby'))!.textContent).toBe('Activa varias vistas para verlas a la vez.');
    expect(tab('board').getAttribute('aria-pressed')).toBe('true');
    expect(tab('list').getAttribute('aria-pressed')).toBe('false');
    expect(panes()).toEqual(['board']);
    // Con una sola vista no hay cabecera: la sección se nombra con la vista.
    expect(pane('board').getAttribute('aria-label')).toBe('Tablero');
    expect(pane('board').querySelector('.cb-kanban-workspace__pane-head')).toBeNull();
    expect(pane('board').querySelector('cb-kanban')).toBeTruthy();
    expect(el.querySelector('.cb-kanban-workspace__layout')).toBeNull();
    cleanup();
  });

  it('enciende varias vistas a la vez, en el orden de las pestañas', async () => {
    const { el, host, tab, panes, pane, settle, cleanup } = await setup();
    tab('calendar').click();
    tab('list').click();
    await settle();
    expect(host.views()).toEqual(['list', 'board', 'calendar']);
    expect(panes()).toEqual(['list', 'board', 'calendar']);
    const title = pane('list').querySelector('[role="heading"]')!;
    expect(title.textContent!.trim()).toBe('Lista');
    expect(title.getAttribute('aria-level')).toBe('2');
    expect(pane('list').getAttribute('aria-labelledby')).toBe(title.id);
    expect(pane('list').querySelector('cb-kanban-list')).toBeTruthy();
    expect(pane('calendar').querySelector('cb-kanban-calendar')).toBeTruthy();
    expect(el.querySelector('.cb-kanban-workspace__layout')).toBeTruthy();
    cleanup();
  });

  it('Lado a lado pone las vistas en columnas ([(sideBySide)])', async () => {
    const { el, host, tab, settle, cleanup } = await setup((h) => h.views.set(['list', 'board']));
    const layout = el.querySelector<HTMLButtonElement>('.cb-kanban-workspace__layout')!;
    expect(layout.getAttribute('aria-pressed')).toBe('false');
    layout.click();
    await settle();
    expect(host.side()).toBe(true);
    const panes = el.querySelector<HTMLElement>('.cb-kanban-workspace__panes')!;
    expect(panes.classList).toContain('cb-kanban-workspace__panes--side');
    expect(panes.style.getPropertyValue('--cb-kanban-workspace-panes')).toBe('2');
    // Con una sola vista no hay columnas ni botón.
    tab('list').click();
    await settle();
    expect(panes.classList).not.toContain('cb-kanban-workspace__panes--side');
    expect(el.querySelector('.cb-kanban-workspace__layout')).toBeNull();
    cleanup();
  });

  it('Ocultar quita la vista y devuelve el foco a su botón; la última no se apaga', async () => {
    const { host, tab, pane, panes, settle, cleanup } = await setup((h) => h.views.set(['list', 'board']));
    const hide = pane('list').querySelector<HTMLButtonElement>('.cb-kanban-workspace__hide')!;
    expect(hide.getAttribute('aria-label')).toBe('Ocultar Lista');
    hide.click();
    await settle();
    expect(host.views()).toEqual(['board']);
    expect(document.activeElement).toBe(tab('list'));
    tab('board').click();
    await settle();
    expect(panes()).toEqual(['board']);
    expect(tab('board').getAttribute('aria-pressed')).toBe('true');
    cleanup();
  });

  it('las vistas comparten [(columns)] y reemiten sus eventos', async () => {
    const { host, pane, settle, cleanup } = await setup((h) => h.views.set(['list', 'board']));
    const check = pane('list').querySelector<HTMLButtonElement>('tbody tr[data-key="a"] button[aria-pressed]')!;
    check.click();
    await settle();
    expect(host.columns()[0].items[0].completed).toBe(true);
    expect(host.log.at(-1)!.item.id).toBe('a');
    expect(pane('board').querySelector('.cb-kanban__card-title--completed')!.textContent).toContain('Revisar plan');
    cleanup();
  });

  it('el panel recibe las columnas y baja un nivel sus encabezados', async () => {
    const { pane, cleanup } = await setup((h) => h.views.set(['board', 'dashboard']));
    const dash = pane('dashboard').querySelector('cb-kanban-dashboard')!;
    expect(dash.querySelector('[data-widget="total"] .cb-kanban-dashboard__value')!.textContent!.trim()).toBe('2');
    expect(dash.querySelector('[role="heading"]')!.getAttribute('aria-level')).toBe('3');
    cleanup();
  });

  it('con multiple = false los botones son pestañas', async () => {
    const { el, host, tab, panes, settle, cleanup } = await setup((h) => {
      h.multiple.set(false);
      h.views.set(['list', 'board']);
    });
    expect(panes()).toEqual(['list']);
    expect(el.querySelector('.cb-kanban-workspace__tabs')!.hasAttribute('aria-describedby')).toBe(false);
    tab('timeline').click();
    await settle();
    expect(host.views()).toEqual(['timeline']);
    expect(panes()).toEqual(['timeline']);
    expect(el.querySelector('cb-kanban-timeline')).toBeTruthy();
    cleanup();
  });
});
