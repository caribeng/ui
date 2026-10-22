import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CbKanbanTimeline } from './kanban-timeline.component';
import type { CbKanbanCardEvent, CbKanbanColumn, CbKanbanMove } from './kanban-view';
import { toIsoDay, type CbKanbanPerson, type CbKanbanTask } from './kanban-task';

const people: CbKanbanPerson[] = [{ id: 'laura', name: 'Laura Gómez' }];

// Se ven 14 días: del viernes 8 al jueves 21 de marzo de 2030 (9 y 10 son fin de semana).
const start = (): CbKanbanColumn<CbKanbanTask>[] => [
  {
    id: 'todo',
    title: 'Por hacer',
    color: '#f59e0b',
    items: [
      { id: 'a', title: 'Revisar plan', assignees: ['laura'], priority: 'high', startDate: '2030-03-10', endDate: '2030-03-14' },
      { id: 'b', title: 'Enviar comentarios', endDate: '2030-03-12' },
      { id: 'c', title: 'Sin fechas' },
    ],
  },
  { id: 'doing', title: 'En curso', items: [{ id: 'd', title: 'Solicitar recursos', startDate: '2030-03-12', endDate: '2030-03-13' }] },
  { id: 'done', title: 'Hecho', items: [{ id: 'e', title: 'Campaña', startDate: '2030-03-01', endDate: '2030-03-25' }] },
];

