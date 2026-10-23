import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbNotificationCenter } from './notification-center.component';
import { badgeText, groupNotifications, type CbNotification, type CbNotificationActionEvent } from './notification-model';

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const daysAgo = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

const LIST: CbNotification[] = [
  { id: 'n1', title: 'Transferencia recibida', text: '$ 250.000 de Luis Pérez', date: ago(5), severity: 'success' },
  { id: 'n2', title: 'Ana López te mencionó', date: ago(30), person: { name: 'Ana López' }, actions: [{ id: 'ver', label: 'Ver', severity: 'primary' }] },
  { id: 'n3', title: 'Pago de tarjeta', date: daysAgo(1), read: true, severity: 'warning' },
  { id: 'n4', title: 'Inicio de sesión nuevo', date: daysAgo(5), read: true, severity: 'danger' },
];

@Component({
  imports: [CbNotificationCenter],
  template: `
    <cb-notification-center
      [(notifications)]="list"
      [(open)]="open"
      [inline]="inline()"
      [showViewAll]="true"
      (itemClick)="clicked = $event"
      (actionClick)="action = $event"
      (markAll)="marked = marked + 1"
      (itemRemove)="removed = $event"
    />
  `,
})
class HostComponent {
  list = signal<readonly CbNotification[]>(LIST);
  open = signal(false);
  inline = signal(false);
  clicked?: CbNotification;
  action?: CbNotificationActionEvent;
  removed?: CbNotification;
  marked = 0;
}

