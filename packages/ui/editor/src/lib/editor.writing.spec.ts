import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CbEditor } from './editor.component';

@Component({
  imports: [CbEditor],
  template: `<cb-editor [(value)]="html" />`,
})
class HostComponent {
  html = signal('');
}

function setup(html: string) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.html.set(html);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const surface = () => el.querySelector<HTMLElement>('.cb-editor__surface')!;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  /** Cursor (o selección) en un nodo; `offset` coloca el cursor dentro de un texto. */
  const caret = async (node: Node, opts: { select?: boolean; offset?: number } = {}) => {
    surface().focus();
    const range = document.createRange();
    if (opts.offset !== undefined) range.setStart(node, opts.offset);
    else range.selectNodeContents(node);
    if (!opts.select) range.collapse(true);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    await settle();
  };
  /** Simula escribir: el texto ya está en el DOM, el cursor al final y llega el evento input. */
  const typed = async (text: Text, data: string) => {
    await caret(text, { offset: text.data.length });
    surface().dispatchEvent(new InputEvent('input', { inputType: 'insertText', data, bubbles: true }));
    await settle();
  };
  const button = (label: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.getAttribute('aria-label') === label)!;
  const key = (target: HTMLElement, k: string, init: KeyboardEventInit = {}) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
  return { fixture, el, surface, settle, caret, typed, button, key, host: fixture.componentInstance };
}

let exec: ReturnType<typeof vi.fn>;
beforeEach(() => {
  exec = vi.fn(() => true);
  (document as unknown as { execCommand: unknown }).execCommand = exec;
});
afterEach(() => {
  delete (document as unknown as { execCommand?: unknown }).execCommand;
  document.body.querySelectorAll('[ng-version]').forEach((n) => n.remove());
});

