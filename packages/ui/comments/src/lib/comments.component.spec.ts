import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbEditor } from '@caribeng/ui/editor';
import { CbComments } from './comments.component';
import {
  buildFeed,
  mentionIds,
  relativeTime,
  removeComment,
  toggleReaction,
  type CbActivity,
  type CbComment,
  type CbCommentEvent,
  type CbCommentPerson,
  type CbCommentReactionEvent,
} from './comments-model';

const ANA: CbCommentPerson = { id: 'ana', name: 'Ana López' };
const LUIS: CbCommentPerson = { id: 'luis', name: 'Luis Pérez' };
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const COMMENTS: CbComment[] = [
  { id: 'c1', author: LUIS, html: '<p>Subo el informe hoy, <span data-mention="ana">@Ana López</span>.</p>', date: ago(120), reactions: [{ emoji: '👍', by: ['luis'] }] },
  { id: 'c2', author: ANA, html: '<p>Gracias</p>', date: ago(60), parentId: 'c1' },
  { id: 'c3', author: ANA, html: '<p>Mío</p>', date: ago(30) },
];
const ACTIVITY: CbActivity[] = [{ id: 'a1', author: LUIS, text: 'movió esta tarea a En curso', date: ago(90) }];

@Component({
  imports: [CbComments],
  template: `
    <cb-comments
      [(comments)]="comments"
      [activity]="activity()"
      [currentUser]="me()"
      [people]="people"
      [readonly]="readonly()"
      (commentAdd)="added = $event"
      (commentEdit)="edited = $event"
      (commentDelete)="deleted = $event"
      (reactionToggle)="reaction = $event"
    />
  `,
})
class HostComponent {
  comments = signal<readonly CbComment[]>(COMMENTS);
  activity = signal<readonly CbActivity[]>(ACTIVITY);
  me = signal<CbCommentPerson | null>(ANA);
  readonly = signal(false);
  people = [ANA, LUIS];
  added?: CbCommentEvent;
  edited?: CbCommentEvent;
  deleted?: CbComment;
  reaction?: CbCommentReactionEvent;
}

