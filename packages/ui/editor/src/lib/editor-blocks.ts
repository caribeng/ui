/**
 * Bloques de la fase 3 del editor: código coloreado por lenguaje, celdas
 * combinadas, pie de imagen e índice del documento. Son funciones sobre el
 * DOM del área editable (sin estado); el componente decide cuándo llamarlas.
 */
import { cbCodeLanguageLabel, cbCodeSupports, cbHighlight, type CbCodeTokenType } from '@caribeng/ui/code-block';
import { imageStyle, readImageStyle } from './html-sanitizer';

// --- Código ------------------------------------------------------------------------------

/** Lenguajes del selector del bloque de código (`''` = texto sin colorear). */
export const CODE_LANGUAGES = ['', 'typescript', 'javascript', 'html', 'css', 'scss', 'json', 'bash', 'python', 'sql'] as const;

export function codeLanguageLabel(language: string): string {
  return cbCodeLanguageLabel(language);
}

/**
 * Colores de un tema oscuro (como VS Code): van en línea en el HTML, así el
 * bloque se ve igual dentro y fuera del editor, en tema claro u oscuro.
 */
const CODE_FG = '#d4d4d4';
const CODE_BG = '#1e1e1e';
const PALETTE: Partial<Record<CbCodeTokenType, string>> = {
  keyword: '#569cd6',
  builtin: '#4ec9b0',
  string: '#ce9178',
  number: '#b5cea8',
  comment: '#6a9955',
  function: '#dcdcaa',
  tag: '#569cd6',
  attr: '#9cdcfe',
  property: '#9cdcfe',
  variable: '#9cdcfe',
};

/**
 * Cambia el lenguaje de un bloque de código y lo colorea (si el lenguaje se
 * conoce). El texto no cambia; el cursor se conserva si estaba dentro.
 */
export function highlightCodeBlock(pre: HTMLElement, language: string, doc: Document): void {
  const sel = doc.getSelection();
  const caret = sel?.rangeCount && pre.contains(sel.anchorNode) ? textOffset(pre, sel.anchorNode!, sel.anchorOffset) : null;
  const text = (pre.textContent ?? '').replace(/​/g, '');
  if (language) pre.setAttribute('data-language', language);
  else pre.removeAttribute('data-language');
  const code = doc.createElement('code');
  if (language && cbCodeSupports(language)) {
    pre.setAttribute('data-highlight', 'auto');
    pre.setAttribute('style', `color: ${CODE_FG}; background-color: ${CODE_BG}`);
    cbHighlight(text, language).forEach((line, i) => {
      if (i) code.append('\n');
      for (const token of line) {
        const color = PALETTE[token.type];
        if (!color) {
          code.append(token.text);
          continue;
        }
        const span = doc.createElement('span');
        span.setAttribute('style', token.type === 'comment' ? `color: ${color}; font-style: italic` : `color: ${color}`);
        span.textContent = token.text;
        code.append(span);
      }
    });
  } else {
    // Sin colores propios: el bloque vuelve al estilo del editor.
    if (pre.getAttribute('data-highlight') === 'auto') pre.removeAttribute('style');
    pre.removeAttribute('data-highlight');
    code.textContent = text;
  }
  pre.replaceChildren(code);
  if (caret !== null) placeAtOffset(pre, caret, doc);
}

/** Posición del cursor como desplazamiento en el texto de `root`. */
export function textOffset(root: Node, node: Node, offset: number): number {
  const range = root.ownerDocument!.createRange();
  range.selectNodeContents(root);
  try {
    range.setEnd(node, offset);
  } catch {
    return 0;
  }
  return range.toString().length;
}

/** Pone el cursor a `offset` caracteres del inicio de `root`. */
export function placeAtOffset(root: Node, offset: number, doc: Document): void {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let left = offset;
  let node = walker.nextNode() as Text | null;
  let last: Text | null = null;
  while (node) {
    if (left <= node.length) break;
    left -= node.length;
    last = node;
    node = walker.nextNode() as Text | null;
  }
  const range = doc.createRange();
  if (node) range.setStart(node, left);
  else if (last) range.setStart(last, last.length);
  else range.setStart(root, 0);
  range.collapse(true);
  const sel = doc.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

// --- Tablas: combinar y separar celdas ------------------------------------------------------

type Grid = (HTMLTableCellElement | null)[][];

const span = (cell: HTMLTableCellElement, attr: 'colspan' | 'rowspan') => Math.max(1, Number(cell.getAttribute(attr)) || 1);

/** Rejilla de la tabla: qué celda ocupa cada posición (contando colspan y rowspan). */
export function tableGrid(table: HTMLTableElement): Grid {
  const rows = Array.from(table.rows);
  const grid: Grid = rows.map(() => []);
  rows.forEach((row, r) => {
    let c = 0;
    for (const cell of Array.from(row.cells)) {
      while (grid[r][c]) c++;
      const cs = span(cell, 'colspan');
      const rs = Math.min(span(cell, 'rowspan'), rows.length - r);
      for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) grid[r + i][c + j] = cell;
      c += cs;
    }
  });
  return grid;
}