describe('CbNotificationCenter', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup(inline = false) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.inline.set(inline);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const bell = () => el.querySelector<HTMLButtonElement>('.cb-nc__bell')!;
    const panel = () => document.querySelector<HTMLElement>('.cb-nc__panel');
    const items = () => Array.from(panel()?.querySelectorAll<HTMLElement>('.cb-nc__item') ?? []);
    const item = (title: string) => items().find((i) => i.textContent!.includes(title))!;
    const button = (scope: Element, text: string) =>
      Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim().startsWith(text))!;
    const openPanel = async () => {
      bell().click();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, el, host: fixture.componentInstance, bell, panel, items, item, button, openPanel };
  }

  it('la campana dice cuántas hay sin leer y muestra el contador', () => {
    const { bell } = setup();
    expect(bell().getAttribute('aria-label')).toBe('Notificaciones, 2 sin leer');
    expect(bell().getAttribute('aria-haspopup')).toBe('dialog');
    expect(bell().getAttribute('aria-expanded')).toBe('false');
    expect(bell().querySelector('.cb-nc__badge')!.textContent).toBe('2');
  });

  it('abre un diálogo con el título enfocado y los avisos agrupados por fecha', async () => {
    const { bell, panel, openPanel } = setup();
    await openPanel();
    expect(bell().getAttribute('aria-expanded')).toBe('true');
    const dialog = panel()!;
    expect(dialog.getAttribute('role')).toBe('dialog');
    const title = dialog.querySelector('#' + dialog.getAttribute('aria-labelledby'))!;
    expect(title.textContent!.trim()).toBe('Notificaciones');
    expect(document.activeElement).toBe(title);
    const groups = Array.from(dialog.querySelectorAll('.cb-nc__group')).map((g) => g.textContent);
    expect(groups).toEqual(['Hoy', 'Ayer', 'Anteriores']);
    expect(dialog.querySelector('.cb-nc__list')!.getAttribute('aria-labelledby')).toContain('-today');
  });

  it('un aviso sin leer se anuncia como tal y se marca al elegirlo; el panel se cierra', async () => {
    const { fixture, host, item, panel, openPanel } = setup();
    await openPanel();
    const main = item('Transferencia').querySelector<HTMLButtonElement>('.cb-nc__main')!;
    expect(main.textContent).toContain('No leída:');
    main.click();
    fixture.detectChanges();
    expect(host.clicked!.read).toBe(true);
    expect(host.list().find((n) => n.id === 'n1')!.read).toBe(true);
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('marcar todas como leídas vacía el contador y se desactiva', async () => {
    const { fixture, host, bell, panel, button, openPanel } = setup();
    await openPanel();
    const all = button(panel()!, 'Marcar todas');
    all.click();
    fixture.detectChanges();
    expect(host.marked).toBe(1);
    expect(host.list().every((n) => n.read)).toBe(true);
    expect(all.disabled).toBe(true);
    expect(bell().querySelector('.cb-nc__badge')).toBeNull();
    expect(bell().getAttribute('aria-label')).toBe('Notificaciones');
  });

  it('el filtro No leídas muestra solo las pendientes y su número', async () => {
    const { fixture, panel, items, button, openPanel } = setup();
    await openPanel();
    const unread = button(panel()!, 'No leídas');
    expect(unread.querySelector('.cb-nc__count')!.textContent).toBe('2');
    unread.click();
    fixture.detectChanges();
    expect(unread.getAttribute('aria-pressed')).toBe('true');
    expect(items().length).toBe(2);
  });

  it('cada aviso se marca como leído o no leído y se elimina, con nombre propio', async () => {
    const { fixture, host, item, openPanel } = setup();
    await openPanel();
    const tools = () => item('Pago de tarjeta').querySelectorAll<HTMLButtonElement>('.cb-nc__tool');
    expect(tools()[0].getAttribute('aria-label')).toBe('Marcar como no leída: Pago de tarjeta');
    tools()[0].click();
    fixture.detectChanges();
    expect(host.list().find((n) => n.id === 'n3')!.read).toBe(false);
    expect(tools()[1].getAttribute('aria-label')).toBe('Quitar Pago de tarjeta');
    tools()[1].click();
    fixture.detectChanges();
    expect(host.removed!.id).toBe('n3');
    expect(host.list().some((n) => n.id === 'n3')).toBe(false);
  });

  it('las acciones propias emiten actionClick y marcan el aviso como leído', async () => {
    const { fixture, host, item, button, openPanel } = setup();
    await openPanel();
    button(item('te mencionó'), 'Ver').click();
    fixture.detectChanges();
    expect(host.action!.action.id).toBe('ver');
    expect(host.action!.notification.read).toBe(true);
  });

  it('Escape cierra el panel y el foco vuelve a la campana', async () => {
    const { fixture, host, bell, panel, openPanel } = setup();
    await openPanel();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(bell());
  });

  it('anuncia los avisos nuevos sin leer que llegan después', () => {
    const { fixture, host, el } = setup();
    host.list.update((l) => [{ id: 'n9', title: 'Pedido enviado', date: new Date().toISOString() }, ...l]);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(el.querySelector('.cb-nc__sr[aria-live]')!.textContent).toBe('Nueva notificación: Pedido enviado');
  });

  it('con announceNew en false no anuncia los avisos nuevos', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [CbNotificationCenter] });
    const fixture = TestBed.createComponent(CbNotificationCenter);
    fixture.componentRef.setInput('announceNew', false);
    fixture.componentRef.setInput('notifications', LIST);
    fixture.detectChanges();
    fixture.componentRef.setInput('notifications', [{ id: 'n9', title: 'Pedido enviado', date: new Date().toISOString() }, ...LIST]);
    fixture.detectChanges();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.cb-nc__sr[aria-live]')!.textContent).toBe('');
  });

  it('inline pinta el panel en la página como región, sin campana', () => {
    const { el } = setup(true);
    expect(el.querySelector('.cb-nc__bell')).toBeNull();
    const region = el.querySelector('.cb-nc__panel')!;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.querySelector('.cb-nc__footer')!.textContent).toContain('Ver todas');
  });

  it('sin avisos muestra el estado vacío', () => {
    const { fixture, host, el } = setup(true);
    host.list.set([]);
    fixture.detectChanges();
    expect(el.querySelector('.cb-nc__empty')!.textContent).toContain('No tienes notificaciones.');
  });
});

describe('modelo de notificaciones', () => {
  it('ordena de la más reciente a la más antigua y agrupa por día', () => {
    const now = Date.now();
    const groups = groupNotifications(LIST, 'all', true, now);
    expect(groups.map((g) => g.key)).toEqual(['today', 'yesterday', 'earlier']);
    expect(groups[0].items.map((n) => n.id)).toEqual(['n1', 'n2']);
    expect(groupNotifications(LIST, 'unread', false, now)).toEqual([{ key: 'earlier', items: [LIST[0], LIST[1]] }]);
  });

  it('el contador se corta en max', () => {
    expect(badgeText(120, 99)).toBe('99+');
    expect(badgeText(7, 99)).toBe('7');
  });
});
