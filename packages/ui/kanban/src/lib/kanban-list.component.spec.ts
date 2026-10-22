import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKanban } from './kanban.component';
import { CbKanbanList } from './kanban-list.component';
import type { CbKanbanCardEvent, CbKanbanColumn, CbKanbanMove } from './kanban-view';
import { formatDateRange, type CbKanbanPerson, type CbKanbanTask } from './kanban-task';

const people: CbKanbanPerson[] = [
  { id: 'laura', name: 'Laura Gómez' },
  { id: 'mateo', name: 'Mateo Ruiz' },
];

const start = (): CbKanbanColumn<CbKanbanTask>[] => [
  {
    id: 'new',
    title: 'Solicitudes nuevas',
    items: [
      { id: 'a', title: 'Revisar plan', assignees: ['laura', 'mateo'], priority: 'medium', startDate: '2030-03-10', endDate: '2030-03-14' },
      { id: 'b', title: 'Enviar comentarios', priority: 'low', endDate: '2020-01-01' },
    ],
  },
  { id: 'active', title: 'Activo', items: [{ id: 'c', title: 'Escalar problema', priority: 'high' }] },
  { id: 'done', title: 'Se finalizó', items: [] },
];

@Component({
  imports: [CbKanbanList, CbKanban],
  template: `
    <cb-kanban-list
      [(columns)]="columns"
      [people]="people"
      [details]="details()"
      [editable]="editable()"
      [addable]="addable()"
      [columnsEditable]="columnsEditable()"
      (cardEdit)="log.push(['edit', $event])"
      (cardAdd)="log.push(['add', $event])"
      (cardMove)="moves.push($event)"
    />
    @if (withBoard()) {
      <cb-kanban [(columns)]="columns" />
    }
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn<CbKanbanTask>[]>(start());
  people = people;
  details = signal(false);
  editable = signal(true);
  addable = signal(false);
  columnsEditable = signal(false);
  withBoard = signal(false);
  log: [string, CbKanbanCardEvent][] = [];
  moves: CbKanbanMove[] = [];
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
  const list = () => el.querySelector<HTMLElement>('cb-kanban-list')!;
  const row = (title: string) => Array.from(list().querySelectorAll<HTMLElement>('.cb-kanban-list__row')).find((r) => r.textContent!.includes(title))!;
  const ids = () => host.columns().map((c) => c.items.map((t) => t.id));
  const key = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const cleanup = () => fixture.nativeElement.remove();
  return { fixture, el, host, settle, list, row, ids, key, cleanup };
}

describe('CbKanbanList', () => {
  it('pinta una tabla con una sección por columna y responsables, fechas y prioridad por fila', async () => {
    const { list, row, cleanup } = await setup();
    const headers = Array.from(list().querySelectorAll('thead th')).map((th) => th.textContent!.trim());
    expect(headers).toEqual(['Nombre', 'Responsables', 'Fechas', 'Prioridad']);
    const sections = Array.from(list().querySelectorAll('.cb-kanban-list__toggle'));
    expect(sections.map((s) => s.getAttribute('aria-label'))).toEqual(['Solicitudes nuevas, 2 tareas', 'Activo, 1 tareas', 'Se finalizó, 0 tareas']);
    expect(list().querySelectorAll('th[scope="rowgroup"]').length).toBe(3);

    const r = row('Revisar plan');
    expect(r.querySelector('.cb-kanban-list__person-name')!.textContent).toBe('Laura Gómez');
    expect(r.querySelector('.cb-kanban-list__more')!.textContent).toBe('+1');
    expect(r.querySelector('.cb-kanban-list__sr')!.textContent).toContain('Laura Gómez, Mateo Ruiz');
    expect(r.querySelector('.cb-kanban-list__date')!.textContent).toContain('10 – 14');
    expect(r.querySelector('.cb-kanban-list__priority')!.textContent).toBe('Media');
    expect(r.querySelector('.cb-kanban-list__priority')!.getAttribute('data-severity')).toBe('warning');
    // Sin responsable: marcador visual y texto para lectores.
    expect(row('Escalar problema').querySelector('.cb-kanban-list__people')!.textContent).toContain('Sin responsable');
    // Fin pasado: vencida.
    expect(row('Enviar comentarios').querySelector('.cb-kanban-list__date--overdue')!.textContent).toContain('vencida');
    cleanup();
  });

  it('contrae y expande secciones', async () => {
    const { list, settle, cleanup } = await setup();
    const toggle = list().querySelector<HTMLButtonElement>('[data-section="new"]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await settle();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(list().querySelectorAll('.cb-kanban-list__row').length).toBe(1);
    toggle.click();
    await settle();
    expect(list().querySelectorAll('.cb-kanban-list__row').length).toBe(3);
    cleanup();
  });

  it('el círculo marca la tarea como finalizada (aria-pressed) y emite cardEdit', async () => {
    const { row, settle, host, cleanup } = await setup();
    const check = row('Revisar plan').querySelector<HTMLButtonElement>('.cb-kanban-list__check')!;
    expect(check.getAttribute('aria-label')).toBe('Marcar «Revisar plan» como finalizada');
    expect(check.getAttribute('aria-pressed')).toBe('false');
    check.click();
    await settle();
    expect(host.columns()[0].items[0].completed).toBe(true);
    expect(row('Revisar plan').classList).toContain('cb-kanban-list__row--completed');
    expect(row('Revisar plan').querySelector('.cb-kanban-list__check')!.getAttribute('aria-pressed')).toBe('true');
    expect(host.log.at(-1)![0]).toBe('edit');
    // Una tarea finalizada ya no se marca como vencida.
    row('Enviar comentarios').querySelector<HTMLButtonElement>('.cb-kanban-list__check')!.click();
    await settle();
    expect(row('Enviar comentarios').querySelector('.cb-kanban-list__date--overdue')).toBeNull();
    cleanup();
  });

  it('Alt + flechas mueve la fila dentro de su sección y a la sección vecina', async () => {
    const { row, key, ids, host, cleanup } = await setup();
    await key(row('Revisar plan').querySelector('.cb-kanban-list__name')!, 'ArrowDown', { altKey: true });
    expect(ids()).toEqual([['b', 'a'], ['c'], []]);
    await key(row('Revisar plan').querySelector('.cb-kanban-list__name')!, 'ArrowDown', { altKey: true });
    expect(ids()).toEqual([['b'], ['a', 'c'], []]);
    expect(host.moves.at(-1)).toMatchObject({ from: 'new', to: 'active', toIndex: 0 });
    expect(document.activeElement).toBe(row('Revisar plan').querySelector('.cb-kanban-list__name'));
    // Sin Alt no se mueve.
    await key(row('Revisar plan').querySelector('.cb-kanban-list__name')!, 'ArrowUp');
    expect(ids()).toEqual([['b'], ['a', 'c'], []]);
    cleanup();
  });

  it('sin editable no hay círculo ni se mueven filas', async () => {
    const { row, key, ids, cleanup } = await setup((h) => h.editable.set(false));
    expect(row('Revisar plan').querySelector('button.cb-kanban-list__check')).toBeNull();
    await key(row('Revisar plan').querySelector('.cb-kanban-list__name')!, 'ArrowDown', { altKey: true });
    expect(ids()).toEqual([['a', 'b'], ['c'], []]);
    cleanup();
  });

  it('añade tareas desde la sección (Enter, y el campo sigue abierto) y desde la barra', async () => {
    const { list, settle, key, ids, host, cleanup } = await setup((h) => h.addable.set(true));
    list().querySelector<HTMLButtonElement>('[data-add="done"]')!.click();
    await settle();
    const field = list().querySelector<HTMLInputElement>('.cb-kanban-list__composer')!;
    expect(document.activeElement).toBe(field);
    field.value = 'Cerrar acta';
    await key(field, 'Enter');
    expect(host.columns()[2].items.map((t) => t.title)).toEqual(['Cerrar acta']);
    expect(host.log.at(-1)![1].column).toBe('done');
    expect(list().querySelector('.cb-kanban-list__composer')).toBeTruthy();
    await key(list().querySelector('.cb-kanban-list__composer')!, 'Escape');
    expect(list().querySelector('.cb-kanban-list__composer')).toBeNull();
    expect(document.activeElement).toBe(list().querySelector('[data-add="done"]'));

    list().querySelector<HTMLButtonElement>('[data-add-top]')!.click();
    await settle();
    const top = list().querySelector<HTMLInputElement>('.cb-kanban-list__composer')!;
    top.value = 'Nueva';
    await key(top, 'Enter');
    expect(ids()[0].length).toBe(3);
    cleanup();
  });

  it('renombra y añade secciones', async () => {
    const { list, settle, key, host, cleanup } = await setup((h) => h.columnsEditable.set(true));
    list().querySelector<HTMLButtonElement>('[aria-label="Renombrar: Activo"]')!.click();
    await settle();
    const input = list().querySelector<HTMLInputElement>('.cb-kanban-list__rename')!;
    input.value = 'En curso';
    await key(input, 'Enter');
    expect(host.columns()[1].title).toBe('En curso');
    expect(document.activeElement).toBe(list().querySelector('[data-section="active"]'));

    list().querySelector<HTMLButtonElement>('.cb-kanban-list__add-section')!.click();
    await settle();
    expect(host.columns().length).toBe(4);
    const name = list().querySelector<HTMLInputElement>('.cb-kanban-list__rename')!;
    expect(document.activeElement).toBe(name);
    name.value = 'Bloqueado';
    await key(name, 'Enter');
    expect(host.columns()[3].title).toBe('Bloqueado');
    cleanup();
  });

  it('con details abre el panel de la tarea al pulsar el nombre', async () => {
    const { row, settle, cleanup } = await setup((h) => h.details.set(true));
    const name = row('Revisar plan').querySelector<HTMLButtonElement>('.cb-kanban-list__name')!;
    expect(name.getAttribute('aria-haspopup')).toBe('dialog');
    name.click();
    await settle();
    const panel = document.querySelector<HTMLElement>('.cdk-overlay-container cb-kanban-task-panel')!;
    expect(panel.querySelector<HTMLTextAreaElement>('.cb-ktp__title')!.value).toBe('Revisar plan');
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    cleanup();
  });

  it('lista y tablero a la vez sobre las mismas columnas: un cambio en una se ve en la otra', async () => {
    const { el, row, key, settle, cleanup } = await setup((h) => h.withBoard.set(true));
    const boardTitles = () =>
      Array.from(el.querySelectorAll('cb-kanban .cb-kanban__column')).map((c) =>
        Array.from(c.querySelectorAll('.cb-kanban__card-title')).map((t) => t.textContent),
      );
    // "Enviar comentarios" es la última de su sección: baja al inicio de "Activo".
    await key(row('Enviar comentarios').querySelector('.cb-kanban-list__name')!, 'ArrowDown', { altKey: true });
    await settle();
    expect(boardTitles().map((c) => c.map((t) => t!.trim()))).toEqual([['Revisar plan'], ['Enviar comentarios', 'Escalar problema'], []]);
    // Finalizar en la lista se ve en la tarjeta del tablero.
    row('Revisar plan').querySelector<HTMLButtonElement>('.cb-kanban-list__check')!.click();
    await settle();
    const title = el.querySelector('cb-kanban .cb-kanban__card-title')!;
    expect(title.classList).toContain('cb-kanban__card-title--completed');
    expect(title.textContent).toContain('Finalizada:');
    cleanup();
  });
});

describe('formatDateRange con "Hoy"', () => {
  it('nombra el día de hoy', () => {
    const now = new Date(2030, 2, 10);
    expect(formatDateRange(new Date(2030, 2, 10), new Date(2030, 2, 14), 'es', 'Hoy', now)).toMatch(/^Hoy – 14 mar/);
    expect(formatDateRange(null, new Date(2030, 2, 10), 'es', 'Hoy', now)).toBe('Hoy');
    expect(formatDateRange(new Date(2030, 2, 12), new Date(2030, 2, 12), 'es', 'Hoy', now)).toMatch(/^12 mar/);
  });
});
