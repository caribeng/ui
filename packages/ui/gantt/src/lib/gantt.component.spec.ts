import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbGantt } from './gantt.component';
import { autoSchedule, canLink, resolveTasks, visibleRows, type CbGanttChange, type CbGanttLink, type CbGanttTask } from './gantt-model';

const TASKS: CbGanttTask[] = [
  { id: 'g', name: 'Fase 1', type: 'group', start: '2030-03-01', end: '2030-03-01' },
  { id: 'a', name: 'Análisis', parent: 'g', start: '2030-03-04', end: '2030-03-08', progress: 100 },
  { id: 'b', name: 'Diseño', parent: 'g', start: '2030-03-11', end: '2030-03-20', progress: 0, dependencies: ['a'] },
  { id: 'm', name: 'Entrega', type: 'milestone', start: '2030-03-21', end: '2030-03-21', dependencies: ['b'] },
];

afterEach(() => document.body.replaceChildren());

describe('modelo del Gantt', () => {
  it('los grupos abarcan a sus tareas y promedian su avance por duración', () => {
    const r = resolveTasks(TASKS);
    const g = r.get('g')!;
    expect(g.isGroup).toBe(true);
    expect([g.start.getDate(), g.end.getDate()]).toEqual([4, 20]);
    // 5 días al 100 % y 10 días al 0 %: 33 %.
    expect(g.progress).toBe(33);
    expect(r.get('b')!.level).toBe(1);
    expect(r.get('m')!.isMilestone).toBe(true);
  });

  it('las filas visibles siguen el árbol y ocultan los grupos plegados', () => {
    const r = resolveTasks(TASKS);
    expect(visibleRows(TASKS, r, new Set()).map((x) => x.task.id)).toEqual(['g', 'a', 'b', 'm']);
    expect(visibleRows(TASKS, r, new Set(['g'])).map((x) => x.task.id)).toEqual(['g', 'm']);
  });

  it('no deja crear dependencias repetidas, en ciclo o entre un grupo y sus tareas', () => {
    expect(canLink(TASKS, 'a', 'm')).toBe(true);
    expect(canLink(TASKS, 'a', 'b')).toBe(false);
    expect(canLink(TASKS, 'm', 'a')).toBe(false);
    expect(canLink(TASKS, 'g', 'a')).toBe(false);
    expect(canLink(TASKS, 'a', 'a')).toBe(false);
  });

  it('la planificación automática desplaza en cadena conservando la duración', () => {
    const later = TASKS.map((t) => (t.id === 'a' ? { ...t, end: '2030-03-13' } : t));
    const out = autoSchedule(later);
    const b = out.find((t) => t.id === 'b')!;
    const m = out.find((t) => t.id === 'm')!;
    expect([b.start, b.end]).toEqual(['2030-03-14', '2030-03-23']);
    expect([m.start, m.end]).toEqual(['2030-03-24', '2030-03-24']);
  });
});

@Component({
  imports: [CbGantt],
  template: `<cb-gantt [(tasks)]="tasks" [readonly]="readonly()" (taskChange)="changes.push($event)" (linkRemove)="removed.push($event)" (taskOpen)="opened.push($event.id)" />`,
})
class HostComponent {
  tasks = signal<readonly CbGanttTask[]>(TASKS);
  readonly = signal(false);
  changes: CbGanttChange[] = [];
  removed: CbGanttLink[] = [];
  opened: string[] = [];
}

async function setup(readonly = false) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.readonly.set(readonly);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const bar = (name: string) => Array.from(el.querySelectorAll<HTMLElement>('.cb-gantt__bar')).find((b) => b.getAttribute('aria-label')!.includes(name))!;
  const key = async (target: HTMLElement, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  return { fixture, el, settle, bar, key, host: fixture.componentInstance };
}

