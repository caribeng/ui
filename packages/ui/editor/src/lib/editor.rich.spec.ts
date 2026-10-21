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
  /** Pone el cursor en un elemento del contenido y avisa del cambio de selección. */
  const caret = async (node: Node) => {
    surface().focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(true);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    await settle();
  };
  const button = (label: string, scope: ParentNode = el) =>
    Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.getAttribute('aria-label') === label)!;
  const bar = (name: string) => Array.from(el.querySelectorAll<HTMLElement>('.cb-editor__context')).find((b) => b.getAttribute('aria-label') === name);
  return { fixture, el, surface, settle, caret, button, bar, host: fixture.componentInstance };
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

const TABLE = '<table><thead><tr><th scope="col">Mes</th><th scope="col">Saldo</th></tr></thead><tbody><tr><td>Ene</td><td>10</td></tr></tbody></table>';

describe('CbEditor · tablas', () => {
  it('"Insertar tabla" abre un formulario y crea la tabla con su fila de encabezado', async () => {
    const { el, button, settle } = setup('<p>Texto</p>');
    await settle();
    button('Insertar tabla').click();
    await settle();
    const form = el.querySelector<HTMLFormElement>('form.cb-editor__link')!;
    expect(form.getAttribute('aria-label')).toBe('Insertar tabla');
    const [rows, cols] = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="number"]'));
    rows.value = '2';
    cols.value = '2';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
    expect(exec).toHaveBeenCalledWith(
      'insertHTML',
      false,
      '<table><thead><tr><th scope="col"><br></th><th scope="col"><br></th></tr></thead><tbody><tr><td><br></td><td><br></td></tr></tbody></table><p><br></p>',
    );
  });

  it('con el cursor en una celda aparece la barra de tabla; añade y quita filas y columnas', async () => {
    const { surface, caret, button, bar, host } = setup(TABLE);
    const td = () => surface().querySelector('tbody td')!;
    await caret(td());
    const tools = bar('Tabla')!;
    expect(tools.getAttribute('role')).toBe('toolbar');

    button('Insertar fila abajo', tools).click();
    expect(surface().querySelectorAll('tbody tr')).toHaveLength(2);
    await caret(td());
    button('Insertar columna a la derecha', bar('Tabla')!).click();
    expect(surface().querySelectorAll('thead th')).toHaveLength(3);
    expect(surface().querySelector('thead th:nth-child(2)')!.getAttribute('scope')).toBe('col');
    // Se quitan la columna nueva (2.ª) y la fila nueva (2.ª): queda la tabla de partida.
    await caret(surface().querySelector('tbody td:nth-child(2)')!);
    button('Eliminar columna', bar('Tabla')!).click();
    expect(surface().querySelectorAll('thead th')).toHaveLength(2);
    await caret(surface().querySelectorAll<HTMLTableRowElement>('tbody tr')[1].cells[0]);
    button('Eliminar fila', bar('Tabla')!).click();
    expect(host.html()).toBe(TABLE);
  });

  it('la fila de encabezado se puede quitar y volver a poner (aria-pressed)', async () => {
    const { surface, caret, button, bar, host } = setup(TABLE);
    await caret(surface().querySelector('td')!);
    const header = () => button('Fila de encabezado', bar('Tabla')!);
    expect(header().getAttribute('aria-pressed')).toBe('true');
    header().click();
    expect(host.html()).toBe('<table><tbody><tr><td>Mes</td><td>Saldo</td></tr><tr><td>Ene</td><td>10</td></tr></tbody></table>');
    await caret(surface().querySelector('td')!);
    expect(header().getAttribute('aria-pressed')).toBe('false');
    header().click();
    expect(host.html()).toBe(`${TABLE}`);
  });

  it('Tab pasa a la celda siguiente y, en la última, añade una fila; "Eliminar tabla" la quita', async () => {
    const { surface, caret, button, bar, host, settle } = setup(TABLE + '<p>Después</p>');
    const cells = () => Array.from(surface().querySelectorAll('th, td'));
    await caret(cells()[0]);
    surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.getSelection()!.anchorNode).toBe(cells()[1]);
    await caret(cells()[3]);
    surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(surface().querySelectorAll('tbody tr')).toHaveLength(2);
    await caret(cells()[0]);
    button('Eliminar tabla', bar('Tabla')!).click();
    await settle();
    expect(host.html()).toBe('<p>Después</p>');
    expect(bar('Tabla')).toBeUndefined();
  });
});