describe('CbEditor · escritura', () => {
  it('corrección tipográfica al escribir: (c) → ©, ... → …, -> → →, " -- " → raya; no en código', async () => {
    const { surface, typed, host } = setup('<p>Marca (c</p><pre>a -</pre>');
    const p = surface().querySelector('p')!.firstChild as Text;
    p.data = 'Marca (c)';
    await typed(p, ')');
    expect(host.html()).toContain('<p>Marca ©</p>');
    p.data += ' y luego...';
    await typed(p, '.');
    p.data += ' fin ->';
    await typed(p, '>');
    p.data += ' a -- ';
    await typed(p, ' ');
    expect(host.html()).toContain('<p>Marca © y luego… fin → a – </p>');
    const code = surface().querySelector('pre code')!.firstChild as Text;
    code.data = 'a ->';
    await typed(code, '>');
    expect(surface().querySelector('pre')!.textContent).toBe('a ->');
  });

  it('enlace automático: una URL seguida de un espacio se convierte en enlace (sin la puntuación final)', async () => {
    const { surface, typed, host } = setup('<p>Visita x</p>');
    const text = surface().querySelector('p')!.firstChild as Text;
    text.data = 'Visita www.banco.co ';
    await typed(text, ' ');
    expect(host.html()).toBe('<p>Visita <a href="https://www.banco.co">www.banco.co</a> </p>');
    const after = surface().querySelector('a')!.nextSibling as Text;
    after.data = ' y https://a.co/x. ';
    await typed(after, ' ');
    expect(host.html()).toBe('<p>Visita <a href="https://www.banco.co">www.banco.co</a> y <a href="https://a.co/x">https://a.co/x</a>. </p>');
  });

  it('pegar una URL con texto seleccionado lo convierte en enlace', async () => {
    const { surface, caret } = setup('<p>Ver sitio</p>');
    await caret(surface().querySelector('p')!.firstChild!, { select: true });
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: (t: string) => (t === 'text/plain' ? 'https://banco.co' : ''), files: [] } });
    surface().dispatchEvent(event);
    expect(exec).toHaveBeenCalledWith('createLink', false, 'https://banco.co');
  });

  describe('menú "/"', () => {
    it('se abre al escribir / al inicio, filtra lo escrito y Enter inserta el bloque (sin la /)', async () => {
      const { el, surface, typed, key, settle } = setup('<p>x</p>');
      const text = surface().querySelector('p')!.firstChild as Text;
      text.data = '/';
      await typed(text, '/');
      const list = el.querySelector<HTMLElement>('[role="listbox"]')!;
      expect(list.getAttribute('aria-label')).toBe('Insertar bloque');
      const options = Array.from(list.querySelectorAll('[role="option"]'));
      expect(options.map((o) => o.textContent!.trim())).toContain('Lista de tareas');
      expect(surface().getAttribute('aria-activedescendant')).toBe(options[0].id);
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      // Filtra sin importar tildes ni mayúsculas.
      text.data = '/tabl';
      await typed(text, 'l');
      expect(Array.from(el.querySelectorAll('[role="option"]')).map((o) => o.textContent!.trim())).toEqual(['Insertar tabla']);
      key(surface(), 'Enter');
      await settle();
      expect(el.querySelector('[role="listbox"]')).toBeNull();
      expect(surface().querySelector('p')!.textContent).toBe('');
      expect(el.querySelector('.cb-editor__picker')).not.toBeNull();
    });

    it('las flechas cambian la opción activa y Escape cierra; tras una letra no se abre', async () => {
      const { el, surface, typed, key, settle } = setup('<p>x</p>');
      const text = surface().querySelector('p')!.firstChild as Text;
      text.data = '/';
      await typed(text, '/');
      key(surface(), 'ArrowDown');
      await settle();
      const options = Array.from(el.querySelectorAll('[role="option"]'));
      expect(options[1].getAttribute('aria-selected')).toBe('true');
      expect(surface().getAttribute('aria-activedescendant')).toBe(options[1].id);
      key(surface(), 'Enter');
      await settle();
      expect(exec).toHaveBeenCalledWith('formatBlock', false, '<h1>');

      text.data = 'a/';
      await typed(text, '/');
      expect(el.querySelector('[role="listbox"]')).toBeNull();
      text.data = 'a /';
      await typed(text, '/');
      expect(el.querySelector('[role="listbox"]')).not.toBeNull();
      key(surface(), 'Escape');
      await settle();
      expect(el.querySelector('[role="listbox"]')).toBeNull();
      expect(surface().hasAttribute('aria-activedescendant')).toBe(false);
    });
  });

  describe('menú flotante', () => {
    it('aparece al seleccionar texto, aplica el formato y se oculta al quitar la selección', async () => {
      const { el, surface, caret, settle } = setup('<p>hola mundo</p>');
      await caret(surface().querySelector('p')!.firstChild!, { select: true });
      const bubble = el.querySelector<HTMLElement>('.cb-editor__bubble')!;
      expect(bubble.getAttribute('role')).toBe('toolbar');
      expect(bubble.getAttribute('aria-label')).toBe('Formato rápido');
      const labels = Array.from(bubble.querySelectorAll('button')).map((b) => b.getAttribute('aria-label'));
      expect(labels).toEqual(['Negrita', 'Cursiva', 'Subrayado', 'Tachado', 'Código', 'Insertar enlace', 'Limpiar formato']);
      bubble.querySelector<HTMLButtonElement>('[aria-label="Negrita"]')!.click();
      expect(exec).toHaveBeenCalledWith('bold', false, undefined);
      await caret(surface().querySelector('p')!.firstChild!);
      await settle();
      expect(el.querySelector('.cb-editor__bubble')).toBeNull();
    });

    it('Alt + F10 lleva el foco a la barra de herramientas', async () => {
      const { el, surface, key } = setup('<p>a</p>');
      surface().focus();
      key(surface(), 'F10', { altKey: true });
      expect(document.activeElement).toBe(el.querySelector('.cb-editor__toolbar [tabindex="0"]'));
    });
  });

  it('caracteres especiales: menú por grupos; un clic inserta el carácter', async () => {
    const { el, button, settle, key } = setup('<p>a</p>');
    const trigger = button('Caracteres especiales');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    key(trigger, 'ArrowDown');
    await settle();
    const menu = el.querySelector<HTMLElement>('[role="menu"]')!;
    const groups = Array.from(menu.querySelectorAll('[role="group"]')).map((g) => g.getAttribute('aria-label'));
    expect(groups).toEqual(['Monedas', 'Matemáticas', 'Puntuación y signos', 'Flechas', 'Emoji']);
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    expect(document.activeElement).toBe(items[0]);
    // Cuadrícula de 8 columnas.
    key(items[0], 'ArrowDown');
    expect(document.activeElement).toBe(items[8]);
    items.find((i) => i.textContent === '€')!.click();
    expect(exec).toHaveBeenCalledWith('insertText', false, '€');
  });

  describe('buscar y reemplazar', () => {
    const html = '<p>El banco y el Banco central</p><p>banco</p>';

    it('cuenta las coincidencias, recorre con Enter y respeta mayúsculas y palabras completas', async () => {
      const { el, button, settle } = setup(html);
      button('Buscar y reemplazar').click();
      await settle();
      const panel = el.querySelector<HTMLElement>('[role="search"]')!;
      expect(panel.getAttribute('aria-label')).toBe('Buscar y reemplazar');
      const find = panel.querySelector<HTMLInputElement>('input')!;
      expect(document.activeElement).toBe(find);
      const status = panel.querySelector('[role="status"]')!;
      find.value = 'banco';
      find.dispatchEvent(new Event('input'));
      await settle();
      expect(status.textContent!.trim()).toBe('1 de 3');
      find.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await settle();
      expect(status.textContent!.trim()).toBe('2 de 3');
      find.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
      find.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
      await settle();
      expect(status.textContent!.trim()).toBe('3 de 3');
      button('Mayúsculas y minúsculas').click();
      await settle();
      expect(button('Mayúsculas y minúsculas').getAttribute('aria-pressed')).toBe('true');
      expect(status.textContent!.trim()).toBe('1 de 2');
      find.value = 'banc';
      find.dispatchEvent(new Event('input'));
      button('Palabras completas').click();
      await settle();
      expect(status.textContent!.trim()).toBe('Sin resultados');
    });

    it('reemplaza la actual y todas (conservando el resto del texto)', async () => {
      const { el, button, settle, host } = setup(html);
      delete (document as unknown as { execCommand?: unknown }).execCommand;
      button('Buscar y reemplazar').click();
      await settle();
      const [find, replace] = Array.from(el.querySelectorAll<HTMLInputElement>('[role="search"] input'));
      find.value = 'banco';
      find.dispatchEvent(new Event('input'));
      replace.value = 'fondo';
      replace.dispatchEvent(new Event('input'));
      await settle();
      Array.from(el.querySelectorAll<HTMLButtonElement>('[role="search"] button')).find((b) => b.textContent!.trim() === 'Reemplazar')!.click();
      await settle();
      expect(host.html()).toBe('<p>El fondo y el Banco central</p><p>banco</p>');
      expect(el.querySelector('[role="search"] [role="status"]')!.textContent!.trim()).toBe('1 de 2');
      Array.from(el.querySelectorAll<HTMLButtonElement>('[role="search"] button')).find((b) => b.textContent!.trim() === 'Reemplazar todo')!.click();
      await settle();
      expect(host.html()).toBe('<p>El fondo y el fondo central</p><p>fondo</p>');
      expect(el.querySelector('[role="search"] [role="status"]')!.textContent!.trim()).toBe('Reemplazos hechos: 2');
    });

    it('Ctrl + F abre el panel con el texto seleccionado; Escape lo cierra y selecciona la coincidencia', async () => {
      const { el, surface, caret, key, settle } = setup(html);
      const range = document.createRange();
      const text = surface().querySelector('p')!.firstChild as Text;
      await caret(text);
      range.setStart(text, 3);
      range.setEnd(text, 8);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
      key(surface(), 'f', { ctrlKey: true });
      await settle();
      const find = el.querySelector<HTMLInputElement>('[role="search"] input')!;
      expect(find.value).toBe('banco');
      expect(el.querySelector('[role="search"] [role="status"]')!.textContent!.trim()).toBe('1 de 3');
      find.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(el.querySelector('[role="search"]')).toBeNull();
      expect(document.activeElement).toBe(surface());
      expect(document.getSelection()!.toString()).toBe('banco');
    });
  });
});
