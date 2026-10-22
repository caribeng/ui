import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CbKanbanCalendar } from './kanban-calendar.component';
import type { CbKanbanCardEvent, CbKanbanColumn } from './kanban-view';
import { addDays, dayDiff, startOfWeek, type CbKanbanPerson, type CbKanbanTask } from './kanban-task';

const people: CbKanbanPerson[] = [{ id: 'laura', name: 'Laura Gómez' }];

// Marzo de 2030 empieza en viernes: con el lunes como primer día, la cuadrícula va del 25 feb al 31 mar (5 semanas).
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
];

@Component({
  imports: [CbKanbanCalendar],
  template: `
    <cb-kanban-calendar
      [(columns)]="columns"
      [(viewDate)]="viewDate"
      [people]="people"
      [details]="details()"
      [editable]="editable()"
      [addable]="addable()"
      (cardEdit)="log.push(['edit', $event])"
      (cardAdd)="log.push(['add', $event])"
    />
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn<CbKanbanTask>[]>(start());
  viewDate = signal(new Date(2030, 2, 15));
  people = people;
  details = signal(false);
  editable = signal(true);
  addable = signal(false);
  log: [string, CbKanbanCardEvent][] = [];
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
  const cal = () => el.querySelector<HTMLElement>('cb-kanban-calendar')!;
  const bars = (key: string) => Array.from(cal().querySelectorAll<HTMLElement>(`.cb-kanban-calendar__bar[data-key="${key}"]`));
  const task = (id: string) => host.columns().flatMap((c) => c.items).find((t) => t.id === id)!;
  const day = (iso: string) => cal().querySelector<HTMLElement>(`.cb-kanban-calendar__day[data-date="${iso}"]`)!;
  const key = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const cleanup = () => fixture.nativeElement.remove();
  return { fixture, el, host, settle, cal, bars, task, day, key, cleanup };
}

describe('CbKanbanCalendar', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pinta el mes con semanas de lunes a domingo, días fuera del mes y el título', async () => {
    const { cal, day, cleanup } = await setup();
    expect(cal().querySelector('.cb-kanban-calendar__month')!.textContent).toBe('Marzo de 2030');
    expect(Array.from(cal().querySelectorAll('.cb-kanban-calendar__weekdays span')).map((s) => s.textContent)[0]).toBe('Lun');
    expect(cal().querySelectorAll('.cb-kanban-calendar__week').length).toBe(5);
    expect(day('2030-02-25').classList).toContain('cb-kanban-calendar__day--out');
    expect(day('2030-03-01').textContent).toContain('1 mar');
    expect(cal().querySelector('.cb-kanban-calendar__week')!.getAttribute('aria-label')).toMatch(/^Semana del 25 feb.* al 3 mar/);
    cleanup();
  });

  it('cada tarea es una barra que cruza semanas y ocupa el primer carril libre', async () => {
    const { bars, cleanup } = await setup();
    const a = bars('a');
    expect(a.length).toBe(2);
    expect(a[0].style.gridColumn).toBe('7 / span 1');
    expect(a[0].classList).toContain('cb-kanban-calendar__bar--after');
    expect(a[1].style.gridColumn).toBe('1 / span 4');
    expect(a[1].classList).toContain('cb-kanban-calendar__bar--before');
    expect(a[1].getAttribute('aria-label')).toBe('Revisar plan, 10 – 14 mar, Prioridad: Alta, Responsables: Laura Gómez, Por hacer');
    expect(a[1].querySelector('.cb-kanban-calendar__avatar')!.textContent!.trim()).toBe('LG');
    // Mismo día: d (12–13) va antes que b (12) y cada una en su carril.
    expect(bars('d')[0].style.gridRow).toBe('3');
    expect(bars('b')[0].style.gridRow).toBe('4');
    expect(bars('b')[0].style.gridColumn).toBe('2 / span 1');
    cleanup();
  });

  it('lista las tareas sin fecha', async () => {
    const { cal, settle, cleanup } = await setup();
    const btn = cal().querySelector<HTMLButtonElement>('.cb-kanban-calendar__undated-btn')!;
    expect(btn.textContent!.trim()).toBe('Sin fecha (1)');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    btn.click();
    await settle();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(cal().querySelector('.cb-kanban-calendar__undated')!.textContent).toContain('Sin fechas');
    cleanup();
  });

  it('Alt + flechas cambia el día (←→) o la semana (↑↓) manteniendo la duración', async () => {
    const { bars, task, key, host, cal, cleanup } = await setup();
    await key(bars('b')[0], 'ArrowRight', { altKey: true });
    expect(task('b').endDate).toBe('2030-03-13');
    expect(task('b').startDate).toBeUndefined();
    expect(host.log.at(-1)![0]).toBe('edit');
    expect(cal().querySelector('[role="status"]')!.textContent).toMatch(/^Enviar comentarios: 13 mar/);
    expect(document.activeElement).toBe(bars('b')[0]);

    await key(bars('a')[0], 'ArrowDown', { altKey: true });
    expect([task('a').startDate, task('a').endDate]).toEqual(['2030-03-17', '2030-03-21']);
    // Sin Alt no cambia nada.
    await key(bars('a')[0], 'ArrowUp');
    expect(task('a').startDate).toBe('2030-03-17');
    cleanup();
  });

  it('el calendario sigue a la tarea si cambia de mes', async () => {
    const { bars, key, host, cleanup } = await setup((h) => h.columns.set([{ id: 'x', title: 'X', items: [{ id: 'z', title: 'Fin de mes', endDate: '2030-03-28' }] }]));
    await key(bars('z')[0], 'ArrowDown', { altKey: true });
    expect(host.viewDate().getMonth()).toBe(3);
    expect(document.activeElement).toBe(bars('z')[0]);
    cleanup();
  });

  it('sin editable no se mueven las tareas', async () => {
    const { bars, task, key, cleanup } = await setup((h) => h.editable.set(false));
    expect(bars('b')[0].hasAttribute('aria-describedby')).toBe(false);
    await key(bars('b')[0], 'ArrowRight', { altKey: true });
    expect(task('b').endDate).toBe('2030-03-12');
    cleanup();
  });

  it('‹ › y Hoy cambian el mes visible ([(viewDate)])', async () => {
    const { cal, settle, host, cleanup } = await setup();
    cal().querySelector<HTMLButtonElement>('[aria-label="Mes siguiente"]')!.click();
    await settle();
    expect(cal().querySelector('.cb-kanban-calendar__month')!.textContent).toBe('Abril de 2030');
    expect(host.viewDate().getMonth()).toBe(3);
    cal().querySelector<HTMLButtonElement>('[aria-label="Mes anterior"]')!.click();
    cal().querySelector<HTMLButtonElement>('[aria-label="Mes anterior"]')!.click();
    await settle();
    expect(host.viewDate().getMonth()).toBe(1);
    const today = Array.from(cal().querySelectorAll<HTMLButtonElement>('.cb-kanban-calendar__btn')).find((b) => b.textContent!.trim() === 'Hoy')!;
    today.click();
    await settle();
    expect(host.viewDate().getMonth()).toBe(new Date().getMonth());
    expect(cal().querySelector('.cb-kanban-calendar__day--today')).toBeTruthy();
    cleanup();
  });

  it('"Añadir tarea" en un día crea la tarea con esa fecha en la primera columna', async () => {
    const { cal, settle, key, host, cleanup } = await setup((h) => h.addable.set(true));
    const add = cal().querySelector<HTMLButtonElement>('[data-add="2030-03-20"]')!;
    expect(add.getAttribute('aria-label')).toBe('Añadir tarea el miércoles, 20 de marzo de 2030');
    add.click();
    await settle();
    const field = cal().querySelector<HTMLInputElement>('.cb-kanban-calendar__composer')!;
    expect(document.activeElement).toBe(field);
    field.value = 'Reunión';
    await key(field, 'Enter');
    const created = host.columns()[0].items.at(-1)!;
    expect([created.title, created.startDate, created.endDate]).toEqual(['Reunión', '2030-03-20', '2030-03-20']);
    expect(host.log.at(-1)![0]).toBe('add');
    expect(cal().querySelector('.cb-kanban-calendar__composer')).toBeTruthy();
    await key(cal().querySelector('.cb-kanban-calendar__composer')!, 'Escape');
    expect(document.activeElement).toBe(cal().querySelector('[data-add="2030-03-20"]'));
    cleanup();
  });

  it('arrastrar una barra a otro día la cambia de fecha y no abre el detalle', async () => {
    const { bars, day, task, settle, cleanup } = await setup((h) => h.details.set(true));
    // jsdom no calcula posiciones: el día bajo el puntero lo decide clientX.
    const target = { 0: '2030-03-12', 100: '2030-03-15' } as Record<number, string>;
    (document as unknown as { elementsFromPoint: (x: number) => Element[] }).elementsFromPoint = (x: number) => [day(target[x])];
    const bar = bars('b')[0];
    bar.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 }));
    await settle();
    expect(bars('b')[0].style.gridColumn).toBe('5 / span 1');
    expect(day('2030-03-15').classList).toContain('cb-kanban-calendar__day--target');
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 100, clientY: 0 }));
    bars('b')[0].click();
    await settle();
    expect(task('b').endDate).toBe('2030-03-15');
    expect(document.querySelector('.cdk-overlay-container cb-kanban-task-panel')).toBeNull();
    expect(day('2030-03-15').classList).not.toContain('cb-kanban-calendar__day--target');
    delete (document as unknown as { elementsFromPoint?: unknown }).elementsFromPoint;
    cleanup();
  });

  it('con details, pulsar una barra abre el panel de la tarea', async () => {
    const { bars, settle, cleanup } = await setup((h) => h.details.set(true));
    bars('d')[0].click();
    await settle();
    expect(document.querySelector<HTMLTextAreaElement>('.cdk-overlay-container .cb-ktp__title')!.value).toBe('Solicitar recursos');
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    cleanup();
  });
});

describe('utilidades de fechas', () => {
  it('suma días, busca el inicio de semana y cuenta días', () => {
    const d = new Date(2030, 2, 10);
    expect(addDays(d, 5).getDate()).toBe(15);
    expect(startOfWeek(d, 1).getDate()).toBe(4);
    expect(startOfWeek(d, 0).getDate()).toBe(10);
    expect(dayDiff(new Date(2030, 2, 30), new Date(2030, 3, 2))).toBe(3);
  });
});
