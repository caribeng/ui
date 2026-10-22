import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKanban, CbKanbanCardDirective, type CbKanbanColumn, type CbKanbanMove } from './kanban.component';

interface Task {
  id: number;
  title: string;
}

const COLUMNS: CbKanbanColumn<Task>[] = [
  { id: 'todo', title: 'Por hacer', items: [{ id: 1, title: 'Diseño' }, { id: 2, title: 'API' }] },
  { id: 'doing', title: 'En curso', items: [{ id: 3, title: 'Login' }], limit: 1 },
  { id: 'done', title: 'Hecho', items: [] },
];

@Component({
  imports: [CbKanban, CbKanbanCardDirective],
  template: `
    <cb-kanban [(columns)]="columns" [enforceLimit]="enforce()" ariaLabel="Sprint" (cardMove)="moves.push($event)" (cardOpen)="opened = $event.title">
      <ng-template cbKanbanCard let-task><strong class="title">{{ task.title }}</strong></ng-template>
    </cb-kanban>
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn[]>(COLUMNS);
  enforce = signal(false);
  moves: CbKanbanMove[] = [];
  opened = '';
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;
  const card = (title: string) =>
    Array.from(el.querySelectorAll<HTMLElement>('.cb-kanban__card')).find((c) => c.textContent!.includes(title))!;
  const titles = (col: number) => host.columns()[col].items.map((t) => (t as Task).title);
  const key = async (target: HTMLElement, k: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const status = () => el.querySelector('[role="status"]')!.textContent;
  return { fixture, el, host, card, titles, key, status };
}

describe('CbKanban', () => {
  it('columnas nombradas con su contador, listas y tarjetas enfocables con instrucciones', () => {
    const { el, card, fixture } = setup();
    const sections = el.querySelectorAll('section');
    expect(sections).toHaveLength(3);
    const heading = el.querySelector(`#${sections[1].getAttribute('aria-labelledby')}`)!;
    expect(heading.textContent).toBe('En curso');
    expect(sections[1].querySelector('.cb-kanban__count')!.textContent!.trim()).toBe('1 de 1');
    expect(el.querySelectorAll('[role="list"]')).toHaveLength(3);
    const c = card('Diseño');
    expect(c.getAttribute('tabindex')).toBe('0');
    expect(c.getAttribute('aria-roledescription')).toBe('tarjeta');
    expect(el.querySelector(`#${c.getAttribute('aria-describedby')}`)!.textContent).toContain('pulsa Espacio');
    expect(c.querySelector('strong.title')).not.toBeNull();
    expect(sections[2].textContent).toContain('Sin datos');
    fixture.nativeElement.remove();
  });

  it('teclado: Espacio toma, flechas mueven (con anuncios), Espacio suelta y emite cardMove', async () => {
    const { card, titles, key, status, host, fixture } = setup();
    await key(card('Diseño'), ' ');
    expect(card('Diseño').getAttribute('aria-pressed')).toBe('true');
    expect(status()).toBe('Diseño tomada. Columna Por hacer, posición 1 de 2.');

    await key(card('Diseño'), 'ArrowDown');
    expect(titles(0)).toEqual(['API', 'Diseño']);
    expect(document.activeElement).toBe(card('Diseño'));

    await key(card('Diseño'), 'ArrowRight');
    expect(titles(0)).toEqual(['API']);
    expect(titles(1)).toEqual(['Login', 'Diseño']);
    expect(status()).toBe('Diseño: columna En curso, posición 2 de 2.');

    await key(card('Diseño'), ' ');
    expect(card('Diseño').getAttribute('aria-pressed')).toBe('false');
    expect(host.moves).toEqual([{ item: { id: 1, title: 'Diseño' }, from: 'todo', to: 'doing', fromIndex: 0, toIndex: 1 }]);
    expect(status()).toBe('Diseño soltada en En curso, posición 2.');
    fixture.nativeElement.remove();
  });

  it('Escape cancela y devuelve la tarjeta a su sitio sin emitir', async () => {
    const { card, titles, key, status, host, fixture } = setup();
    await key(card('API'), ' ');
    await key(card('API'), 'ArrowRight');
    await key(card('API'), 'ArrowRight');
    expect(titles(2)).toEqual(['API']);
    await key(card('API'), 'Escape');
    expect(titles(0)).toEqual(['Diseño', 'API']);
    expect(titles(2)).toEqual([]);
    expect(host.moves).toHaveLength(0);
    expect(status()).toBe('Movimiento cancelado. API vuelve a Por hacer.');
    fixture.nativeElement.remove();
  });

  it('con enforceLimit salta las columnas llenas', async () => {
    const { card, titles, key, host, fixture } = setup();
    host.enforce.set(true);
    fixture.detectChanges();
    await key(card('Diseño'), ' ');
    await key(card('Diseño'), 'ArrowRight');
    expect(titles(1)).toEqual(['Login']);
    expect(titles(2)).toEqual(['Diseño']);
    fixture.nativeElement.remove();
  });

  it('Enter abre la tarjeta; soltar con ratón (CDK) mueve y emite', () => {
    const { el, card, key, host, fixture } = setup();
    void key(card('Login'), 'Enter');
    expect(host.opened).toBe('Login');

    // Simula el evento de la CDK al soltar en otra lista.
    const kanban = fixture.debugElement.children[0].componentInstance as CbKanban;
    const cols = host.columns();
    (kanban as unknown as { onDrop: (e: unknown) => void }).onDrop({
      previousContainer: { data: cols[1] },
      container: { data: cols[2] },
      previousIndex: 0,
      currentIndex: 0,
    });
    fixture.detectChanges();
    expect(host.columns()[2].items.map((t) => (t as Task).title)).toEqual(['Login']);
    expect(host.moves.at(-1)).toEqual({ item: { id: 3, title: 'Login' }, from: 'doing', to: 'done', fromIndex: 0, toIndex: 0 });
    expect(el.querySelector('[role="status"]')!.textContent).toBe('Login soltada en Hecho, posición 1.');
    fixture.nativeElement.remove();
  });
});
