import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CbEditor, type CbEditorImageUpload, type CbEditorTool } from './editor.component';

@Component({
  imports: [CbEditor],
  template: `
    <cb-editor
      [(value)]="html"
      [readonly]="readonly()"
      [maxLength]="max()"
      [toolbar]="toolbar()"
      [maxImageSize]="maxImage()"
      [imageUpload]="upload()"
      [pastePlainText]="plain()"
    />
  `,
})
class HostComponent {
  html = signal('');
  readonly = signal(false);
  max = signal<number | undefined>(undefined);
  toolbar = signal<readonly CbEditorTool[]>(['bold', 'italic', 'link', 'image', 'source']);
  maxImage = signal(1_048_576);
  upload = signal<CbEditorImageUpload | undefined>(undefined);
  plain = signal(false);
}

function setup(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const surface = () => el.querySelector<HTMLElement>('.cb-editor__surface')!;
  const tool = (label: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-editor__tool')).find((b) => b.getAttribute('aria-label') === label)!;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, el, surface, tool, settle, host: fixture.componentInstance };
}

/** jsdom no implementa execCommand: se espía para ver qué inserta el editor. */
let exec: ReturnType<typeof vi.fn>;
beforeEach(() => {
  exec = vi.fn(() => true);
  (document as unknown as { execCommand: unknown }).execCommand = exec;
});
afterEach(() => {
  delete (document as unknown as { execCommand?: unknown }).execCommand;
  document.body.querySelectorAll('[ng-version]').forEach((n) => n.remove());
});

function paste(target: HTMLElement, data: Record<string, string>, files: File[] = []): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { getData: (type: string) => data[type] ?? '', files } });
  target.dispatchEvent(event);
  return event;
}