describe('CbGantt', () => {
  it('pinta la tabla en árbol y una barra por tarea con su nombre accesible', async () => {
    const { el, bar } = await setup();
    const grid = el.querySelector('[role="treegrid"]')!;
    const rows = Array.from(grid.querySelectorAll('[role="row"]'));
    expect(rows.map((r) => r.getAttribute('aria-level'))).toEqual(['1', '2', '2', '1']);
    expect(rows[0].getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelectorAll('.cb-gantt__bar').length).toBe(4);
    expect(bar('Diseño').getAttribute('aria-label')).toMatch(/^Diseño: 11 mar.* – 20 mar.*, 0 % completado\. Depende de Análisis$/);
    expect(bar('Entrega').getAttribute('aria-label')).toMatch(/^Hito Entrega/);
    expect(bar('Fase 1').getAttribute('aria-label')).toMatch(/^Grupo Fase 1/);
    expect(el.querySelectorAll('path.cb-gantt__link').length).toBe(2);
  });

  it('con el teclado mueve la tarea, cambia el fin y el avance, y replanifica las dependientes', async () => {
    const { bar, key, host, el } = await setup();
    await key(bar('Análisis'), 'ArrowRight');
    const a = host.tasks().find((t) => t.id === 'a')!;
    expect([a.start, a.end]).toEqual(['2030-03-05', '2030-03-09']);
    await key(bar('Análisis'), 'ArrowRight', { shiftKey: true });
    await key(bar('Análisis'), 'ArrowRight', { shiftKey: true });
    // El fin pasa al 11: Diseño (que empezaba el 11) se desplaza al 12.
    expect(host.tasks().find((t) => t.id === 'a')!.end).toBe('2030-03-11');
    expect(host.tasks().find((t) => t.id === 'b')!.start).toBe('2030-03-12');
    const last = host.changes.at(-1)!;
    expect(last.task.id).toBe('a');
    expect(last.reason).toBe('resize');
    expect(host.changes.some((c) => c.task.id === 'b' && c.reason === 'schedule')).toBe(true);
    await key(bar('Diseño'), '+');
    expect(host.tasks().find((t) => t.id === 'b')!.progress).toBe(10);
    expect(el.querySelector('[role="status"]')!.textContent).toContain('Diseño: 10 % completado');
  });

  it('Supr quita las dependencias de la tarea y Enter la abre', async () => {
    const { bar, key, host } = await setup();
    await key(bar('Diseño'), 'Delete');
    expect(host.tasks().find((t) => t.id === 'b')!.dependencies).toEqual([]);
    expect(host.removed).toEqual([{ from: 'a', to: 'b' }]);
    await key(bar('Diseño'), 'Enter');
    expect(host.opened).toEqual(['b']);
  });

  it('mover un grupo mueve sus tareas', async () => {
    const { bar, key, host } = await setup();
    await key(bar('Fase 1'), 'ArrowLeft');
    expect(host.tasks().find((t) => t.id === 'a')!.start).toBe('2030-03-03');
    expect(host.tasks().find((t) => t.id === 'b')!.start).toBe('2030-03-10');
  });

  it('plegar un grupo oculta sus filas y barras', async () => {
    const { el, settle } = await setup();
    el.querySelector<HTMLButtonElement>('.cb-gantt__toggle')!.click();
    await settle();
    expect(el.querySelectorAll('[role="row"]').length).toBe(2);
    expect(el.querySelectorAll('.cb-gantt__bar').length).toBe(2);
    expect(el.querySelector('.cb-gantt__toggle')!.getAttribute('aria-label')).toBe('Expandir Fase 1');
  });

  it('en solo lectura no cambia nada con el teclado', async () => {
    const { bar, key, host, el } = await setup(true);
    await key(bar('Análisis'), 'ArrowRight');
    expect(host.tasks()).toBe(TASKS);
    expect(el.querySelectorAll('.cb-gantt__connector').length).toBe(0);
  });

  it('cambia de escala con la barra de herramientas', async () => {
    const { el, settle } = await setup();
    const week = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-gantt__scale')).find((b) => b.textContent!.includes('Semana'))!;
    week.click();
    await settle();
    expect(week.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.cb-gantt__unit:not(.cb-gantt__unit--top)')!.textContent).toMatch(/^S\d+ · /);
  });
});
