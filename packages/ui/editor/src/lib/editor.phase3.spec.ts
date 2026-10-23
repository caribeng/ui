import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbEditor, type CbEditorMention } from './editor.component';
import { addCaption, buildToc, ensureHeadingIds, highlightCodeBlock, mergeCells, mergeTarget, removeCaption, slugify, splitCell, tableGrid } from './editor-blocks';
import { cbSanitizeHtml } from './html-sanitizer';

const html = (markup: string) => {
  const div = document.createElement('div');
  div.innerHTML = markup;
  document.body.append(div);
  return div;
};

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
});

describe('Editor fase 3: saneado', () => {
  it('conserva figura con pie, desplegables, índice, ids de títulos, menciones y el marcado del código', () => {
    const out = cbSanitizeHtml(
      '<h2 id="resumen">Resumen</h2>' +
        '<figure style="width: 40%; float: left; margin: 0 1rem 0.5rem 0" onclick="x()"><img src="a.png" alt="A" style="width: 100%"><figcaption>Pie <script>y()</script></figcaption></figure>' +
        '<details open><summary>Título</summary><p>Cuerpo</p></details>' +
        '<nav data-type="toc"><ol><li><a href="#resumen">Resumen</a></li></ol></nav>' +
        '<p>Hola <span data-mention="laura" style="color:red">@Laura</span></p>' +
        '<pre data-language="python" data-highlight="auto"><code>x = 1</code></pre>',
    );
    expect(out).toContain('<h2 id="resumen">');
    expect(out).toContain('<figure style="width: 40%; height: auto; float: left; margin: 0 1rem 0.5rem 0"><img src="a.png" alt="A" style="width: 100%; height: auto"><figcaption>Pie </figcaption></figure>');
    expect(out).toContain('<details open=""><summary>Título</summary><p>Cuerpo</p></details>');
    expect(out).toContain('<nav data-type="toc"><ol><li><a href="#resumen">Resumen</a></li></ol></nav>');
    expect(out).toContain('<span data-mention="laura">@Laura</span>');
    expect(out).toContain('<pre data-language="python" data-highlight="auto">');
    expect(out).not.toContain('onclick');
  });

  it('descarta lo que no encaja: ids inválidos, nav que no es índice, figura sin imagen y pie suelto', () => {
    const out = cbSanitizeHtml('<h2 id="1 malo">T</h2><nav><p>Menú</p></nav><figure><figcaption>Solo pie</figcaption></figure><figcaption>Suelto</figcaption>');
    expect(out).toBe('<h2>T</h2><p>Menú</p><p>Solo pie</p><p>Suelto</p>');
  });

  it('las tablas con rowspan no se rellenan con celdas de más', () => {
    const out = cbSanitizeHtml('<table><tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></tbody></table>');
    expect(out).toBe('<table><tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></tbody></table>');
  });
});

describe('Editor fase 3: bloques', () => {
  it('colorea un bloque de código por lenguaje y lo deja en texto si se quita', () => {
    const root = html('<pre><code>const a = 1; // nota</code></pre>');
    const pre = root.querySelector('pre')!;
    highlightCodeBlock(pre, 'typescript', document);
    expect(pre.getAttribute('data-language')).toBe('typescript');
    expect(pre.getAttribute('data-highlight')).toBe('auto');
    expect(pre.style.backgroundColor).toBeTruthy();
    expect(pre.querySelector('span[style*="font-style: italic"]')!.textContent).toBe('// nota');
    expect(pre.textContent).toBe('const a = 1; // nota');
    highlightCodeBlock(pre, '', document);
    expect(pre.hasAttribute('data-language')).toBe(false);
    expect(pre.hasAttribute('style')).toBe(false);
    expect(pre.querySelectorAll('span').length).toBe(0);
  });

  it('combina celdas a la derecha y abajo, y las vuelve a separar', () => {
    const root = html('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr></tbody></table>');
    const cell = (t: string) => Array.from(root.querySelectorAll('td')).find((c) => c.textContent!.startsWith(t))!;
    expect(mergeCells(cell('A'), 'right')).toBe(true);
    expect(cell('A').getAttribute('colspan')).toBe('2');
    expect(cell('A').innerHTML).toBe('A<br>B');
    // Abajo hay dos celdas de ancho 1: no se puede.
    expect(mergeTarget(cell('A'), 'down')).toBeNull();
    expect(mergeCells(cell('C'), 'down')).toBe(true);
    expect(cell('C').getAttribute('rowspan')).toBe('2');
    expect(tableGrid(root.querySelector('table')!).map((r) => r.map((c) => c!.textContent![0]))).toEqual([['A', 'A', 'C'], ['D', 'E', 'C']]);
    expect(splitCell(cell('A'))).toBe(true);
    expect(splitCell(cell('C'))).toBe(true);
    expect(Array.from(root.querySelectorAll('tr')).map((r) => r.cells.length)).toEqual([3, 3]);
  });

  it('añade y quita el pie: la figura se lleva el ancho y la alineación', () => {
    const root = html('<p>Antes <img src="a.png" style="width: 50%; height: auto; float: right; margin: 0 0 0.5rem 1rem"> después</p>');
    const img = root.querySelector('img')!;
    const caption = addCaption(img, document);
    const figure = root.querySelector('figure')!;
    expect(caption.tagName).toBe('FIGCAPTION');
    expect(figure.getAttribute('style')).toContain('width: 50%');
    expect(figure.getAttribute('style')).toContain('float: right');
    expect(img.getAttribute('style')).toBe('width: 100%; height: auto');
    expect(Array.from(root.children).map((c) => c.tagName)).toEqual(['P', 'FIGURE', 'P']);
    removeCaption(img, document);
    expect(root.querySelector('figure')).toBeNull();
    expect(img.getAttribute('style')).toContain('width: 50%');
  });

  it('el índice enlaza los títulos (anidados por nivel) con ids únicos', () => {
    const root = html('<h2>1. Resumen</h2><h3>Detalle</h3><h3>Detalle</h3><h2>Cierre</h2>');
    const headings = ensureHeadingIds(root);
    expect(headings.map((h) => h.id)).toEqual(['resumen', 'detalle', 'detalle-2', 'cierre']);
    const nav = document.createElement('nav');
    buildToc(nav, headings, 'Contenido', document);
    expect(nav.querySelector('p')!.textContent).toBe('Contenido');
    const top = nav.querySelector(':scope > ol')!;
    expect(Array.from(top.children).map((li) => li.querySelector('a')!.textContent)).toEqual(['1. Resumen', 'Cierre']);
    expect(Array.from(top.querySelectorAll('li li a')).map((a) => a.getAttribute('href'))).toEqual(['#detalle', '#detalle-2']);
    expect(slugify('Condiciones del crédito')).toBe('condiciones-del-credito');
  });
});

