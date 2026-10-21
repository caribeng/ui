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
  const caret = async (node: Node, select = false) => {
    surface().focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    if (!select) range.collapse(true);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    await settle();
  };
  const button = (label: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.getAttribute('aria-label') === label)!;
  const key = (target: HTMLElement, k: string, init: KeyboardEventInit = {}) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
  return { fixture, el, surface, settle, caret, button, key, host: fixture.componentInstance };
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

describe('CbEditor · barra', () => {
  it('es más alta por defecto y muestra palabras y caracteres al pie', async () => {
    const { surface, el, settle } = setup('<p>Hola mundo cruel</p>');
    await settle();
    expect(surface().style.minHeight).toBe('320px');
    expect(el.querySelector('.cb-editor__count')!.textContent!.trim()).toBe('3 palabras · 16 caracteres');
  });

  it('los tooltips llevan el atajo y aria-keyshortcuts', async () => {
    const { button } = setup('');
    expect(button('Negrita').getAttribute('title')).toBe('Negrita (Ctrl+B)');
    expect(button('Negrita').getAttribute('aria-keyshortcuts')).toBe('Control+B');
    expect(button('Lista de tareas').getAttribute('title')).toBe('Lista de tareas (Ctrl+Shift+9)');
  });

  it('la barra tiene dos filas: texto arriba, estructura abajo', () => {
    const { el } = setup('');
    const rows = Array.from(el.querySelectorAll('.cb-editor__toolbar > .cb-editor__row'));
    expect(rows).toHaveLength(2);
    const labels = (row: Element) => Array.from(row.querySelectorAll('[aria-label]')).map((n) => n.getAttribute('aria-label'));
    expect(labels(rows[0])).toEqual(expect.arrayContaining(['Deshacer', 'Estilo de párrafo', 'Fuente', 'Tamaño de letra', 'Negrita', 'Color del texto']));
    expect(labels(rows[1])).toEqual(expect.arrayContaining(['Lista con viñetas', 'Alineación', 'Insertar tabla', 'Caracteres especiales', 'Buscar y reemplazar', 'Pantalla completa']));
  });

  it('el selector de bloque incluye Título 4 y el tamaño de letra va en px', async () => {
    const { el, surface, caret, settle, host } = setup('<p>texto</p>');
    const [block, , size] = Array.from(el.querySelectorAll<HTMLSelectElement>('.cb-editor__toolbar select'));
    expect(Array.from(block.options).map((o) => o.value)).toEqual(['P', 'H1', 'H2', 'H3', 'H4']);
    expect(size.getAttribute('aria-label')).toBe('Tamaño de letra');
    expect(Array.from(size.options).map((o) => o.text.trim())).toEqual(['Normal', '10 px', '11 px', '12 px', '14 px', '16 px', '18 px', '20 px', '24 px', '28 px', '32 px', '36 px', '48 px']);
    // execCommand solo conoce 7 tamaños: el editor marca con el 7 y lo cambia por los px elegidos.
    exec.mockImplementation((cmd: string) => {
      if (cmd === 'fontSize') {
        const range = document.getSelection()!.getRangeAt(0);
        const font = document.createElement('font');
        font.setAttribute('size', '7');
        range.surroundContents(font);
      }
      return true;
    });
    await caret(surface().querySelector('p')!.firstChild!, true);
    size.value = '18px';
    size.dispatchEvent(new Event('change'));
    await settle();
    expect(exec).toHaveBeenCalledWith('fontSize', false, '7');
    expect(host.html()).toBe('<p><span style="font-size: 18px">texto</span></p>');
    expect(size.value).toBe('18px');
  });

  it('el selector de fuente agrupa las tipografías y aplica fontName con la pila CSS', async () => {
    const { el, surface, caret, settle } = setup('<p>texto</p>');
    const font = el.querySelector<HTMLSelectElement>('select[aria-label="Fuente"]')!;
    const groups = Array.from(font.querySelectorAll('optgroup')).map((g) => g.label);
    expect(groups).toEqual(['Predeterminada', 'Recomendadas', 'Clásicas de Office', 'Sans serif modernas', 'Serif', 'Monoespaciadas para código', 'Accesibilidad', 'Divertidas']);
    expect(Array.from(font.querySelectorAll('optgroup[label="Serif"] option')).map((o) => o.textContent!.trim())).toEqual(['Source Serif 4', 'Merriweather', 'Lora']);
    expect(font.value).toBe('');
    await caret(surface().querySelector('p')!.firstChild!, true);
    font.value = 'Lora, serif';
    font.dispatchEvent(new Event('change'));
    expect(exec).toHaveBeenCalledWith('styleWithCSS', false, 'true');
    expect(exec).toHaveBeenCalledWith('fontName', false, 'Lora, serif');
    // La hoja de Google Fonts se carga una sola vez por documento.
    await settle();
    expect(document.head.querySelectorAll('link[data-cb-editor-fonts]')).toHaveLength(1);
  });

  it('el selector de fuente muestra la tipografía donde está el cursor', async () => {
    const { el, surface, caret } = setup(`<p><span style="font-family: 'JetBrains Mono', monospace">código</span> texto</p>`);
    await caret(surface().querySelector('span')!.firstChild!);
    expect(el.querySelector<HTMLSelectElement>('select[aria-label="Fuente"]')!.value).toBe("'JetBrains Mono', monospace");
  });

  describe('menús de color y alineación', () => {
    it('el color de texto se abre con el teclado, se recorre con flechas y aplica foreColor con CSS', async () => {
      const { el, button, surface, caret, settle, key } = setup('<p>texto</p>');
      await caret(surface().querySelector('p')!.firstChild!, true);
      const trigger = button('Color del texto');
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
      key(trigger, 'ArrowDown');
      await settle();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      const menu = el.querySelector<HTMLElement>('[role="menu"]')!;
      expect(menu.getAttribute('aria-label')).toBe('Color del texto');
      const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      expect(items[0].textContent!.trim()).toBe('Automático');
      expect(items.slice(1).map((i) => i.getAttribute('aria-label'))).toContain('Rojo');
      expect(document.activeElement).toBe(items[0]);
      key(items[0], 'ArrowRight');
      expect(document.activeElement).toBe(items[1]);
      (items.find((i) => i.getAttribute('aria-label') === 'Azul') as HTMLButtonElement).click();
      await settle();
      expect(exec).toHaveBeenCalledWith('styleWithCSS', false, 'true');
      expect(exec).toHaveBeenCalledWith('foreColor', false, '#2563eb');
      expect(el.querySelector('[role="menu"]')).toBeNull();
    });

    it('"Automático" y "Sin resaltado" quitan el color de la selección', async () => {
      const { el, button, surface, caret, settle, host } = setup('<p><span style="color: #dc2626; background-color: #fef08a">rojo</span></p>');
      await caret(surface().querySelector('span')!, true);
      button('Color del texto').click();
      await settle();
      (el.querySelector('[role="menu"] [role="menuitem"]') as HTMLButtonElement).click();
      await settle();
      // Al quitar una propiedad, el navegador reescribe el estilo (los colores pasan a rgb()).
      expect(host.html()).toBe('<p><span style="background-color: rgb(254, 240, 138)">rojo</span></p>');
      await caret(surface().querySelector('span')!, true);
      button('Resaltado').click();
      await settle();
      (el.querySelector('[role="menu"] [role="menuitem"]') as HTMLButtonElement).click();
      await settle();
      expect(host.html()).toBe('<p>rojo</p>');
    });

    it('Escape cierra el menú y devuelve el foco al botón', async () => {
      const { el, button, settle, key } = setup('');
      const trigger = button('Resaltado');
      key(trigger, 'Enter');
      await settle();
      key(el.querySelector<HTMLElement>('[role="menu"]')!, 'Escape');
      await settle();
      expect(el.querySelector('[role="menu"]')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('la alineación es un menú de opciones con su atajo; justificar aplica justifyFull', async () => {
      const { el, button, settle } = setup('<p>a</p>');
      button('Alineación').click();
      await settle();
      const options = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
      expect(options.map((o) => o.querySelector(':scope > span')!.textContent)).toEqual(['Alinear a la izquierda', 'Centrar', 'Alinear a la derecha', 'Justificar']);
      expect(options[3].querySelector('kbd')!.textContent).toBe('Ctrl+Shift+J');
      options[3].click();
      expect(exec).toHaveBeenCalledWith('justifyFull', false, undefined);
    });
  });

  describe('sangría, tareas y pantalla completa', () => {
    it('la sangría de un párrafo va en pasos de 2rem y se puede reducir', async () => {
      const { surface, caret, button, host } = setup('<p>uno</p><p>dos</p>');
      await caret(surface().querySelector('p')!.firstChild!);
      button('Aumentar sangría').click();
      button('Aumentar sangría').click();
      expect(host.html()).toBe('<p style="margin-left: 4rem">uno</p><p>dos</p>');
      button('Reducir sangría').click();
      expect(host.html()).toBe('<p style="margin-left: 2rem">uno</p><p>dos</p>');
    });

    it('lista de tareas: convierte la lista, marca con clic en la casilla y con Ctrl + Enter', async () => {
      const { surface, caret, button, host, key, settle } = setup('<ul><li>Pagar la tarjeta</li><li>Revisar extracto</li></ul>');
      await caret(surface().querySelector('li')!.firstChild!);
      button('Lista de tareas').click();
      await settle();
      expect(host.html()).toBe('<ul data-type="taskList"><li data-checked="false">Pagar la tarjeta</li><li data-checked="false">Revisar extracto</li></ul>');
      expect(button('Lista de tareas').getAttribute('aria-pressed')).toBe('true');
      // Clic en la casilla (a la izquierda del texto).
      const li = surface().querySelector('li')!;
      li.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: li.getBoundingClientRect().left + 5 }));
      expect(host.html()).toContain('<li data-checked="true">Pagar la tarjeta</li>');
      await caret(surface().querySelectorAll('li')[1].firstChild!);
      key(surface(), 'Enter', { ctrlKey: true });
      expect(host.html()).toContain('<li data-checked="true">Revisar extracto</li>');
    });

    it('pantalla completa: aria-pressed, clase en el host y Escape sale', async () => {
      const { el, button, surface, settle, key } = setup('<p>a</p>');
      const host = el.querySelector('cb-editor')!;
      button('Pantalla completa').click();
      await settle();
      expect(host.classList).toContain('cb-is-fullscreen');
      const exit = button('Salir de pantalla completa');
      expect(exit.getAttribute('aria-pressed')).toBe('true');
      key(surface(), 'Escape');
      await settle();
      expect(host.classList).not.toContain('cb-is-fullscreen');
    });

    it('atajos: Ctrl + . superíndice, Ctrl + Shift + J justificar, Ctrl + ] sangría', async () => {
      const { surface, caret, key, host } = setup('<p>texto</p>');
      await caret(surface().querySelector('p')!.firstChild!);
      key(surface(), '.', { ctrlKey: true });
      expect(exec).toHaveBeenCalledWith('superscript', false, undefined);
      key(surface(), 'J', { ctrlKey: true, shiftKey: true });
      expect(exec).toHaveBeenCalledWith('justifyFull', false, undefined);
      key(surface(), ']', { ctrlKey: true });
      expect(host.html()).toBe('<p style="margin-left: 2rem">texto</p>');
    });
  });
});
