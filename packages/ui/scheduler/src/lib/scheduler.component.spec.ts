import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbScheduler } from './scheduler.component';
import {
  layoutDay,
  monthGrid,
  resizeEvent,
  resolveEvent,
  shiftEvent,
  type CbSchedulerChange,
  type CbSchedulerEvent,
  type CbSchedulerSlot,
  type CbSchedulerView,
  type ResolvedEvent,
} from './scheduler-model';

const EVENTS: CbSchedulerEvent[] = [
  { id: 'a', title: 'Comité', start: '2030-03-13T09:00', end: '2030-03-13T10:30', location: 'Sala 3' },
  { id: 'b', title: 'Diseño', start: '2030-03-13T10:00', end: '2030-03-13T11:00' },
  { id: 'c', title: 'Cierre', start: '2030-03-14', end: '2030-03-15', allDay: true },
  { id: 'd', title: 'Daily', start: '2030-03-12T09:00', end: '2030-03-12T09:15' },
];

afterEach(() => document.body.replaceChildren());

describe('modelo del Scheduler', () => {
  it('reparte en columnas los eventos que se solapan', () => {
    const resolved = EVENTS.map(resolveEvent).filter((e): e is ResolvedEvent => !!e);
    const placed = layoutDay(resolved, new Date(2030, 2, 13));
    expect(placed.map((p) => [p.e.event.id, p.column, p.columns, p.from, p.to])).toEqual([
      ['a', 0, 2, 540, 630],
      ['b', 1, 2, 600, 660],
    ]);
  });

  it('la rejilla del mes empieza en el primer día de la semana y tiene semanas completas', () => {
    const weeks = monthGrid(new Date(2030, 2, 13), 1);
    expect(weeks[0][0].getDay()).toBe(1);
    expect(weeks[0][0].getDate()).toBe(25);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.at(-1)!.some((d) => d.getMonth() === 2 && d.getDate() === 31)).toBe(true);
  });

  it('mueve y redimensiona conservando la duración (y un mínimo de 15 min)', () => {
    expect(shiftEvent(EVENTS[0], 1, 30)).toMatchObject({ start: '2030-03-14T09:30', end: '2030-03-14T11:00' });
    expect(shiftEvent(EVENTS[2], -1, 0)).toMatchObject({ start: '2030-03-13', end: '2030-03-14' });
    expect(resizeEvent(EVENTS[0], 30)).toMatchObject({ end: '2030-03-13T11:00' });
    expect(resizeEvent(EVENTS[0], -600)).toMatchObject({ end: '2030-03-13T09:15' });
  });
});

@Component({
  imports: [CbScheduler],
  template: `<cb-scheduler [(events)]="events" [(view)]="view" [(date)]="date" [editable]="editable()" (eventChange)="changes.push($event)" (eventOpen)="opened.push($event.id)" (slotSelect)="slots.push($event)" />`,
})
class HostComponent {
  events = signal<readonly CbSchedulerEvent[]>(EVENTS);
  view = signal<CbSchedulerView>('week');
  date = signal(new Date(2030, 2, 13));
  editable = signal(true);
  changes: CbSchedulerChange[] = [];
  opened: string[] = [];
  slots: CbSchedulerSlot[] = [];
}

async function setup(editable = true) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.editable.set(editable);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const event = (title: string) => Array.from(el.querySelectorAll<HTMLElement>('[data-event-id]')).find((b) => b.getAttribute('aria-label')!.startsWith(title))!;
  const key = async (target: HTMLElement, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const button = (text: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim() === text || b.getAttribute('aria-label') === text)!;
  return { fixture, el, settle, event, key, button, host: fixture.componentInstance };
}