function position(grid: Grid, cell: HTMLTableCellElement): { row: number; col: number } | null {
  for (let r = 0; r < grid.length; r++) {
    const c = grid[r].indexOf(cell);
    if (c >= 0) return { row: r, col: c };
  }
  return null;
}

/** Celda vecina con la que se puede combinar (misma altura a la derecha, mismo ancho abajo). */
export function mergeTarget(cell: HTMLTableCellElement, direction: 'right' | 'down'): HTMLTableCellElement | null {
  const table = cell.closest('table');
  if (!table) return null;
  const grid = tableGrid(table);
  const pos = position(grid, cell);
  if (!pos) return null;
  const cs = span(cell, 'colspan');
  const rs = span(cell, 'rowspan');
  const next = direction === 'right' ? grid[pos.row]?.[pos.col + cs] : grid[pos.row + rs]?.[pos.col];
  if (!next || next === cell) return null;
  const nextPos = position(grid, next)!;
  // Encabezado y cuerpo no se mezclan.
  if (next.parentElement?.parentElement !== cell.parentElement?.parentElement) return null;
  if (direction === 'right') return nextPos.row === pos.row && span(next, 'rowspan') === rs ? next : null;
  return nextPos.col === pos.col && span(next, 'colspan') === cs ? next : null;
}

/** Combina la celda con la de la derecha o la de abajo (el contenido se une). */
export function mergeCells(cell: HTMLTableCellElement, direction: 'right' | 'down'): boolean {
  const next = mergeTarget(cell, direction);
  if (!next) return false;
  const attr = direction === 'right' ? 'colspan' : 'rowspan';
  cell.setAttribute(attr, String(span(cell, attr) + span(next, attr)));
  if (next.textContent?.trim() || next.querySelector('img')) {
    if (cell.textContent?.trim()) cell.append(cell.ownerDocument.createElement('br'));
    else cell.replaceChildren();
    cell.append(...Array.from(next.childNodes));
  }
  next.remove();
  // Una fila vacía (sus celdas pasaron a la de arriba) se quita y se corrige el rowspan.
  for (const row of Array.from(cell.closest('table')!.rows)) {
    if (row.cells.length) continue;
    const index = row.rowIndex;
    const grid = tableGrid(row.closest('table') as HTMLTableElement);
    for (const above of new Set(grid[index - 1] ?? [])) {
      if (above && span(above, 'rowspan') > 1) above.setAttribute('rowspan', String(span(above, 'rowspan') - 1));
    }
    row.remove();
  }
  for (const c of [cell]) {
    if (span(c, 'colspan') === 1) c.removeAttribute('colspan');
    if (span(c, 'rowspan') === 1) c.removeAttribute('rowspan');
  }
  return true;
}

/** ¿La celda está combinada? */
export function isMerged(cell: HTMLTableCellElement): boolean {
  return span(cell, 'colspan') > 1 || span(cell, 'rowspan') > 1;
}

/** Separa una celda combinada en celdas sueltas (el contenido queda en la primera). */
export function splitCell(cell: HTMLTableCellElement): boolean {
  const table = cell.closest('table');
  if (!table || !isMerged(cell)) return false;
  const grid = tableGrid(table);
  const pos = position(grid, cell)!;
  const cs = span(cell, 'colspan');
  const rs = span(cell, 'rowspan');
  const make = () => {
    const c = cell.ownerDocument.createElement(cell.tagName.toLowerCase()) as HTMLTableCellElement;
    if (cell.tagName === 'TH') c.setAttribute('scope', cell.getAttribute('scope') ?? 'col');
    const style = cell.getAttribute('style');
    if (style) c.setAttribute('style', style);
    c.innerHTML = '<br>';
    return c;
  };
  cell.removeAttribute('colspan');
  cell.removeAttribute('rowspan');
  for (let j = cs - 1; j >= 1; j--) cell.after(make());
  const rows = Array.from(table.rows);
  for (let i = 1; i < rs; i++) {
    const row = rows[pos.row + i];
    if (!row) break;
    // Se inserta antes de la primera celda propia de la fila que empieza a la derecha.
    const before = Array.from(row.cells).find((c) => (position(grid, c)?.col ?? 0) > pos.col) ?? null;
    for (let j = 0; j < cs; j++) row.insertBefore(make(), before);
  }
  return true;
}