describe('CbEditor · imágenes', () => {
  const IMG = '<p>Texto <img src="https://cdn.test/foto.png" alt="Foto"> más texto</p>';

  it('clic en una imagen: barra de imagen, alineación y ancho con aria-pressed', async () => {
    const { surface, settle, button, bar, host, el } = setup(IMG);
    await settle();
    surface().querySelector('img')!.click();
    await settle();
    const tools = bar('Imagen')!;
    expect(el.querySelector('.cb-editor__img-frame')).not.toBeNull();
    expect(button('En línea con el texto', tools).getAttribute('aria-pressed')).toBe('true');
    button('Centrar', tools).click();
    await settle();
    expect(host.html()).toBe('<p>Texto <img src="https://cdn.test/foto.png" alt="Foto" style="display: block; margin: 0.5rem auto"> más texto</p>');
    button('Ancho 50%', bar('Imagen')!).click();
    await settle();
    expect(host.html()).toContain('style="width: 50%; height: auto; display: block; margin: 0.5rem auto"');
    expect(button('Ancho 50%', bar('Imagen')!).getAttribute('aria-pressed')).toBe('true');
    expect(button('Centrar', bar('Imagen')!).getAttribute('aria-pressed')).toBe('true');
    button('Alinear a la derecha', bar('Imagen')!).click();
    button('Tamaño original', bar('Imagen')!).click();
    await settle();
    expect(host.html()).toContain('style="float: right; margin: 0 0 0.5rem 1rem"');
  });

  it('texto alternativo y eliminar; al escribir se deselecciona', async () => {
    const { surface, settle, button, bar, host, el } = setup(IMG);
    await settle();
    surface().querySelector('img')!.click();
    await settle();
    button('Texto alternativo', bar('Imagen')!).click();
    await settle();
    const form = Array.from(el.querySelectorAll<HTMLFormElement>('form')).find((f) => f.getAttribute('aria-label') === 'Texto alternativo')!;
    form.querySelector<HTMLInputElement>('input')!.value = 'Extracto de octubre';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
    expect(host.html()).toContain('alt="Extracto de octubre"');
    button('Eliminar imagen', bar('Imagen')!).click();
    await settle();
    expect(host.html()).toBe('<p>Texto  más texto</p>');

    const again = setup(IMG);
    await again.settle();
    again.surface().querySelector('img')!.click();
    await again.settle();
    again.surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    await again.settle();
    expect(again.bar('Imagen')).toBeUndefined();
  });
});

describe('CbEditor · código', () => {
  function paste(target: HTMLElement, data: Record<string, string>) {
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: (type: string) => data[type] ?? '', files: [] } });
    target.dispatchEvent(event);
  }

  it('pegar desde VS Code conserva colores y anota el lenguaje', async () => {
    const { surface, settle } = setup('<p>Antes</p>');
    await settle();
    paste(surface(), {
      'text/html': '<div style="color: #cccccc;background-color: #1f1f1f;white-space: pre;"><div><span style="color: #569cd6;">let</span><span style="color: #cccccc;"> x;</span></div></div>',
      'text/plain': 'let x;',
      'vscode-editor-data': '{"version":1,"isFromEmptySelection":false,"multicursorText":null,"mode":"typescript"}',
    });
    expect(exec).toHaveBeenCalledWith(
      'insertHTML',
      false,
      '<pre data-language="typescript" style="color: #cccccc; background-color: #1f1f1f"><code><span style="color: #569cd6">let</span><span style="color: #cccccc"> x;</span></code></pre>',
    );
  });

  it('dentro de un bloque de código se pega como texto y Tab inserta espacios', async () => {
    const { surface, caret } = setup('<pre><code>const a = 1;</code></pre>');
    await caret(surface().querySelector('code')!.firstChild!);
    paste(surface(), { 'text/html': '<b>x</b>', 'text/plain': 'x' });
    expect(exec).toHaveBeenCalledWith('insertText', false, 'x');
    surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(exec).toHaveBeenCalledWith('insertText', false, '  ');
  });

  it('"Bloque de código" en la barra convierte el bloque en <pre> y marca aria-pressed', async () => {
    const { surface, caret, button, settle } = setup('<p>linea</p><pre><code>x</code></pre>');
    await caret(surface().querySelector('p')!.firstChild!);
    button('Bloque de código').click();
    expect(exec).toHaveBeenCalledWith('formatBlock', false, '<pre>');
    await caret(surface().querySelector('code')!.firstChild!);
    await settle();
    expect(button('Bloque de código').getAttribute('aria-pressed')).toBe('true');
  });
});