describe('CbComments', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const articles = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-comment'));
    const article = (text: string) => articles().find((a) => a.textContent!.includes(text))!;
    const button = (scope: HTMLElement, text: string) =>
      Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim() === text)!;
    return { fixture, el, host: fixture.componentInstance, articles, article, button };
  }

  /** Escribe en la caja `draft` (`new`, `reply:<id>` o `edit:<id>`) como lo haría el editor. */
  function type(fixture: ComponentFixture<HostComponent>, draft: string, html: string) {
    const editor = fixture.debugElement.query(By.css(`[data-draft="${draft}"]`)).query(By.directive(CbEditor));
    (editor.componentInstance as CbEditor).value.set(html);
    fixture.detectChanges();
  }

  it('intercala comentarios y actividad por fecha, con las respuestas dentro de su hilo', () => {
    const { el } = setup();
    const top = Array.from(el.querySelectorAll('.cb-comments__feed > li')).map((li) => li.className);
    expect(top).toEqual(['cb-comments__thread', 'cb-comments__activity', 'cb-comments__thread']);
    const replies = el.querySelector('.cb-comments__replies')!;
    expect(replies.getAttribute('aria-label')).toBe('Respuestas a Luis Pérez');
    expect(replies.textContent).toContain('Gracias');
    expect(el.querySelector('.cb-comments__activity')!.textContent).toContain('Luis Pérez');
  });

  it('el filtro muestra solo comentarios o solo actividad', () => {
    const { fixture, el, button } = setup();
    const filter = el.querySelector<HTMLElement>('.cb-comments__filter')!;
    expect(filter.getAttribute('role')).toBe('group');
    button(filter, 'Actividad').click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.cb-comment').length).toBe(0);
    expect(el.querySelectorAll('.cb-comments__activity').length).toBe(1);
    expect(button(filter, 'Actividad').getAttribute('aria-pressed')).toBe('true');
    button(filter, 'Comentarios').click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.cb-comments__activity').length).toBe(0);
  });

  it('cada comentario es un artículo nombrado por su autor y su fecha', () => {
    const { article } = setup();
    const a = article('Subo el informe');
    const head = a.querySelector('#' + a.getAttribute('aria-labelledby'))!;
    expect(head.textContent).toContain('Luis Pérez');
    expect(head.querySelector('time')!.textContent!.trim()).toBe('hace 2 horas');
    expect(head.querySelector('time')!.getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('sanea el HTML y resalta las menciones a quien lee', () => {
    const { fixture, host, el } = setup();
    host.comments.set([{ id: 'x', author: LUIS, html: '<p>Hola <img src=x onerror="alert(1)"><script>alert(1)</script><span data-mention="ana">@Ana López</span></p>', date: ago(5) }]);
    fixture.detectChanges();
    const body = el.querySelector('.cb-comment__body')!;
    expect(body.querySelector('script')).toBeNull();
    expect(body.innerHTML).not.toContain('onerror');
    expect(body.querySelector('[data-mention="ana"]')!.hasAttribute('data-self')).toBe(true);
  });

  it('publica un comentario con sus menciones y vacía la caja', () => {
    const { fixture, host, el, button } = setup();
    const composer = el.querySelector<HTMLElement>('.cb-comments__composer')!;
    const send = button(composer, 'Comentar');
    expect(send.disabled).toBe(true);
    type(fixture, 'new', '<p>Listo <span data-mention="luis">@Luis Pérez</span></p>');
    expect(send.disabled).toBe(false);
    send.click();
    fixture.detectChanges();
    expect(host.added!.mentions).toEqual(['luis']);
    expect(host.added!.comment.author).toEqual(ANA);
    expect(host.comments().length).toBe(4);
    expect(el.textContent).toContain('Listo');
    expect(send.disabled).toBe(true);
  });

  it('Ctrl + Enter envía desde el editor', () => {
    const { fixture, host, el } = setup();
    type(fixture, 'new', '<p>Atajo</p>');
    el.querySelector('[data-draft="new"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    fixture.detectChanges();
    expect(host.added!.comment.html).toBe('<p>Atajo</p>');
  });

  it('responde en el hilo raíz, también desde una respuesta', () => {
    const { fixture, host, el, article, button } = setup();
    button(article('Gracias'), 'Responder').click();
    fixture.detectChanges();
    expect(el.querySelector('[data-draft="reply:c1"]')).toBeTruthy();
    type(fixture, 'reply:c1', '<p>De nada</p>');
    button(el.querySelector('[data-draft="reply:c1"]')!, 'Responder').click();
    fixture.detectChanges();
    expect(host.added!.comment.parentId).toBe('c1');
    expect(el.querySelector('[data-draft="reply:c1"]')).toBeNull();
    expect(el.querySelector('.cb-comments__replies')!.textContent).toContain('De nada');
  });

  it('Escape cancela la respuesta', () => {
    const { fixture, el, article, button } = setup();
    button(article('Subo el informe'), 'Responder').click();
    fixture.detectChanges();
    el.querySelector('[data-draft="reply:c1"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelector('[data-draft="reply:c1"]')).toBeNull();
  });

  it('solo se editan y eliminan los propios; la edición marca "editado"', () => {
    const { fixture, host, article, button } = setup();
    expect(button(article('Subo el informe'), 'Editar')).toBeUndefined();
    button(article('Mío'), 'Editar').click();
    fixture.detectChanges();
    type(fixture, 'edit:c3', '<p>Mío, corregido</p>');
    button(article('Mío'), 'Guardar').click();
    fixture.detectChanges();
    expect(host.edited!.comment.html).toBe('<p>Mío, corregido</p>');
    expect(article('corregido').textContent).toContain('(editado)');
  });

  it('eliminar pide confirmación; con respuestas queda como "Comentario eliminado"', () => {
    const { fixture, host, el, article, button } = setup();
    host.me.set(LUIS);
    fixture.detectChanges();
    button(article('Subo el informe'), 'Eliminar').click();
    fixture.detectChanges();
    const confirm = el.querySelector<HTMLElement>('.cb-comment__confirm')!;
    expect(confirm.textContent).toContain('¿Eliminar este comentario?');
    button(confirm, 'Eliminar').click();
    fixture.detectChanges();
    expect(host.deleted!.id).toBe('c1');
    expect(host.comments().find((c) => c.id === 'c1')!.deleted).toBe(true);
    expect(el.querySelector('.cb-comment__deleted')!.textContent).toBe('Comentario eliminado');
    expect(el.textContent).toContain('Gracias');
  });

  it('las reacciones dicen quién reaccionó y se ponen o quitan', () => {
    const { fixture, host, article } = setup();
    const chip = () => article('Subo el informe').querySelector<HTMLButtonElement>('.cb-comment__reaction')!;
    expect(chip().getAttribute('aria-label')).toBe('👍, 1: Luis Pérez');
    expect(chip().getAttribute('aria-pressed')).toBe('false');
    chip().click();
    fixture.detectChanges();
    expect(host.reaction).toMatchObject({ emoji: '👍', added: true });
    expect(chip().getAttribute('aria-label')).toBe('👍, 2: Luis Pérez y tú');
    expect(chip().getAttribute('aria-pressed')).toBe('true');
  });

  it('el selector de emojis añade una reacción nueva y se cierra con Escape', () => {
    const { fixture, host, article } = setup();
    const a = () => article('Mío');
    const toggle = () => a().querySelector<HTMLButtonElement>('[aria-label="Añadir reacción"]')!;
    toggle().click();
    fixture.detectChanges();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    const picker = a().querySelector<HTMLElement>('.cb-comment__picker')!;
    expect(picker.getAttribute('aria-label')).toBe('Reacciones');
    picker.querySelectorAll<HTMLButtonElement>('.cb-comment__emoji')[1].click();
    fixture.detectChanges();
    expect(host.reaction).toMatchObject({ emoji: '❤️', added: true });
    expect(a().querySelector('.cb-comment__picker')).toBeNull();
    toggle().click();
    fixture.detectChanges();
    a().querySelector('.cb-comment__picker')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(a().querySelector('.cb-comment__picker')).toBeNull();
  });

  it('sin currentUser o con readonly no hay caja ni acciones', () => {
    const { fixture, host, el } = setup();
    host.readonly.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.cb-comments__composer')).toBeNull();
    expect(el.querySelector('.cb-comment__action')).toBeNull();
    expect(el.querySelector<HTMLButtonElement>('.cb-comment__reaction')!.disabled).toBe(true);
    host.readonly.set(false);
    host.me.set(null);
    fixture.detectChanges();
    expect(el.querySelector('.cb-comments__composer')).toBeNull();
  });

  it('sin comentarios muestra el mensaje vacío y sin actividad no hay filtro', () => {
    const { fixture, host, el } = setup();
    host.comments.set([]);
    host.activity.set([]);
    fixture.detectChanges();
    expect(el.querySelector('.cb-comments__empty')!.textContent).toBe('Todavía no hay comentarios.');
    expect(el.querySelector('.cb-comments__filter')).toBeNull();
  });
});

describe('modelo de comentarios', () => {
  it('buildFeed: una respuesta sin padre se muestra como raíz y un eliminado sin respuestas se oculta', () => {
    const list: CbComment[] = [
      { id: 'r', author: ANA, html: '<p>x</p>', date: ago(1), parentId: 'no-existe' },
      { id: 'd', author: ANA, html: '', date: ago(2), deleted: true },
    ];
    const feed = buildFeed(list, [], 'all', 'newest');
    expect(feed.map((i) => (i.kind === 'comment' ? i.comment.id : ''))).toEqual(['r']);
  });

  it('removeComment quita también el padre eliminado que se queda sin respuestas', () => {
    const list: CbComment[] = [
      { id: 'p', author: ANA, html: '', date: ago(3), deleted: true },
      { id: 'h', author: LUIS, html: '<p>h</p>', date: ago(2), parentId: 'p' },
    ];
    expect(removeComment(list, 'h')).toEqual([]);
  });

  it('toggleReaction quita la reacción que se queda sin nadie', () => {
    expect(toggleReaction([{ emoji: '👍', by: ['ana'] }], '👍', 'ana')).toEqual({ reactions: [], added: false });
  });

  it('mentionIds no repite', () => {
    expect(mentionIds('<span data-mention="a">@A</span> <span data-mention="b">@B</span> <span data-mention="a">@A</span>')).toEqual(['a', 'b']);
  });

  it('relativeTime: ahora, minutos, ayer y fecha corta', () => {
    const now = Date.UTC(2026, 9, 23, 12);
    expect(relativeTime(now - 20_000, now, 'es', 'ahora mismo')).toBe('ahora mismo');
    expect(relativeTime(now - 5 * 60_000, now, 'es', '')).toBe('hace 5 minutos');
    expect(relativeTime(now - 26 * 3600_000, now, 'es', '')).toBe('ayer');
    expect(relativeTime(now - 30 * 86400_000, now, 'en', '')).toBe('Sep 23, 2026');
  });
});
