import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbKanban, type CbKanbanCardEvent, type CbKanbanColumn, type CbKanbanColumnEvent, type CbKanbanMove } from './kanban.component';

interface Task {
  id: string;
  title: string;
}

const start = (): CbKanbanColumn<Task>[] => [
  { id: 'todo', title: 'Por hacer', items: [{ id: 'a', title: 'Diseño' }, { id: 'b', title: 'API' }] },
  { id: 'doing', title: 'En curso', items: [{ id: 'c', title: 'Login' }] },
];

@Component({
  imports: [CbKanban],
  template: `
    <cb-kanban
      [(columns)]="columns"
      editable
      addable
      columnsEditable
      collapsible
      [createCard]="create"
      (cardMove)="log.push(['move', $event])"
      (cardAdd)="log.push(['add', $event])"
      (cardEdit)="log.push(['edit', $event])"
      (cardDelete)="log.push(['delete', $event])"
      (columnAdd)="log.push(['columnAdd', $event])"
      (columnRename)="log.push(['columnRename', $event])"
      (columnDelete)="log.push(['columnDelete', $event])"
    />
  `,
})
class Host {
  columns = signal<readonly CbKanbanColumn[]>(start());
  log: [string, CbKanbanMove | CbKanbanCardEvent | CbKanbanColumnEvent][] = [];
  private n = 0;
  create = (title: string) => ({ id: `nueva-${++this.n}`, title });
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
  const card = (title: string) => Array.from(el.querySelectorAll<HTMLElement>('.cb-kanban__card')).find((c) => c.textContent!.includes(title));
  const titles = (col: number) => host.columns()[col].items.map((t) => (t as Task).title);
  const key = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="menuitem"]'));
  const status = () => el.querySelector('[role="status"]')!.textContent;
  return { fixture, el, host, settle, card, titles, key, menuItems, status };
}

