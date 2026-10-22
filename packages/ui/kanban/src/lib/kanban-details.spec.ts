import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKanban, type CbKanbanCardEvent, type CbKanbanColumn } from './kanban.component';
import { formatDateRange, formatSize, toDate, toIsoDay, type CbKanbanPerson, type CbKanbanTask } from './kanban-task';

const people: CbKanbanPerson[] = [
  { id: 'laura', name: 'Laura Gómez' },
  { id: 'mateo', name: 'Mateo Ruiz' },
];

const start = (): CbKanbanColumn<CbKanbanTask>[] => [
  {
    id: 'todo',
    title: 'Por hacer',
    items: [
      {
        id: 'a',
        title: 'Diseño',
        description: 'Pantalla de pagos',
        assignees: ['laura', 'mateo'],
        priority: 'high',
        startDate: '2030-03-10',
        endDate: '2030-03-14',
        attachments: [{ id: 'f1', name: 'boceto.pdf', size: 2048 }],
      },
      { id: 'b', title: 'API', endDate: '2020-01-01' },
    ],
  },
  { id: 'doing', title: 'En curso', items: [] },
];

@Component({
  imports: [CbKanban],
  template: `
    <cb-kanban
      [(columns)]="columns"
      details
      editable
      [people]="people"
      (cardEdit)="log.push(['edit', $event])"
      (cardDelete)="log.push(['delete', $event])"
    />
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn<CbKanbanTask>[]>(start());
  people = people;
  log: [string, CbKanbanCardEvent][] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const card = (title: string) => Array.from(el.querySelectorAll<HTMLElement>('.cb-kanban__card')).find((c) => c.textContent!.includes(title))!;
  const task = (id: string) => host.columns().flatMap((c) => c.items).find((t) => t.id === id)!;
  const panel = () => document.querySelector<HTMLElement>('.cdk-overlay-container cb-kanban-task-panel');
  const open = async (title: string) => {
    card(title).click();
    await settle();
    return panel()!;
  };
  const cleanup = async () => {
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    fixture.nativeElement.remove();
  };
  return { fixture, el, host, settle, card, task, panel, open, cleanup };
}

describe('CbKanban con detalle de tarea', () => {
  it('la tarjeta por defecto muestra prioridad, fechas, adjuntos y responsables (con texto para lectores)', async () => {
    const { card, cleanup } = await setup();
    const c = card('Diseño');
    expect(c.querySelector('.cb-kanban__priority')!.textContent).toContain('Alta');
    expect(c.querySelector('.cb-kanban__priority')!.getAttribute('data-severity')).toBe('danger');
    expect(c.querySelector('.cb-kanban__date')!.textContent).toContain('10 – 14');
    expect(c.querySelector('.cb-kanban__attachments')!.textContent).toContain('1 adjuntos');
    expect(Array.from(c.querySelectorAll('.cb-kanban__avatar')).map((a) => a.textContent!.trim())).toEqual(['LG', 'MR']);
    expect(c.querySelector('.cb-kanban__avatars')!.textContent).toContain('Responsables: Laura Gómez, Mateo Ruiz');
    expect(c.getAttribute('aria-haspopup')).toBe('dialog');
    await cleanup();
  });

  it('marca como vencida una tarea cuya fecha de fin ya pasó', async () => {
    const { card, cleanup } = await setup();
    const date = card('API').querySelector('.cb-kanban__date')!;
    expect(date.classList).toContain('cb-kanban__date--overdue');
    expect(date.textContent).toContain('vencida');
    expect(card('Diseño').querySelector('.cb-kanban__date--overdue')).toBeNull();
    await cleanup();
  });

  it('al abrir una tarjeta muestra el panel en un diálogo con todos los campos', async () => {
    const { open, cleanup } = await setup();
    const p = await open('Diseño');
    expect(p.closest('[role="dialog"]')!.getAttribute('aria-labelledby')).toBeTruthy();
    expect(document.querySelector('.cb-drawer__title')!.textContent).toBe('Detalles de la tarea');
    expect(p.querySelector<HTMLTextAreaElement>('.cb-ktp__title')!.value).toBe('Diseño');
    expect(Array.from(p.querySelectorAll('.cb-ktp__label')).map((l) => l.textContent!.trim())).toEqual([
      'Columna',
      'Responsables',
      'Prioridad',
      'Fecha de inicio',
      'Fecha de fin',
    ]);
    expect(p.querySelector<HTMLTextAreaElement>('#' + p.querySelector('.cb-ktp__textarea')!.id)!.value).toBe('Pantalla de pagos');
    expect(Array.from(p.querySelectorAll('.cb-ktp__person-name')).map((n) => n.textContent)).toEqual(['Laura Gómez', 'Mateo Ruiz']);
    expect(p.querySelector('.cb-ktp__file-name')!.textContent).toBe('boceto.pdf');
    expect(p.querySelector('.cb-ktp__file-size')!.textContent).toBe('2 KB');
    await cleanup();
  });

  it('editar título y descripción actualiza la tarjeta y emite cardEdit con la versión anterior', async () => {
    const { open, settle, task, host, card, cleanup } = await setup();
    const p = await open('Diseño');
    const title = p.querySelector<HTMLTextAreaElement>('.cb-ktp__title')!;
    title.value = 'Diseño final';
    title.dispatchEvent(new Event('blur'));
    await settle();
    expect(task('a').title).toBe('Diseño final');
    expect(card('Diseño final')).toBeTruthy();
    const [kind, event] = host.log.at(-1)!;
    expect(kind).toBe('edit');
    expect((event.previous as CbKanbanTask).title).toBe('Diseño');

    const description = p.querySelector<HTMLTextAreaElement>('.cb-ktp__textarea')!;
    description.value = 'Con OTP';
    description.dispatchEvent(new Event('blur'));
    await settle();
    expect(task('a').description).toBe('Con OTP');
    // Un título vacío no se guarda.
    title.value = '  ';
    title.dispatchEvent(new Event('blur'));
    await settle();
    expect(task('a').title).toBe('Diseño final');
    await cleanup();
  });

  it('quita responsables y adjuntos, y añade archivos', async () => {
    const { open, settle, task, cleanup } = await setup();
    const p = await open('Diseño');
    p.querySelector<HTMLButtonElement>('[aria-label="Quitar a Laura Gómez"]')!.click();
    await settle();
    expect(task('a').assignees).toEqual(['mateo']);

    const input = p.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['hola'], 'notas.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await settle();
    const added = task('a').attachments!.at(-1)!;
    expect(added.name).toBe('notas.txt');
    expect(added.size).toBe(4);
    expect(added.file).toBe(file);

    p.querySelector<HTMLButtonElement>('[aria-label="Quitar boceto.pdf"]')!.click();
    await settle();
    expect(task('a').attachments!.map((f) => f.name)).toEqual(['notas.txt']);
    await cleanup();
  });

  it('eliminar desde el panel pide confirmación, cierra el panel y emite cardDelete', async () => {
    const { open, settle, host, panel, cleanup } = await setup();
    const p = await open('Diseño');
    const button = Array.from(p.querySelectorAll<HTMLButtonElement>('.cb-ktp__footer button')).find((b) => b.textContent!.includes('Eliminar'))!;
    button.click();
    await settle();
    expect(p.querySelector('.cb-ktp__confirm-text')!.textContent).toBe('¿Eliminar «Diseño»?');
    expect(document.activeElement).toBe(p.querySelector('[data-confirm-cancel]'));
    p.querySelector<HTMLButtonElement>('.cb-ktp__btn--danger')!.click();
    await settle();
    expect(host.columns()[0].items.map((t) => t.id)).toEqual(['b']);
    expect(host.log.at(-1)![0]).toBe('delete');
    expect(panel()).toBeNull();
    await cleanup();
  });

  it('Escape cierra el panel y el foco vuelve a la tarjeta', async () => {
    const { open, settle, card, panel, cleanup } = await setup();
    const p = await open('Diseño');
    p.closest('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle();
    await settle();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(card('Diseño'));
    await cleanup();
  });

  it('el menú ⋮ ofrece "Abrir detalles"', async () => {
    const { el, settle, panel, cleanup } = await setup();
    el.querySelector<HTMLButtonElement>('[data-card-menu="b"]')!.click();
    await settle();
    const item = Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="menuitem"]')).find((m) => m.textContent!.includes('Abrir detalles'))!;
    item.click();
    await settle();
    expect(panel()!.querySelector<HTMLTextAreaElement>('.cb-ktp__title')!.value).toBe('API');
    await cleanup();
  });
});

describe('utilidades de tareas', () => {
  it('convierte fechas sin desfase de zona horaria', () => {
    const d = toDate('2030-03-10')!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2030, 2, 10]);
    expect(toIsoDay(d)).toBe('2030-03-10');
    expect(toDate('')).toBeNull();
    expect(toIsoDay(null)).toBeNull();
  });

  it('formatea rangos y tamaños', () => {
    expect(formatDateRange(toDate('2030-03-10'), toDate('2030-04-02'), 'es')).toMatch(/10 mar.* – 2 abr/);
    expect(formatDateRange(null, toDate('2030-03-14'), 'es')).toMatch(/14 mar/);
    expect(formatSize(820, 'es')).toBe('820 B');
    expect(formatSize(2.3 * 1024 * 1024, 'en')).toBe('2.3 MB');
  });
});