describe('CbEditor · HTML seguro, enlaces, pegar, límites y vistas', () => {
  it('el HTML que llega se sanea antes de pintarlo (sin scripts ni eventos)', async () => {
    const { surface, settle, host } = setup((h) => h.html.set('<p onclick="x()">Hola</p><img src=x onerror="alert(1)"><script>alert(1)</script>'));
    await settle();
    expect(surface().innerHTML).toBe('<p>Hola</p>');
    // El valor no se reescribe al cargar (no marca el formulario como modificado).
    expect(host.html()).toContain('onerror');
  });

  it('al editar emite HTML normalizado y "" cuando queda vacío', async () => {
    const { surface, settle, host } = setup((h) => h.html.set('<p>Hola</p>'));
    await settle();
    surface().innerHTML = '<div><b>Hola</b> mundo</div>';
    surface().dispatchEvent(new Event('input'));
    expect(host.html()).toBe('<p><strong>Hola</strong> mundo</p>');
    surface().innerHTML = '<p><br></p>';
    surface().dispatchEvent(new Event('input'));
    expect(host.html()).toBe('');
    await settle();
    expect(surface().classList).toContain('cb-is-empty');
  });

  it('pegar desde una web inserta el HTML saneado; pastePlainText pega solo texto', async () => {
    const { surface } = setup();
    const event = paste(surface(), { 'text/html': '<p style="color:red" onclick="x()">Hola <script>bad()</script><b>mundo</b></p>', 'text/plain': 'Hola mundo' });
    expect(event.defaultPrevented).toBe(true);
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<p>Hola <strong>mundo</strong></p>');

    const plain = setup((h) => h.plain.set(true));
    exec.mockClear();
    paste(plain.surface(), { 'text/html': '<b>x</b>', 'text/plain': 'x' });
    expect(exec).toHaveBeenCalledWith('insertText', false, 'x');
  });

  it('la barra es configurable y marca la herramienta activa con aria-pressed', async () => {
    const { el, tool } = setup();
    const labels = Array.from(el.querySelectorAll('.cb-editor__tool')).map((b) => b.getAttribute('aria-label'));
    expect(labels).toEqual(['Negrita', 'Cursiva', 'Insertar enlace', 'Insertar imagen', 'Ver HTML']);
    expect(el.querySelector('.cb-editor__select')).toBeNull();
    expect(tool('Negrita').getAttribute('aria-pressed')).toBe('false');
    expect(tool('Insertar imagen').hasAttribute('aria-pressed')).toBe(false);
    // Cada herramienta tiene icono (no letras).
    expect(tool('Negrita').querySelector('cb-icon')).not.toBeNull();
  });

  describe('enlaces', () => {
    it('el botón abre un panel propio (sin window.prompt) y rechaza javascript:', async () => {
      const prompt = vi.spyOn(window, 'prompt');
      const { el, tool, settle } = setup((h) => h.html.set('<p>texto</p>'));
      await settle();
      tool('Insertar enlace').click();
      await settle();
      expect(prompt).not.toHaveBeenCalled();
      const form = el.querySelector<HTMLFormElement>('.cb-editor__link')!;
      expect(form.getAttribute('role')).toBe('group');
      const input = form.querySelector<HTMLInputElement>('.cb-editor__link-input')!;
      input.value = 'javascript:alert(1)';
      input.dispatchEvent(new Event('input'));
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await settle();
      const error = el.querySelector('.cb-editor__error')!;
      expect(error.getAttribute('role')).toBe('alert');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(error.id);
      expect(exec).not.toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('javascript'));
    });

    it('editar un enlace existente: cambia la URL (www → https://), abre en pestaña nueva y se puede quitar', async () => {
      const { el, surface, tool, settle, host } = setup((h) => h.html.set('<p>Ver <a href="https://a.co">sitio</a></p>'));
      await settle();
      const anchor = surface().querySelector('a')!;
      const range = document.createRange();
      range.selectNodeContents(anchor);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
      tool('Insertar enlace').click();
      await settle();
      const input = el.querySelector<HTMLInputElement>('.cb-editor__link-input')!;
      expect(input.value).toBe('https://a.co');
      input.value = 'www.banco.co';
      input.dispatchEvent(new Event('input'));
      el.querySelector<HTMLInputElement>('.cb-editor__link-check input')!.click();
      el.querySelector<HTMLFormElement>('.cb-editor__link')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await settle();
      expect(host.html()).toBe('<p>Ver <a href="https://www.banco.co" target="_blank" rel="noopener noreferrer">sitio</a></p>');

      // Quitar el enlace conserva el texto.
      const again = document.createRange();
      again.selectNodeContents(surface().querySelector('a')!);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(again);
      tool('Insertar enlace').click();
      await settle();
      Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-editor__btn')).find((b) => b.textContent!.includes('Quitar enlace'))!.click();
      await settle();
      expect(host.html()).toBe('<p>Ver sitio</p>');
    });
  });

  describe('límites', () => {
    it('maxLength muestra el contador, impide escribir de más y marca inválido si se supera', async () => {
      const { el, surface, settle } = setup((h) => {
        h.max.set(10);
        h.html.set('<p>12345678</p>');
      });
      await settle();
      const count = el.querySelector('.cb-editor__count')!;
      expect(count.textContent!.trim()).toBe('1 palabra · 8 de 10 caracteres');
      expect(surface().getAttribute('aria-describedby')).toBe(count.id);
      const blocked = new InputEvent('beforeinput', { inputType: 'insertText', data: 'abc', cancelable: true });
      surface().dispatchEvent(blocked);
      expect(blocked.defaultPrevented).toBe(true);
      const allowed = new InputEvent('beforeinput', { inputType: 'insertText', data: 'ab', cancelable: true });
      surface().dispatchEvent(allowed);
      expect(allowed.defaultPrevented).toBe(false);
      // Pegar más de lo que cabe recorta el texto.
      exec.mockClear();
      paste(surface(), { 'text/plain': 'abcdef' });
      expect(exec).toHaveBeenCalledWith('insertText', false, 'ab');
      surface().innerHTML = '<p>1234567890123</p>';
      surface().dispatchEvent(new Event('input'));
      await settle();
      expect(count.classList).toContain('cb-is-over');
      expect(surface().getAttribute('aria-invalid')).toBe('true');
    });

    it('imagen sin imageUpload: si supera maxImageSize avisa y no la inserta', async () => {
      const { fixture, el, settle } = setup((h) => h.maxImage.set(10));
      const editor = fixture.debugElement.children[0].componentInstance as CbEditor;
      await editor.insertImage(new File(['x'.repeat(50)], 'grande.png', { type: 'image/png' }));
      await settle();
      expect(el.querySelector('.cb-editor__error')!.textContent).toContain('tamaño máximo');
      expect(exec).not.toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('<img'));
    });

    it('con imageUpload, el HTML guarda la URL devuelta (no la imagen en base64)', async () => {
      const upload = vi.fn(async () => 'https://cdn.banco.co/img/42.png');
      const { fixture } = setup((h) => h.upload.set(upload));
      const editor = fixture.debugElement.children[0].componentInstance as CbEditor;
      await editor.insertImage(new File(['png'], 'logo.png', { type: 'image/png' }));
      expect(upload).toHaveBeenCalled();
      expect(exec).toHaveBeenCalledWith('insertHTML', false, '<img src="https://cdn.banco.co/img/42.png" alt="logo">');
    });
  });

  describe('vistas', () => {
    it('readonly muestra el contenido saneado sin barra ni edición', async () => {
      const { el, surface, settle } = setup((h) => {
        h.readonly.set(true);
        h.html.set('<p>Contrato <a href="javascript:x()">firmado</a></p>');
      });
      await settle();
      expect(el.querySelector('.cb-editor__toolbar')).toBeNull();
      expect(surface().getAttribute('contenteditable')).toBe('false');
      expect(surface().getAttribute('aria-readonly')).toBe('true');
      expect(surface().innerHTML).toBe('<p>Contrato firmado</p>');
    });

    it('la vista de HTML muestra el código y, al volver, sanea lo escrito a mano', async () => {
      const { el, tool, settle, host } = setup((h) => h.html.set('<p>Hola</p>'));
      await settle();
      tool('Ver HTML').click();
      await settle();
      const source = el.querySelector<HTMLTextAreaElement>('.cb-editor__source')!;
      expect(source.value).toBe('<p>Hola</p>');
      expect(tool('Negrita').disabled).toBe(true);
      expect(tool('Ver HTML').getAttribute('aria-pressed')).toBe('true');
      source.value = '<p>Nuevo <img src=x onerror="alert(1)"></p>';
      source.dispatchEvent(new Event('input'));
      tool('Ver HTML').click();
      await settle();
      // "x" no es una imagen válida: el <img> se elimina entero (con su onerror).
      expect(host.html()).toBe('<p>Nuevo </p>');
      expect(el.querySelector('.cb-editor__source')).toBeNull();
    });
  });
});