describe('CbKanban editable', () => {
  it('el menú ⋮ de la tarjeta tiene nombre, es hermano de la tarjeta y ofrece editar, mover y eliminar', async () => {
    const { el, card, menuItems, settle, fixture } = await setup();
    const button = el.querySelector<HTMLButtonElement>('[data-card-menu="a"]')!;
    expect(button.getAttribute('aria-label')).toBe('Acciones de Diseño');
    expect(card('Diseño')!.contains(button)).toBe(false);
    button.click();
    await settle();
    expect(menuItems().map((m) => m.textContent!.trim())).toEqual(['Editar', 'Mover a En curso', 'Eliminar']);
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    await settle();
    fixture.nativeElement.remove();
  });

  it('F2 edita el título: Enter guarda, emite cardEdit y devuelve el foco', async () => {
    const { el, card, key, host, titles, status, fixture } = await setup();
    await key(card('API')!, 'F2');
    const field = el.querySelector<HTMLTextAreaElement>('.cb-kanban__editor textarea')!;
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute('aria-label')).toBe('Título de la tarjeta');
    field.value = 'API de pagos';
    await key(field, 'Enter');
    expect(titles(0)).toEqual(['Diseño', 'API de pagos']);
    expect(host.log[0]).toEqual(['edit', { item: { id: 'b', title: 'API de pagos' }, previous: { id: 'b', title: 'API' }, column: 'todo', index: 1 }]);
    expect(status()).toBe('«API» ahora es «API de pagos».');
    expect(document.activeElement).toBe(card('API de pagos'));
    fixture.nativeElement.remove();
  });

  it('Escape cancela la edición sin cambios', async () => {
    const { el, card, key, titles, host, fixture } = await setup();
    await key(card('Login')!, 'F2');
    const field = el.querySelector<HTMLTextAreaElement>('.cb-kanban__editor textarea')!;
    field.value = 'Otro';
    await key(field, 'Escape');
    expect(titles(1)).toEqual(['Login']);
    expect(host.log).toHaveLength(0);
    fixture.nativeElement.remove();
  });

  it('Supr pide confirmación (foco en Cancelar); Eliminar borra, emite y enfoca la tarjeta vecina', async () => {
    const { el, card, key, titles, host, status, settle, fixture } = await setup();
    await key(card('Diseño')!, 'Delete');
    const confirm = el.querySelector('.cb-kanban__confirm--card')!;
    expect(confirm.textContent).toContain('¿Eliminar «Diseño»?');
    expect(document.activeElement!.textContent!.trim()).toBe('Cancelar');
    confirm.querySelector<HTMLButtonElement>('.cb-kanban__btn--danger')!.click();
    await settle();
    expect(titles(0)).toEqual(['API']);
    expect(host.log[0]).toEqual(['delete', { item: { id: 'a', title: 'Diseño' }, column: 'todo', index: 0 }]);
    expect(status()).toBe('Diseño eliminada.');
    expect(document.activeElement).toBe(card('API'));
    fixture.nativeElement.remove();
  });

  it('"Mover a" lleva la tarjeta al final de otra columna y emite cardMove', async () => {
    const { el, menuItems, titles, host, settle, fixture } = await setup();
    el.querySelector<HTMLButtonElement>('[data-card-menu="a"]')!.click();
    await settle();
    menuItems()[1].click();
    await settle();
    expect(titles(0)).toEqual(['API']);
    expect(titles(1)).toEqual(['Login', 'Diseño']);
    expect(host.log[0]).toEqual(['move', { item: { id: 'a', title: 'Diseño' }, from: 'todo', to: 'doing', fromIndex: 0, toIndex: 1 }]);
    fixture.nativeElement.remove();
  });

  it('añadir tarjetas: el campo usa createCard, queda abierto para seguir y Escape lo cierra', async () => {
    const { el, key, titles, host, status, settle, fixture } = await setup();
    el.querySelector<HTMLButtonElement>('[data-add="doing"]')!.click();
    await settle();
    const field = el.querySelector<HTMLTextAreaElement>('.cb-kanban__composer textarea')!;
    expect(document.activeElement).toBe(field);
    field.value = 'Tests';
    await key(field, 'Enter');
    expect(titles(1)).toEqual(['Login', 'Tests']);
    expect(host.log[0]).toEqual(['add', { item: { id: 'nueva-1', title: 'Tests' }, column: 'doing', index: 1 }]);
    expect(status()).toBe('Tests añadida a En curso.');
    expect(el.querySelector<HTMLTextAreaElement>('.cb-kanban__composer textarea')!.value).toBe('');
    await key(el.querySelector('.cb-kanban__composer textarea')!, 'Escape');
    expect(el.querySelector('.cb-kanban__composer')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('[data-add="doing"]'));
    fixture.nativeElement.remove();
  });

  it('columnas: renombrar desde el menú, eliminar con confirmación y añadir una nueva', async () => {
    const { el, menuItems, key, host, settle, fixture } = await setup();
    el.querySelector<HTMLButtonElement>('[data-column-menu="doing"]')!.click();
    await settle();
    expect(menuItems().map((m) => m.textContent!.trim())).toEqual(['Renombrar', 'Añadir tarjeta', 'Eliminar']);
    menuItems()[0].click();
    await settle();
    const input = el.querySelector<HTMLInputElement>('.cb-kanban__title-input')!;
    expect(document.activeElement).toBe(input);
    input.value = 'Haciendo';
    await key(input, 'Enter');
    expect(host.columns()[1].title).toBe('Haciendo');
    expect(host.log[0]).toEqual(['columnRename', { column: expect.objectContaining({ id: 'doing', title: 'Haciendo' }), previousTitle: 'En curso' }]);

    el.querySelector<HTMLButtonElement>('[data-column-menu="doing"]')!.click();
    await settle();
    menuItems()[2].click();
    await settle();
    expect(el.textContent).toContain('¿Eliminar la columna «Haciendo» y sus 1 tarjetas?');
    Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-kanban__btn--danger')).at(-1)!.click();
    await settle();
    expect(host.columns().map((c) => c.id)).toEqual(['todo']);

    el.querySelector<HTMLButtonElement>('.cb-kanban__add-column')!.click();
    await settle();
    expect(host.columns()).toHaveLength(2);
    expect(host.columns()[1].title).toBe('Nueva columna');
    expect(document.activeElement).toBe(el.querySelector('.cb-kanban__title-input'));
    fixture.nativeElement.remove();
  });

  it('contraer una columna oculta sus tarjetas y lo anuncia con aria-expanded', async () => {
    const { el, settle, fixture } = await setup();
    const toggle = el.querySelector<HTMLButtonElement>('[aria-label="Contraer Por hacer"]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await settle();
    const section = el.querySelectorAll('section')[0];
    expect(section.classList).toContain('cb-kanban__column--collapsed');
    expect(el.querySelector('[aria-label="Expandir Por hacer"]')!.getAttribute('aria-expanded')).toBe('false');
    fixture.nativeElement.remove();
  });
});