// --- Imagen con pie -----------------------------------------------------------------------------

/** Figura de la imagen (si tiene pie). */
export function figureOf(img: HTMLImageElement): HTMLElement | null {
  return img.parentElement?.tagName === 'FIGURE' ? img.parentElement : null;
}

/**
 * Añade un pie a la imagen: la envuelve en `<figure>` (que se lleva su ancho y
 * alineación) con un `<figcaption>` vacío. Devuelve el pie.
 */
export function addCaption(img: HTMLImageElement, doc: Document): HTMLElement {
  const existing = figureOf(img)?.querySelector('figcaption');
  if (existing) return existing as HTMLElement;
  const { width, align } = readImageStyle(img.getAttribute('style') ?? '');
  const figure = doc.createElement('figure');
  const css = imageStyle(width ?? '100%', align);
  figure.setAttribute('style', css);
  // La imagen ocupa toda la figura.
  img.setAttribute('style', imageStyle('100%', null));
  img.removeAttribute('width');
  img.removeAttribute('height');
  const caption = doc.createElement('figcaption');
  caption.innerHTML = '<br>';
  // La figura es un bloque: el párrafo de la imagen se parte en dos y la figura queda en medio.
  const block = img.parentElement?.tagName === 'P' ? img.parentElement : null;
  if (block) {
    const after = doc.createElement('p');
    while (img.nextSibling) after.append(img.nextSibling);
    block.after(figure);
    if (after.textContent?.trim() || after.querySelector('img')) figure.after(after);
    img.remove();
    if (!block.textContent?.trim() && !block.querySelector('img')) block.remove();
  } else {
    img.before(figure);
  }
  figure.append(img, caption);
  return caption;
}

/** Quita el pie: la imagen recupera el ancho y la alineación de la figura. */
export function removeCaption(img: HTMLImageElement, doc: Document): void {
  const figure = figureOf(img);
  if (!figure) return;
  const { width, align } = readImageStyle(figure.getAttribute('style') ?? '');
  const css = imageStyle(width === '100%' ? null : width, align);
  if (css) img.setAttribute('style', css);
  else img.removeAttribute('style');
  const p = doc.createElement('p');
  p.append(img);
  figure.replaceWith(p);
}

// --- Índice del documento -----------------------------------------------------------------------

/** Identificador legible para un título ("Condiciones del crédito" → "condiciones-del-credito"). */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    // Sin la numeración inicial ("1. Resumen" → "resumen").
    .replace(/^[^a-z]+|-+$/g, '')
    .slice(0, 60);
  return slug || 'seccion';
}

/** Da un `id` único a cada título (los que ya tienen uno válido lo conservan). */
export function ensureHeadingIds(root: HTMLElement): HTMLElement[] {
  const headings = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h4')).filter((h) => !h.closest('nav[data-type="toc"]'));
  const used = new Set<string>();
  for (const h of headings) {
    let id = /^[a-z][a-z0-9-]{0,79}$/.test(h.id) && !used.has(h.id) ? h.id : '';
    if (!id) {
      const base = slugify(h.textContent ?? '');
      id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      h.id = id;
    }
    used.add(id);
  }
  return headings;
}

/** Contenido del índice: enlaces a los títulos, anidados por nivel. */
export function buildToc(nav: HTMLElement, headings: readonly HTMLElement[], title: string, doc: Document): void {
  const heading = doc.createElement('p');
  const strong = doc.createElement('strong');
  strong.textContent = title;
  heading.append(strong);
  const root = doc.createElement('ol');
  // Pila de listas abiertas: un nivel más profundo abre una sublista en el último elemento.
  const stack: { level: number; list: HTMLOListElement; last: HTMLLIElement | null }[] = [{ level: 0, list: root, last: null }];
  for (const h of headings) {
    const text = (h.textContent ?? '').trim();
    if (!text) continue;
    const level = Number(h.tagName[1]);
    while (stack.length > 1 && stack[stack.length - 1].level > level) stack.pop();
    let top = stack[stack.length - 1];
    if (!top.last) top.level = level;
    else if (level > top.level) {
      const sub = doc.createElement('ol');
      top.last.append(sub);
      top = { level, list: sub, last: null };
      stack.push(top);
    }
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = text;
    li.append(a);
    top.list.append(li);
    top.last = li;
  }
  nav.replaceChildren(heading, ...(root.children.length ? [root] : []));
}

/** Firma de los títulos (para no reescribir el índice si no cambiaron). */
export function headingsSignature(headings: readonly HTMLElement[]): string {
  return headings.map((h) => `${h.tagName}:${h.id}:${(h.textContent ?? '').trim()}`).join('|');
}
