import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CbCommandPalette } from './command-palette.component';
import { type CbCommandItem, cbCommandFilter, cbCommandHighlight, cbCommandScore } from './command-filter';

const ITEMS: CbCommandItem[] = [
  { label: 'Inicio', icon: 'house', group: 'Páginas' },
  { label: 'Configuración', icon: 'settings', group: 'Páginas', keywords: ['ajustes', 'preferencias'] },
  { label: 'Transferir dinero', group: 'Acciones', shortcut: ['mod', 'T'] },
  { label: 'Pagar servicios', group: 'Acciones', disabled: true },
  { label: 'Buscar usuario', icon: 'search', group: 'Acciones', description: 'Por nombre o documento' },
];

describe('cbCommandFilter', () => {
  it('ignora tildes y mayúsculas y prioriza el inicio del label', () => {
    expect(cbCommandScore(ITEMS[1], 'CONFIGURACION')).toBe(100);
    expect(cbCommandScore(ITEMS[2], 'dinero')).toBe(80);
    expect(cbCommandScore(ITEMS[1], 'ajustes')).toBe(50);
    expect(cbCommandScore(ITEMS[4], 'documento')).toBe(30);
    expect(cbCommandScore(ITEMS[1], 'cfg')).toBe(10);
    expect(cbCommandScore(ITEMS[0], 'xyz')).toBe(0);
  });

  it('sin búsqueda conserva el orden y agrupa; con búsqueda ordena por relevancia', () => {
    expect(cbCommandFilter(ITEMS, '').map((g) => [g.label, g.items.length])).toEqual([
      ['Páginas', 2],
      ['Acciones', 3],
    ]);
    const groups = cbCommandFilter(ITEMS, 'usu');
    expect(groups.flatMap((g) => g.items.map((i) => i.label))).toEqual(['Buscar usuario']);
  });

  it('resalta la coincidencia respetando las tildes del original', () => {
    expect(cbCommandHighlight('Configuración', 'racion')).toEqual([
      { text: 'Configu', match: false },
      { text: 'ración', match: true },
    ]);
  });
});

@Component({
  imports: [CbCommandPalette],
  template: `
    <button type="button" id="before">antes</button>
    <cb-command-palette [items]="items" [(visible)]="visible" (itemSelect)="chosen = $event.item.label" />
  `,
})
class Host {
  items = ITEMS;
  visible = signal(false);
  chosen = '';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const input = () => document.querySelector<HTMLInputElement>('.cb-command__input');
  const options = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="option"]'));
  const key = async (k: string, init: KeyboardEventInit = {}) => {
    input()!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const type = async (text: string) => {
    input()!.value = text;
    input()!.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  return { fixture, host: fixture.componentInstance, settle, input, options, key, type };
}

describe('CbCommandPalette', () => {
  it('Ctrl+K abre un diálogo con combobox, enfoca el campo y Escape cierra devolviendo el foco', async () => {
    const { host, settle, input, options, fixture } = await setup();
    const before = document.getElementById('before')!;
    before.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }));
    await settle();
    expect(host.visible()).toBe(true);
    const dialog = document.querySelector('.cb-command')!;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Paleta de comandos');
    expect(input()!.getAttribute('role')).toBe('combobox');
    expect(document.activeElement).toBe(input());
    expect(options()).toHaveLength(5);

    document.querySelector('.cdk-overlay-pane')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(host.visible()).toBe(false);
    expect(document.activeElement).toBe(before);
    fixture.nativeElement.remove();
  });

  it('las flechas mueven aria-activedescendant saltando los deshabilitados', async () => {
    const { host, settle, input, options, key, fixture } = await setup();
    host.visible.set(true);
    await settle();
    const activeLabel = () => document.getElementById(input()!.getAttribute('aria-activedescendant')!)!.textContent!.trim();
    expect(activeLabel()).toContain('Inicio');
    await key('ArrowDown');
    await key('ArrowDown');
    expect(activeLabel()).toContain('Transferir dinero');
    await key('ArrowDown');
    expect(activeLabel()).toContain('Buscar usuario');
    expect(options()[3].getAttribute('aria-disabled')).toBe('true');
    await key('ArrowDown');
    expect(activeLabel()).toContain('Inicio');
    await key('ArrowUp');
    expect(activeLabel()).toContain('Buscar usuario');
    host.visible.set(false);
    await settle();
    fixture.nativeElement.remove();
  });

  it('escribir filtra y resalta; Enter elige, ejecuta command y cierra', async () => {
    const { host, settle, options, key, type, fixture } = await setup();
    const command = vi.fn();
    host.items = [...ITEMS.slice(0, 2), { ...ITEMS[2], command }, ...ITEMS.slice(3)];
    fixture.detectChanges();
    host.visible.set(true);
    await settle();
    await type('transf');
    expect(options().map((o) => o.querySelector('.cb-command__label')!.textContent!.trim())).toEqual(['Transferir dinero']);
    expect(options()[0].querySelector('mark')!.textContent).toBe('Transf');
    expect(document.querySelector('.cb-command__status')!.textContent).toBe('1 resultados');
    expect(options()[0].querySelector('cb-kbd')).not.toBeNull();
    await key('Enter');
    expect(host.chosen).toBe('Transferir dinero');
    expect(command).toHaveBeenCalledWith(expect.objectContaining({ query: 'transf' }));
    expect(host.visible()).toBe(false);
    fixture.nativeElement.remove();
  });

  it('muestra "Sin resultados" y no elige un item deshabilitado con clic', async () => {
    const { host, settle, options, type, fixture } = await setup();
    host.visible.set(true);
    await settle();
    await type('pagar');
    options()[0].click();
    await settle();
    expect(host.chosen).toBe('');
    expect(host.visible()).toBe(true);
    await type('zzzz');
    expect(document.querySelector('.cb-command__empty')!.textContent!.trim()).toBe('Sin resultados');
    host.visible.set(false);
    await settle();
    fixture.nativeElement.remove();
  });
});
