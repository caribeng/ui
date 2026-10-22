/** Acción o página de la paleta de comandos. */
export interface CbCommandItem {
  /** Identificador estable (para `track`). Por defecto, el `label`. */
  id?: string;
  label: string;
  /** Texto secundario bajo el label. */
  description?: string;
  icon?: string;
  /** Grupo en el que se muestra ("Páginas", "Acciones"…). */
  group?: string;
  /** Sinónimos que también encuentran el item (no se muestran). */
  keywords?: readonly string[];
  /** Atajo que se muestra a la derecha, en el formato de `cb-kbd` (`['mod', 'S']`). */
  shortcut?: readonly string[];
  disabled?: boolean;
  /** Acción al elegirlo (además del evento `itemSelect`). */
  command?: (event: CbCommandSelectEvent) => void;
}

/** Item elegido en la paleta. */
export interface CbCommandSelectEvent {
  readonly item: CbCommandItem;
  /** Texto buscado en ese momento. */
  readonly query: string;
  readonly originalEvent?: Event;
}

/** Grupo de resultados ya filtrados y ordenados. */
export interface CbCommandGroup {
  readonly label: string;
  readonly items: readonly CbCommandItem[];
}

/** Minúsculas y sin tildes, carácter a carácter (conserva las posiciones). */
export function cbCommandNormalize(text: string): string {
  let out = '';
  for (const ch of text) out += ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().charAt(0) || ch;
  return out;
}

function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const ch of haystack) if (ch === needle[i] && ++i === needle.length) return true;
  return needle.length === 0;
}

/**
 * Relevancia de `item` para `query` (0 = no coincide). Prioriza el label que
 * empieza por la búsqueda, luego el inicio de una palabra, el texto contenido,
 * los sinónimos y la descripción, y por último las letras en orden ("cfg" → "Configuración").
 */
export function cbCommandScore(item: CbCommandItem, query: string): number {
  const q = cbCommandNormalize(query.trim());
  if (!q) return 1;
  const label = cbCommandNormalize(item.label);
  if (label.startsWith(q)) return 100;
  if (label.split(/[\s\-_/.]+/).some((word) => word.startsWith(q))) return 80;
  if (label.includes(q)) return 60;
  const keywords = (item.keywords ?? []).map(cbCommandNormalize);
  if (keywords.some((k) => k.startsWith(q))) return 50;
  if (keywords.some((k) => k.includes(q))) return 40;
  if (cbCommandNormalize(item.description ?? '').includes(q) || cbCommandNormalize(item.group ?? '').includes(q)) return 30;
  if (q.length > 1 && isSubsequence(q, label.replace(/\s+/g, ''))) return 10;
  return 0;
}

/**
 * Filtra, ordena y agrupa los items. Sin búsqueda conserva el orden original;
 * con búsqueda ordena por relevancia y los grupos siguen a su mejor resultado.
 */
export function cbCommandFilter(items: readonly CbCommandItem[], query: string, filter = true): CbCommandGroup[] {
  const ranked = items
    .map((item, index) => ({ item, index, score: filter ? cbCommandScore(item, query) : 1 }))
    .filter((entry) => entry.score > 0);
  if (filter && query.trim()) ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  const groups = new Map<string, CbCommandItem[]>();
  for (const { item } of ranked) {
    const key = item.group ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups].map(([label, groupItems]) => ({ label, items: groupItems }));
}

/** Partes del label para resaltar la coincidencia contigua con la búsqueda. */
export function cbCommandHighlight(label: string, query: string): { text: string; match: boolean }[] {
  const q = cbCommandNormalize(query.trim());
  const start = q ? cbCommandNormalize(label).indexOf(q) : -1;
  if (start < 0) return [{ text: label, match: false }];
  const chars = [...label];
  const parts = [
    { text: chars.slice(0, start).join(''), match: false },
    { text: chars.slice(start, start + [...q].length).join(''), match: true },
    { text: chars.slice(start + [...q].length).join(''), match: false },
  ];
  return parts.filter((p) => p.text);
}