@Component({
  imports: [CbKanbanTimeline],
  template: `
    <cb-kanban-timeline
      [(columns)]="columns"
      [(viewDate)]="viewDate"
      [(zoom)]="zoom"
      [span]="14"
      [people]="people"
      [details]="details()"
      [editable]="editable()"
      [addable]="addable()"
      (cardEdit)="log.push(['edit', $event])"
      (cardAdd)="log.push(['add', $event])"
      (cardMove)="moves.push($event)"
    />
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn<CbKanbanTask>[]>(start());
  viewDate = signal(new Date(2030, 2, 8));
  zoom = signal(1);
  people = people;
  details = signal(false);
  editable = signal(true);
  addable = signal(false);
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
  const tl = () => el.querySelector<HTMLElement>('cb-kanban-timeline')!;
  const bar = (key: string) => tl().querySelector<HTMLElement>(`.cb-kanban-timeline__bar[data-key="${key}"]`)!;
  const task = (id: string) => host.columns().flatMap((c) => c.items).find((t) => t.id === id)!;
  const columnOf = (id: string) => host.columns().find((c) => c.items.some((t) => t.id === id))!.id;
  const sections = () => Array.from(tl().querySelectorAll<HTMLElement>('.cb-kanban-timeline__section'));
  const cell = (section: string, iso: string) =>
    Array.from(tl().querySelectorAll<HTMLElement>('.cb-kanban-timeline__cell')).find((c) => c.dataset['drop'] === section && c.dataset['date'] === iso)!;
  const key = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  /** jsdom no calcula posiciones: la celda bajo el puntero la decide clientX. */
  const pointAt = (cells: Record<number, HTMLElement>) => {
    (document as unknown as { elementsFromPoint: (x: number) => Element[] }).elementsFromPoint = (x: number) => [cells[x]];
  };
  const cleanup = () => {
    delete (document as unknown as { elementsFromPoint?: unknown }).elementsFromPoint;
    fixture.nativeElement.remove();
  };
  return { fixture, el, host, settle, tl, bar, task, columnOf, sections, cell, key, pointAt, cleanup };
}

describe('CbKanbanTimeline', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pinta el rango con meses, días, fines de semana y una fila por sección', async () => {
    const { tl, sections, cell, cleanup } = await setup();
    expect(tl().querySelector('.cb-kanban-timeline__range')!.textContent).toBe('8 – 21 mar 2030');
    expect(tl().querySelector('.cb-kanban-timeline__month')!.textContent!.trim()).toBe('Marzo 2030');
    const days = Array.from(tl().querySelectorAll('.cb-kanban-timeline__day'));
    expect(days.length).toBe(14);
    expect(days[0].textContent!.trim()).toBe('8');
    expect(days[1].classList).toContain('cb-kanban-timeline__day--weekend');
    expect(sections().map((s) => s.getAttribute('aria-label'))).toEqual(['Por hacer, 3 tareas', 'En curso, 1 tareas', 'Hecho, 1 tareas']);
    expect(cell('todo', '2030-03-09').classList).toContain('cb-kanban-timeline__cell--weekend');
    cleanup();
  });

  it('cada tarea es una barra de su inicio a su fin, en el primer carril libre', async () => {
    const { bar, sections, cleanup } = await setup();
    expect(bar('a').style.gridColumn).toBe('4 / span 5');
    expect(bar('a').style.gridRow).toBe('1');
    expect(bar('a').getAttribute('aria-label')).toBe('Revisar plan, 10 – 14 mar, Prioridad: Alta, Responsables: Laura Gómez, Por hacer');
    expect(bar('a').querySelector('.cb-kanban-timeline__avatar')!.textContent!.trim()).toBe('LG');
    // b (solo fin, el 12) se solapa con a: va en el segundo carril.
    expect(bar('b').style.gridColumn).toBe('6 / span 1');
    expect(bar('b').style.gridRow).toBe('2');
    expect(sections()[0].style.gridTemplateRows).toBe('repeat(2, 2.75rem) 2.5rem');
    // Las barras cortas (≤ 2 días) llevan el nombre fuera, a su derecha.
    expect(bar('b').querySelector('.cb-kanban-timeline__bar-title')).toBeNull();
    const outside = sections()[0].querySelector<HTMLElement>('.cb-kanban-timeline__outside')!;
    expect(outside.textContent!.trim()).toBe('Enviar comentarios');
    expect(outside.style.gridColumn).toBe('7 / span 4');
    expect(outside.style.gridRow).toBe('2');
    expect(bar('a').querySelector('.cb-kanban-timeline__bar-title')!.textContent).toBe('Revisar plan');
    // e empieza antes y termina después del rango.
    expect(bar('e').style.gridColumn).toBe('2 / span 14');
    expect(bar('e').classList).toContain('cb-kanban-timeline__bar--before');
    expect(bar('e').classList).toContain('cb-kanban-timeline__bar--after');
    expect(bar('e').querySelector('[data-edge]')).toBeNull();
    expect(bar('a').querySelectorAll('[data-edge]').length).toBe(2);
    cleanup();
  });

  it('Alt + ←→ mueve la tarea, Alt + Mayús + ←→ cambia el fin y Alt + ↑↓ la cambia de sección', async () => {
    const { bar, task, key, tl, host, columnOf, cleanup } = await setup();
    await key(bar('b'), 'ArrowRight', { altKey: true });
    expect(task('b').endDate).toBe('2030-03-13');
    expect(task('b').startDate).toBeUndefined();
    expect(tl().querySelector('[role="status"]')!.textContent).toMatch(/^Enviar comentarios: 13 mar/);
    expect(document.activeElement).toBe(bar('b'));

    await key(bar('a'), 'ArrowRight', { altKey: true, shiftKey: true });
    expect([task('a').startDate, task('a').endDate]).toEqual(['2030-03-10', '2030-03-15']);
    for (let i = 0; i < 8; i++) await key(bar('a'), 'ArrowLeft', { altKey: true, shiftKey: true });
    // El fin no pasa del inicio.
    expect([task('a').startDate, task('a').endDate]).toEqual(['2030-03-10', '2030-03-10']);

    await key(bar('a'), 'ArrowDown', { altKey: true });
    expect(columnOf('a')).toBe('doing');
    expect(host.moves.at(-1)).toMatchObject({ from: 'todo', to: 'doing' });
    expect(document.activeElement).toBe(bar('a'));
    // Sin Alt no cambia nada.
    await key(bar('a'), 'ArrowDown');
    expect(columnOf('a')).toBe('doing');
    cleanup();
  });

  it('sigue a la tarea si sale del rango visible', async () => {
    const { bar, key, host, cleanup } = await setup((h) => h.columns.set([{ id: 'x', title: 'X', items: [{ id: 'z', title: 'Último día', endDate: '2030-03-21' }] }]));
    await key(bar('z'), 'ArrowRight', { altKey: true });
    expect(toIsoDay(host.viewDate())).toBe('2030-03-19');
    expect(document.activeElement).toBe(bar('z'));
    cleanup();
  });

  it('sin editable no se mueven las tareas ni hay bordes para arrastrar', async () => {
    const { bar, task, key, cleanup } = await setup((h) => h.editable.set(false));
    expect(bar('a').querySelector('[data-edge]')).toBeNull();
    expect(bar('a').hasAttribute('aria-describedby')).toBe(false);
    await key(bar('b'), 'ArrowRight', { altKey: true });
    expect(task('b').endDate).toBe('2030-03-12');
    cleanup();
  });

  it('las secciones se contraen', async () => {
    const { tl, bar, settle, sections, cleanup } = await setup();
    const toggle = tl().querySelector<HTMLButtonElement>('[data-section="todo"]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await settle();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(bar('a')).toBeNull();
    expect(sections()[0].style.gridTemplateRows).toBe('2.75rem');
    cleanup();
  });

  it('‹ › mueven una semana, Hoy vuelve a hoy y − + cambian el zoom', async () => {
    const { tl, settle, host, cleanup } = await setup();
    tl().querySelector<HTMLButtonElement>('[aria-label="Semana siguiente"]')!.click();
    await settle();
    expect(toIsoDay(host.viewDate())).toBe('2030-03-15');
    tl().querySelector<HTMLButtonElement>('[aria-label="Semana anterior"]')!.click();
    tl().querySelector<HTMLButtonElement>('[aria-label="Semana anterior"]')!.click();
    await settle();
    expect(toIsoDay(host.viewDate())).toBe('2030-03-01');
    const today = Array.from(tl().querySelectorAll<HTMLButtonElement>('.cb-kanban-timeline__btn')).find((b) => b.textContent!.trim() === 'Hoy')!;
    today.click();
    await settle();
    expect(tl().querySelector('.cb-kanban-timeline__day--today')).toBeTruthy();
    expect(tl().querySelector('.cb-kanban-timeline__now')).toBeTruthy();

    const sheet = () => tl().querySelector<HTMLElement>('.cb-kanban-timeline__sheet')!;
    expect(sheet().style.getPropertyValue('--cb-kanban-timeline-day')).toBe('2.5rem');
    tl().querySelector<HTMLButtonElement>('[data-zoom="in"]')!.click();
    await settle();
    expect(host.zoom()).toBe(2);
    expect(sheet().style.getPropertyValue('--cb-kanban-timeline-day')).toBe('3.5rem');
    const out = tl().querySelector<HTMLButtonElement>('[data-zoom="out"]')!;
    out.click();
    out.click();
    await settle();
    expect(host.zoom()).toBe(0);
    expect(out.disabled).toBe(true);
    cleanup();
  });

  it('lista las tareas sin fecha', async () => {
    const { tl, settle, cleanup } = await setup();
    const btn = tl().querySelector<HTMLButtonElement>('.cb-kanban-timeline__undated-btn')!;
    expect(btn.textContent!.trim()).toBe('Sin fecha (1)');
    btn.click();
    await settle();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(tl().querySelector('.cb-kanban-timeline__undated')!.textContent).toContain('Sin fechas');
    cleanup();
  });

  it('"Añadir tarea" en una sección la crea ahí, en el primer día visible si hoy no se ve', async () => {
    const { tl, settle, key, host, cleanup } = await setup((h) => h.addable.set(true));
    const add = tl().querySelector<HTMLButtonElement>('[data-add="doing"]')!;
    expect(add.getAttribute('aria-label')).toBe('Añadir tarea en En curso');
    add.click();
    await settle();
    const field = tl().querySelector<HTMLInputElement>('.cb-kanban-timeline__composer')!;
    expect(document.activeElement).toBe(field);
    field.value = 'Reunión';
    await key(field, 'Enter');
    const created = host.columns()[1].items.at(-1)!;
    expect([created.title, created.startDate, created.endDate]).toEqual(['Reunión', '2030-03-08', '2030-03-08']);
    expect(host.log.at(-1)![0]).toBe('add');
    await key(tl().querySelector('.cb-kanban-timeline__composer')!, 'Escape');
    expect(document.activeElement).toBe(tl().querySelector('[data-add="doing"]'));
    cleanup();
  });

  it('"Añadir tarea" de la barra va a hoy y abre el campo en la primera sección', async () => {
    const { tl, settle, host, cleanup } = await setup((h) => h.addable.set(true));
    tl().querySelector<HTMLButtonElement>('[data-add-top]')!.click();
    await settle();
    expect(tl().querySelector('.cb-kanban-timeline__day--today')).toBeTruthy();
    expect(document.activeElement).toBe(tl().querySelector('.cb-kanban-timeline__composer'));
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Añadir tarea en Por hacer');
    expect(host.viewDate() <= new Date()).toBe(true);
    cleanup();
  });

  it('arrastrar una barra a otro día y otra sección cambia la fecha y la sección', async () => {
    const { tl, bar, cell, task, columnOf, settle, pointAt, cleanup } = await setup((h) => h.details.set(true));
    pointAt({ 0: cell('todo', '2030-03-12'), 100: cell('doing', '2030-03-15') });
    bar('b').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 }));
    await settle();
    // Mientras se arrastra, la barra se ve en la sección y el día de destino.
    expect(bar('b').closest('.cb-kanban-timeline__section')!.getAttribute('aria-label')).toMatch(/^En curso/);
    expect(bar('b').style.gridColumn).toBe('9 / span 1');
    expect(cell('doing', '2030-03-15').classList).toContain('cb-kanban-timeline__cell--target');
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 100, clientY: 0 }));
    bar('b').click();
    await settle();
    expect(task('b').endDate).toBe('2030-03-15');
    expect(columnOf('b')).toBe('doing');
    expect(tl().querySelector('[role="status"]')!.textContent).toBe('Enviar comentarios: 15 mar. Enviar comentarios soltada en En curso, posición 2.');
    expect(document.querySelector('.cdk-overlay-container cb-kanban-task-panel')).toBeNull();
    cleanup();
  });

  it('arrastrar el borde cambia solo el inicio o el fin', async () => {
    const { bar, cell, task, settle, pointAt, cleanup } = await setup();
    pointAt({ 0: cell('todo', '2030-03-14'), 100: cell('todo', '2030-03-17') });
    bar('a').querySelector('.cb-kanban-timeline__handle--end')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 }));
    await settle();
    expect(bar('a').style.gridColumn).toBe('4 / span 8');
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 100, clientY: 0 }));
    await settle();
    expect([task('a').startDate, task('a').endDate]).toEqual(['2030-03-10', '2030-03-17']);

    pointAt({ 0: cell('todo', '2030-03-10'), 100: cell('todo', '2030-03-20') });
    bar('a').querySelector('.cb-kanban-timeline__handle--start')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 100, clientY: 0 }));
    await settle();
    // El inicio no pasa del fin.
    expect([task('a').startDate, task('a').endDate]).toEqual(['2030-03-17', '2030-03-17']);
    cleanup();
  });

  it('con columnsEditable añade secciones', async () => {
    const { tl, settle, host, cleanup } = await setup();
    const fixture = TestBed.createComponent(CbKanbanTimeline);
    fixture.componentRef.setInput('columnsEditable', true);
    fixture.componentRef.setInput('columns', host.columns());
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cb-kanban-timeline__add-section')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.columns().at(-1)!.title).toBe('Nueva columna');
    expect(tl().querySelector('.cb-kanban-timeline__add-section')).toBeNull();
    await settle();
    cleanup();
  });

  it('con details, pulsar una barra abre el panel de la tarea', async () => {
    const { bar, settle, cleanup } = await setup((h) => h.details.set(true));
    bar('d').click();
    await settle();
    expect(document.querySelector<HTMLTextAreaElement>('.cdk-overlay-container .cb-ktp__title')!.value).toBe('Solicitar recursos');
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    cleanup();
  });
});