describe('CbScheduler', () => {
  it('semana: título, siete días, eventos con hora en su franja y de día completo arriba', async () => {
    const { el, event } = await setup();
    expect(el.querySelector('.cb-sched__title')!.textContent).toMatch(/11.*17 mar.* 2030/);
    expect(el.querySelectorAll('.cb-sched__col').length).toBe(7);
    expect(el.querySelectorAll('.cb-sched__event').length).toBe(3);
    expect(el.querySelector('.cb-sched__allday')!.textContent).toContain('Cierre');
    expect(event('Comité').getAttribute('aria-label')).toMatch(/^Comité, miércoles, 13 de marzo, 09:00 – 10:30, Sala 3$/);
    expect(event('Cierre').getAttribute('aria-label')).toMatch(/^Cierre, jueves, 14 de marzo – viernes, 15 de marzo$/);
  });

  it('con el teclado mueve un evento (franja y día) y cambia su duración; cada cambio se emite y se anuncia', async () => {
    const { event, key, host, el } = await setup();
    await key(event('Comité'), 'ArrowDown');
    expect(host.events().find((e) => e.id === 'a')).toMatchObject({ start: '2030-03-13T09:30', end: '2030-03-13T11:00' });
    await key(event('Comité'), 'ArrowRight');
    expect(host.events().find((e) => e.id === 'a')).toMatchObject({ start: '2030-03-14T09:30' });
    await key(event('Comité'), 'ArrowDown', { shiftKey: true });
    expect(host.events().find((e) => e.id === 'a')).toMatchObject({ end: '2030-03-14T11:30' });
    expect(host.changes.length).toBe(3);
    expect(host.changes[0].previous.start).toBe('2030-03-13T09:00');
    expect(el.querySelector('[role="status"]')!.textContent).toContain('Evento movido: Comité');
  });

  it('Enter abre el evento y el botón + de un día elige un hueco a la hora de trabajo', async () => {
    const { event, key, host, el, settle } = await setup();
    await key(event('Diseño'), 'Enter');
    event('Diseño').click();
    await settle();
    expect(host.opened).toContain('b');
    el.querySelector<HTMLButtonElement>('.cb-sched__col-head .cb-sched__add')!.click();
    expect(host.slots[0].allDay).toBe(false);
    expect([host.slots[0].start.getDate(), host.slots[0].start.getHours()]).toEqual([11, 8]);
  });

  it('navega por periodos y cambia de vista; los días abren la vista de día', async () => {
    const { button, settle, el, host } = await setup();
    button('Siguiente').click();
    await settle();
    expect(host.date().getDate()).toBe(20);
    button('Mes').click();
    await settle();
    expect(el.querySelector('.cb-sched__title')!.textContent).toBe('Marzo de 2030');
    expect(el.querySelector('[role="grid"]')).toBeTruthy();
    const day13 = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-sched__day-num')).find((b) => b.getAttribute('aria-label')!.includes('13 de marzo'))!;
    day13.click();
    await settle();
    expect(host.view()).toBe('day');
    expect(el.querySelectorAll('.cb-sched__col').length).toBe(1);
  });

  it('el mes muestra los eventos de cada día y la agenda los agrupa por día', async () => {
    const { button, settle, el } = await setup();
    button('Mes').click();
    await settle();
    const cell = el.querySelector<HTMLElement>(`[data-date="${new Date(2030, 2, 13).getTime()}"]`)!;
    expect(Array.from(cell.querySelectorAll('.cb-sched__chip')).map((c) => c.textContent!.replace(/\s+/g, ' ').trim())).toEqual(['09:00Comité', '10:00Diseño']);
    button('Agenda').click();
    await settle();
    expect(el.querySelectorAll('.cb-sched__agenda-day').length).toBe(3);
  });

  it('sin edición no mueve nada ni muestra los botones +', async () => {
    const { event, key, host, el } = await setup(false);
    await key(event('Comité'), 'ArrowDown');
    expect(host.events()).toBe(EVENTS);
    expect(el.querySelectorAll('.cb-sched__add').length).toBe(0);
    expect(el.querySelectorAll('.cb-sched__resize').length).toBe(0);
  });
});
