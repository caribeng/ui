import type { CbTranslation } from '@caribeng/ui';

/** Color de una paleta del editor: valor CSS y nombre traducido. */
export interface CbEditorColor {
  value: string;
  label: (t: CbTranslation) => string;
}

/** Colores de texto: oscuros y saturados, legibles sobre fondo claro. */
export const TEXT_COLORS: readonly CbEditorColor[] = [
  { value: '#111827', label: (t) => t.colorBlack },
  { value: '#6b7280', label: (t) => t.colorGray },
  { value: '#dc2626', label: (t) => t.colorRed },
  { value: '#ea580c', label: (t) => t.colorOrange },
  { value: '#ca8a04', label: (t) => t.colorYellow },
  { value: '#16a34a', label: (t) => t.colorGreen },
  { value: '#0d9488', label: (t) => t.colorTeal },
  { value: '#2563eb', label: (t) => t.colorBlue },
  { value: '#7c3aed', label: (t) => t.colorPurple },
  { value: '#db2777', label: (t) => t.colorPink },
];

/** Colores de resaltado: claros, para que el texto siga siendo legible. */
export const HIGHLIGHT_COLORS: readonly CbEditorColor[] = [
  { value: '#fef08a', label: (t) => t.colorYellow },
  { value: '#bbf7d0', label: (t) => t.colorGreen },
  { value: '#bfdbfe', label: (t) => t.colorBlue },
  { value: '#fbcfe8', label: (t) => t.colorPink },
  { value: '#fed7aa', label: (t) => t.colorOrange },
  { value: '#e9d5ff', label: (t) => t.colorPurple },
  { value: '#e5e7eb', label: (t) => t.colorGray },
];

/** `<font size>` → px (el editor marca con `size="7"` y lo sustituye por el tamaño elegido). */
const FONT_SIZE_ATTR: Record<string, string> = { '1': '10px', '2': '13px', '4': '18px', '5': '24px', '6': '32px', '7': '48px' };

/**
 * Sustituye los `<font size="7">` (y `font-size: xxx-large`) que deja `execCommand('fontSize', '7')`
 * por `<span style="font-size: …">`. Devuelve los spans creados.
 */
export function applyFontSizeMarker(root: HTMLElement, size: string): HTMLElement[] {
  const marked = Array.from(root.querySelectorAll<HTMLElement>('font[size="7"], span[style*="xxx-large"]'));
  return marked.map((node) => {
    const span = root.ownerDocument.createElement('span');
    const keep = node.tagName === 'SPAN' ? (node.getAttribute('style') ?? '') : '';
    for (const prop of ['color', 'font-family']) {
      const v = node.tagName === 'FONT' ? node.getAttribute(prop === 'color' ? 'color' : 'face') : null;
      if (v) span.style.setProperty(prop, v);
    }
    if (keep) span.setAttribute('style', keep);
    span.style.fontSize = size;
    span.append(...Array.from(node.childNodes));
    node.replaceWith(span);
    return span;
  });
}

/** Tipografía (pila CSS) del texto donde está el cursor; `''` = predeterminada. */
export function fontFamilyAt(node: Node | null, root: HTMLElement): string {
  for (let cur: Node | null = node; cur && cur !== root; cur = cur.parentNode) {
    if (cur.nodeType !== Node.ELEMENT_NODE) continue;
    const el = cur as HTMLElement;
    if (el.style.fontFamily) return el.style.fontFamily;
    if (el.tagName === 'FONT' && el.getAttribute('face')) return el.getAttribute('face')!;
  }
  return '';
}

const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, blockquote, pre, div';

/** Bloques (no listas ni celdas) que toca la selección. */
export function selectedBlocks(root: HTMLElement, range: Range): HTMLElement[] {
  // Solo bloques de primer nivel: ni dentro de listas o celdas, ni dentro de otro bloque del contenido.
  const nested = (b: HTMLElement) => {
    for (let cur = b.parentElement; cur && cur !== root; cur = cur.parentElement) if (cur.matches(`${BLOCK_SELECTOR}, li, td, th`)) return true;
    return false;
  };
  const blocks = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)).filter((b) => range.intersectsNode(b) && !nested(b));
  if (blocks.length) return blocks;
  // Texto suelto en la raíz: el bloque es la propia raíz (no se le aplica sangría).
  return [];
}

/** Sangría de un bloque en pasos de 2rem (0–10rem). */
export function shiftIndent(block: HTMLElement, delta: 1 | -1): void {
  const current = Number(/^(\d+(?:\.\d+)?)rem$/.exec(block.style.marginLeft)?.[1] ?? 0);
  const next = Math.min(10, Math.max(0, current + delta * 2));
  if (next) block.style.marginLeft = `${next}rem`;
  else block.style.removeProperty('margin-left');
  if (!block.getAttribute('style')) block.removeAttribute('style');
}

/**
 * Quita una propiedad en línea (color, fondo o tamaño) de los `<span>` / `<font>`
 * que toca la selección; los que se quedan sin estilo se desenvuelven.
 */
export function clearInlineStyle(root: HTMLElement, range: Range, prop: 'color' | 'background-color' | 'font-size' | 'font-family'): void {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('span, font')).filter((n) => range.intersectsNode(n));
  for (const node of nodes) {
    node.style.removeProperty(prop);
    if (prop === 'background-color') node.style.removeProperty('background');
    if (node.tagName === 'FONT') {
      if (prop === 'color') node.removeAttribute('color');
      if (prop === 'font-size') node.removeAttribute('size');
      if (prop === 'font-family') node.removeAttribute('face');
    }
    if (!node.getAttribute('style')) node.removeAttribute('style');
    if (!node.attributes.length) node.replaceWith(...Array.from(node.childNodes));
  }
}

/** Tamaño de letra (em) del texto donde está el cursor; `''` = normal. */
export function fontSizeAt(node: Node | null, root: HTMLElement): string {
  for (let cur: Node | null = node; cur && cur !== root; cur = cur.parentNode) {
    if (cur.nodeType !== Node.ELEMENT_NODE) continue;
    const el = cur as HTMLElement;
    if (el.style.fontSize) return el.style.fontSize;
    if (el.tagName === 'FONT' && el.getAttribute('size')) return FONT_SIZE_ATTR[el.getAttribute('size')!] ?? '';
  }
  return '';
}

/** Lista de tareas que contiene el nodo (o `null`). */
export function taskListOf(node: Node | null, root: HTMLElement): HTMLUListElement | null {
  for (let cur: Node | null = node; cur && cur !== root; cur = cur.parentNode) {
    if (cur.nodeType === Node.ELEMENT_NODE && (cur as HTMLElement).tagName === 'UL') {
      return (cur as HTMLElement).getAttribute('data-type') === 'taskList' ? (cur as HTMLUListElement) : null;
    }
  }
  return null;
}

/** Marca una lista como de tareas (o la vuelve normal) y da estado a sus elementos. */
export function setTaskList(list: HTMLUListElement, on: boolean): void {
  if (on) {
    list.setAttribute('data-type', 'taskList');
    for (const li of Array.from(list.children)) if (li.tagName === 'LI' && !li.hasAttribute('data-checked')) li.setAttribute('data-checked', 'false');
  } else {
    list.removeAttribute('data-type');
    for (const li of Array.from(list.children)) li.removeAttribute('data-checked');
  }
}

/** Marca o desmarca una tarea. */
export function toggleTask(li: HTMLElement): void {
  li.setAttribute('data-checked', li.getAttribute('data-checked') === 'true' ? 'false' : 'true');
}
