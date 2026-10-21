/** Posición dentro del texto de una página: elemento de texto de pdf.js y desplazamiento. */
export interface CbPdfTextPosition {
  item: number;
  offset: number;
}

/** Coincidencia de búsqueda. `end.offset` es exclusivo. */
export interface CbPdfMatch {
  page: number;
  start: CbPdfTextPosition;
  end: CbPdfTextPosition;
}

/** Texto normalizado de una página con la posición original de cada carácter. */
export interface CbPdfTextIndex {
  text: string;
  map: CbPdfTextPosition[];
}

/** Elemento de texto tal como lo devuelve `page.getTextContent()`. */
export interface CbPdfTextItem {
  str?: string;
  hasEOL?: boolean;
}

/**
 * Índice de búsqueda de una página. Ignora mayúsculas, tildes y ligaduras
 * ("dirección" encuentra "direccion") y une los espacios seguidos. Solo cuenta
 * los elementos con texto, en el mismo orden que la capa de texto de pdf.js.
 */
export function buildTextIndex(items: readonly CbPdfTextItem[]): CbPdfTextIndex {
  let text = '';
  const map: CbPdfTextPosition[] = [];
  const push = (char: string, item: number, offset: number) => {
    if (/\s/.test(char)) {
      if (!text || text.endsWith(' ')) return;
      char = ' ';
    }
    text += char;
    map.push({ item, offset });
  };
  let index = 0;
  for (const it of items) {
    if (it.str === undefined) continue;
    const str = it.str;
    for (let offset = 0; offset < str.length; offset++) {
      for (const char of normalizeChar(str[offset])) push(char, index, offset);
    }
    if (it.hasEOL) push(' ', index, str.length);
    index++;
  }
  return { text, map };
}

/** Normaliza el texto buscado igual que el índice. */
export function normalizeQuery(query: string): string {
  return Array.from(query, normalizeChar).join('').replace(/\s+/g, ' ').trim();
}

/** Coincidencias de `query` en una página. */
export function findMatches(index: CbPdfTextIndex, query: string, page: number): CbPdfMatch[] {
  const q = normalizeQuery(query);
  if (!q) return [];
  const matches: CbPdfMatch[] = [];
  let from = index.text.indexOf(q);
  while (from !== -1) {
    const last = index.map[from + q.length - 1];
    matches.push({ page, start: index.map[from], end: { item: last.item, offset: last.offset + 1 } });
    from = index.text.indexOf(q, from + q.length);
  }
  return matches;
}

/**
 * Resalta las coincidencias en la capa de texto de una página. Restaura antes
 * el texto original. Devuelve el resaltado de `selected`, si está en la página.
 */
export function highlightMatches(
  divs: readonly HTMLElement[],
  strings: readonly string[],
  matches: readonly CbPdfMatch[],
  selected: CbPdfMatch | null,
): HTMLElement | null {
  for (let i = 0; i < divs.length; i++) {
    if (divs[i].childElementCount) divs[i].textContent = strings[i] ?? '';
  }
  const segments = new Map<number, { from: number; to: number; selected: boolean }[]>();
  for (const m of matches) {
    for (let item = m.start.item; item <= m.end.item; item++) {
      const from = item === m.start.item ? m.start.offset : 0;
      const to = item === m.end.item ? m.end.offset : (strings[item]?.length ?? 0);
      if (to <= from) continue;
      const list = segments.get(item) ?? [];
      list.push({ from, to, selected: m === selected });
      segments.set(item, list);
    }
  }
  let selectedEl: HTMLElement | null = null;
  for (const [item, list] of segments) {
    const div = divs[item];
    const str = strings[item];
    if (!div || str === undefined) continue;
    const doc = div.ownerDocument;
    const nodes: Node[] = [];
    let pos = 0;
    for (const s of list.sort((a, b) => a.from - b.from)) {
      if (s.from > pos) nodes.push(doc.createTextNode(str.slice(pos, s.from)));
      const mark = doc.createElement('span');
      mark.className = s.selected ? 'cb-pdf__hl cb-is-selected' : 'cb-pdf__hl';
      mark.textContent = str.slice(Math.max(pos, s.from), s.to);
      nodes.push(mark);
      if (s.selected) selectedEl ??= mark;
      pos = Math.max(pos, s.to);
    }
    if (pos < str.length) nodes.push(doc.createTextNode(str.slice(pos)));
    div.replaceChildren(...nodes);
  }
  return selectedEl;
}

function normalizeChar(char: string): string {
  return char.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}