@Component({
  imports: [CbEditor],
  template: `<cb-editor #ed [(value)]="html" [mentions]="people" [autosaveKey]="key()" [autosaveDelay]="10" />`,
})
class HostComponent {
  html = signal('');
  key = signal('');
  people: CbEditorMention[] = [{ id: 'laura', label: 'Laura Gómez' }];
}

async function setup(value: string, key = '') {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.html.set(value);
  fixture.componentInstance.key.set(key);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 20));
      fixture.detectChanges();
      await fixture.whenStable();
    }
  };
  await settle();
  const el = fixture.nativeElement as HTMLElement;
  const editor = fixture.debugElement.children[0].componentInstance as CbEditor;
  return { fixture, el, editor, settle, host: fixture.componentInstance, surface: () => el.querySelector<HTMLElement>('.cb-editor__surface')! };
}

describe('Editor fase 3: componente', () => {
  it('genera el índice al cargar y marca índice y menciones como no editables', async () => {
    const { surface, editor } = await setup('<nav data-type="toc"></nav><h2>Uno</h2><p>Hola <span data-mention="laura">@Laura Gómez</span></p><h2>Dos</h2>');
    const nav = surface().querySelector('nav[data-type="toc"]')!;
    expect(nav.getAttribute('contenteditable')).toBe('false');
    expect(Array.from(nav.querySelectorAll('a')).map((a) => a.textContent)).toEqual(['Uno', 'Dos']);
    expect(surface().querySelector('[data-mention]')!.getAttribute('contenteditable')).toBe('false');
    expect(editor.getMentions()).toEqual(['laura']);
  });

  it('autoguardado: guarda el borrador, lo ofrece al volver y se restaura o se borra', async () => {
    localStorage.setItem('cb-editor-draft:acta', JSON.stringify({ html: '<p>Borrador anterior</p>', savedAt: Date.UTC(2026, 9, 1, 15, 30) }));
    const { el, editor, settle, host } = await setup('<p>Versión guardada</p>', 'acta');
    const banner = el.querySelector('.cb-editor__draft')!;
    expect(banner.textContent).toContain('Hay un borrador sin guardar');
    Array.from(banner.querySelectorAll('button')).find((b) => b.textContent!.includes('Restaurar'))!.click();
    await settle();
    expect(host.html()).toBe('<p>Borrador anterior</p>');
    expect(el.querySelector('.cb-editor__draft')).toBeNull();

    editor.clearDraft();
    expect(localStorage.getItem('cb-editor-draft:acta')).toBeNull();
  });

  it('autoguardado: al escribir guarda en localStorage y muestra la hora al pie', async () => {
    const { el, surface, settle } = await setup('<p>Hola</p>', 'nota');
    surface().innerHTML = '<p>Hola mundo</p>';
    surface().dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 40));
    await settle();
    const saved = JSON.parse(localStorage.getItem('cb-editor-draft:nota')!);
    expect(saved.html).toBe('<p>Hola mundo</p>');
    expect(el.querySelector('.cb-editor__saved')!.textContent).toContain('Borrador guardado');
  });

  it('sin autosaveKey no guarda nada', async () => {
    const { surface } = await setup('<p>Hola</p>');
    surface().innerHTML = '<p>Otro</p>';
    surface().dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 40));
    expect(localStorage.length).toBe(0);
  });
});
