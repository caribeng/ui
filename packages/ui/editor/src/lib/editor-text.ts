import type { CbTranslation } from '@caribeng/ui';

// --- Tipografía al escribir ------------------------------------------------------------------

/** Sustituciones al escribir: el patrón termina en el carácter recién tecleado. */
const TYPOGRAPHY: readonly [RegExp, string][] = [
  [/\(c\)$/i, '©'],
  [/\(r\)$/i, '®'],
  [/\(tm\)$/i, '™'],
  [/\.\.\.$/, '…'],
  [/<-$/, '←'],
  [/->$/, '→'],
  [/<=$/, '≤'],
  [/>=$/, '≥'],
  [/!=$/, '≠'],
  [/\+-$/, '±'],
  [/(^|\s)1\/2(\s)$/, '$1½$2'],
  [/(^|\s)1\/4(\s)$/, '$1¼$2'],
  [/(^|\s)3\/4(\s)$/, '$1¾$2'],
  [/(\s)---(\s)$/, '$1—$2'],
  [/(\s)--(\s)$/, '$1–$2'],
];

/**
 * Corrección tipográfica para el texto que precede al cursor (`(c)` → ©, `...` → …,
 * `->` → →, ` -- ` → raya…). Devuelve desde qué posición se reemplaza y por qué texto.
 */
export function typographyFix(before: string): { from: number; text: string } | null {
  for (const [pattern, replacement] of TYPOGRAPHY) {
    const match = pattern.exec(before);
    if (match) return { from: match.index, text: before.slice(match.index).replace(pattern, replacement) };
  }
  return null;
}

// --- Enlaces automáticos ------------------------------------------------------------------------

/**
 * URL que acaba justo antes del espacio recién escrito (`https://…` o `www.…`), sin la
 * puntuación final. Devuelve su posición y el `href` (las `www.` se completan con https://).
 */
export function urlBeforeSpace(before: string): { from: number; to: number; href: string } | null {
  const match = /(^|\s)((?:https?:\/\/|www\.)[^\s<>"]+)\s$/i.exec(before);
  if (!match) return null;
  const url = match[2].replace(/[.,;:!?)\]'"]+$/, '');
  if (url.length < 5 || /^www\.$/i.test(url) || (/^www\./i.test(url) && !/^www\.[^.]+\.[^.]+/i.test(url))) return null;
  const from = match.index + match[1].length;
  return { from, to: from + url.length, href: /^www\./i.test(url) ? `https://${url}` : url };
}

/** El texto completo es una sola URL (para convertir la selección en enlace al pegarla). */
export function isUrlText(text: string): boolean {
  return /^(https?:\/\/|www\.)[^\s<>"]+\.[^\s<>"]+$/i.test(text.trim());
}

// --- Buscar ---------------------------------------------------------------------------------------

export interface CbFindOptions {
  matchCase?: boolean;
  wholeWords?: boolean;
}

const BLOCK = /^(P|DIV|H[1-6]|LI|TD|TH|PRE|BLOCKQUOTE|UL|OL|TABLE|TR)$/;

/** Bloque que contiene un nodo (las coincidencias no cruzan de un bloque a otro). */
function blockOf(node: Node, root: HTMLElement): Node {
  for (let cur = node.parentNode; cur && cur !== root; cur = cur.parentNode) {
    if (BLOCK.test(cur.nodeName)) return cur;
  }
  return root;
}

const WORD = /[\p{L}\p{N}_]/u;

/** Rangos de todas las apariciones de `query` en el texto de `root`, en orden. */
export function findMatches(root: HTMLElement, query: string, options: CbFindOptions = {}): Range[] {
  if (!query) return [];
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const groups: { block: Node; nodes: Text[] }[] = [];
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    const block = blockOf(n, root);
    const last = groups[groups.length - 1];
    if (last && last.block === block) last.nodes.push(n);
    else groups.push({ block, nodes: [n] });
  }
  const needle = options.matchCase ? query : query.toLowerCase();
  const ranges: Range[] = [];
  for (const { nodes } of groups) {
    const text = nodes.map((n) => n.data).join('');
    const hay = options.matchCase ? text : text.toLowerCase();
    // Posición en el texto del bloque → (nodo, desplazamiento).
    const locate = (pos: number, end: boolean): [Text, number] => {
      let acc = 0;
      for (const n of nodes) {
        if (pos < acc + n.data.length || (end && pos === acc + n.data.length)) return [n, pos - acc];
        acc += n.data.length;
      }
      const last = nodes[nodes.length - 1];
      return [last, last.data.length];
    };
    for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) {
      const j = i + needle.length;
      if (options.wholeWords && ((i > 0 && WORD.test(text[i - 1])) || (j < text.length && WORD.test(text[j])))) continue;
      const range = doc.createRange();
      range.setStart(...locate(i, false));
      range.setEnd(...locate(j, true));
      ranges.push(range);
    }
  }
  return ranges;
}

/** Sustituye el texto de un rango (sin `execCommand`): conserva el formato del primer nodo. */
export function replaceRangeText(range: Range, text: string): void {
  range.deleteContents();
  if (text) range.insertNode(range.startContainer.ownerDocument!.createTextNode(text));
  range.startContainer.parentNode?.normalize?.();
}

// --- Caracteres especiales ------------------------------------------------------------------------

export interface CbCharGroup {
  label: (t: CbTranslation) => string;
  chars: readonly string[];
}

export const SPECIAL_CHARS: readonly CbCharGroup[] = [
  { label: (t) => t.charsCurrency, chars: ['$', '€', '£', '¥', '¢', '₡', '₩', '₹', '₽', '₿', '₱', '¤'] },
  { label: (t) => t.charsMath, chars: ['±', '×', '÷', '≠', '≈', '≤', '≥', '∞', '√', '∑', 'π', '°', '‰', '½', '¼', '¾', '²', '³', 'µ', '∆'] },
  { label: (t) => t.charsPunctuation, chars: ['«', '»', '“', '”', '‘', '’', '—', '–', '…', '•', '·', '§', '¶', '©', '®', '™', '†', '¡', '¿', '№'] },
  { label: (t) => t.charsArrows, chars: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇔', '↗', '↘', '↩'] },
  {
    label: (t) => t.charsEmoji,
    chars: ['😀', '😊', '😉', '😂', '🤔', '👍', '👎', '👏', '🙏', '✅', '❌', '⚠️', '❗', '❓', '💡', '📌', '📎', '📅', '📈', '📉', '💰', '💳', '🏦', '🔒', '🎉', '❤️', '⭐', '🔥', '🚀', '👀'],
  },
];

/** Texto en minúsculas y sin tildes, para filtrar sin importar acentos. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
