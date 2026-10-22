import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKanbanDashboard } from './kanban-dashboard.component';
import type { CbKanbanColumn } from './kanban-view';
import { addDays, toIsoDay, type CbKanbanPerson, type CbKanbanTask } from './kanban-task';

const people: CbKanbanPerson[] = [
  { id: 'laura', name: 'Laura Gómez' },
  { id: 'andres', name: 'Andrés Pérez' },
];

const day = (offset: number) => toIsoDay(addDays(new Date(), offset))!;

// 7 tareas: 3 finalizadas (a, e, f), 4 sin finalizar (b, c, d, g) y 1 con retraso (b).
const columns = (): CbKanbanColumn<CbKanbanTask>[] => [
  {
    id: 'todo',
    title: 'Por hacer',
    items: [
      { id: 'a', title: 'A', completed: true, endDate: day(-10) },
      { id: 'b', title: 'B', assignees: ['laura'], endDate: day(-2) },
      { id: 'c', title: 'C', assignees: ['laura', 'andres'] },
    ],
  },
  {
    id: 'doing',
    title: 'En curso',
    items: [
      { id: 'd', title: 'D', assignees: ['andres'], endDate: day(3) },
      { id: 'e', title: 'E', completed: true, endDate: day(8) },
    ],
  },
  {
    id: 'done',
    title: 'Hecho',
    items: [
      { id: 'f', title: 'F', completed: true },
      { id: 'g', title: 'G' },
    ],
  },
];

function setup(init: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(CbKanbanDashboard);
  fixture.componentRef.setInput('columns', columns());
  fixture.componentRef.setInput('people', people);
  fixture.componentRef.setInput('animate', false);
  for (const [name, value] of Object.entries(init)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const widget = (id: string) => el.querySelector<HTMLElement>(`[data-widget="${id}"]`)!;
  const value = (id: string) => widget(id).querySelector('.cb-kanban-dashboard__value')!.textContent!.trim();
  return { fixture, el, widget, value, dash: fixture.componentInstance };
}

describe('CbKanbanDashboard', () => {
  it('es una región con nombre y cuenta finalizadas, sin finalizar, con retraso y total', () => {
    const { el, widget, value } = setup();
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Panel del proyecto');
    expect([value('completed'), value('incomplete'), value('overdue'), value('total')]).toEqual(['3', '4', '1', '7']);
    expect(widget('completed').querySelector('.cb-kanban-dashboard__hint')!.textContent).toMatch(/^43\s?% del total$/);
    expect(widget('overdue').querySelector('.cb-kanban-dashboard__value--danger')).toBeTruthy();
    expect(widget('total').querySelector('.cb-kanban-dashboard__hint')).toBeNull();
    const title = widget('total').querySelector('[role="heading"]')!;
    expect(title.getAttribute('aria-level')).toBe('3');
    expect(widget('total').getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent!.trim()).toBe('Tareas en total');
  });

  it('pinta los cuatro gráficos con sus títulos', () => {
    const { el } = setup();
    const charts = Array.from(el.querySelectorAll('.cb-kanban-dashboard__chart'));
    expect(charts.map((c) => c.querySelector('[role="heading"]')!.textContent!.trim())).toEqual([
      'Tareas sin finalizar por sección',
      'Tareas por estado de finalización',
      'Tareas sin finalizar por responsable',
      'Entregas por semana',
    ]);
    expect(el.querySelectorAll('cb-chart').length).toBe(4);
  });

  it('calcula los datos de cada gráfico', () => {
    const { dash } = setup();
    expect(dash.bySection()).toMatchObject({ labels: ['Por hacer', 'En curso', 'Hecho'], datasets: [{ data: [2, 1, 1] }] });
    expect(dash.byStatus()).toMatchObject({ labels: ['Finalizadas', 'A tiempo', 'Con retraso'], datasets: [{ data: [3, 3, 1] }] });
    // Una tarea con dos responsables cuenta para los dos; las que no tienen, en "Sin responsable".
    expect(dash.byAssignee()).toMatchObject({ labels: ['Andrés Pérez', 'Laura Gómez', 'Sin responsable'], datasets: [{ data: [2, 2, 1] }] });
    const week = dash.byWeek();
    expect(week.labels.length).toBe(8);
    const sum = (i: number) => week.datasets[i].data.reduce((a, b) => a + b, 0);
    expect(week.datasets.map((d) => d.label)).toEqual(['Finalizadas', 'Sin finalizar']);
    expect([sum(0), sum(1)]).toEqual([2, 2]);
  });

  it('se actualiza al cambiar las columnas', () => {
    const { fixture, value } = setup();
    const next = columns();
    next[0] = { ...next[0], items: next[0].items.map((t) => (t.id === 'b' ? { ...t, completed: true } : t)) };
    fixture.componentRef.setInput('columns', next);
    fixture.detectChanges();
    expect([value('completed'), value('incomplete'), value('overdue')]).toEqual(['4', '3', '0']);
  });

  it('widgets elige los bloques y su orden', () => {
    const { el } = setup({ widgets: ['total', 'byStatus', 'total', 'nada'], headingLevel: 2 });
    expect(Array.from(el.querySelectorAll('[data-widget]')).map((w) => w.getAttribute('data-widget'))).toEqual(['total', 'byStatus']);
    expect(el.querySelector('[role="heading"]')!.getAttribute('aria-level')).toBe('2');
  });

  it('sin tareas muestra ceros y no calcula porcentajes', () => {
    const { el, value } = setup({ columns: [] });
    expect(value('total')).toBe('0');
    expect(el.querySelector('.cb-kanban-dashboard__hint')).toBeNull();
  });
});
