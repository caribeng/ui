/** Persona que comenta, reacciona o a la que se menciona (compatible con `CbKanbanPerson`). */
export interface CbCommentPerson {
  readonly id: string;
  readonly name: string;
  /** Foto (si no hay, se muestran las iniciales). */
  readonly image?: string;
  /** Texto secundario en la lista de menciones (cargo, correo…). */
  readonly description?: string;
}

/** Reacción con un emoji y quién la puso (ids de persona). */
export interface CbCommentReaction {
  readonly emoji: string;
  readonly by: readonly string[];
}

/** Comentario del hilo. Las respuestas llevan `parentId` (un solo nivel, como en Asana o GitHub). */
export interface CbComment {
  readonly id: string;
  readonly author: CbCommentPerson;
  /** Contenido en HTML del editor (se sanea al guardarlo y al pintarlo). Las menciones son `<span data-mention="id">`. */
  readonly html: string;
  /** Fecha de publicación (`Date` o ISO 8601). */
  readonly date: Date | string;
  /** Fecha de la última edición. */
  readonly edited?: Date | string;
  /** Comentario al que responde. */
  readonly parentId?: string;
  readonly reactions?: readonly CbCommentReaction[];
  /** Eliminado, pero se conserva porque tiene respuestas. */
  readonly deleted?: boolean;
}

/** Entrada del historial de cambios ("Ana movió esta tarea a En curso"). */
export interface CbActivity {
  readonly id: string;
  /** Texto de la acción, sin el nombre (se antepone `author`). */
  readonly text: string;
  readonly author?: CbCommentPerson;
  readonly date: Date | string;
  /** Icono (por defecto, un reloj). */
  readonly icon?: string;
}

/** Qué muestra el hilo. */
export type CbCommentsFilter = 'all' | 'comments' | 'activity';

/** Comentario publicado o editado, con los ids de las personas que menciona. */
export interface CbCommentEvent {
  readonly comment: CbComment;
  readonly mentions: readonly string[];
}

/** Reacción puesta (`added`) o quitada. */
export interface CbCommentReactionEvent {
  readonly comment: CbComment;
  readonly emoji: string;
  readonly added: boolean;
}

/** Elemento del hilo ya ordenado: un comentario raíz con sus respuestas, o una actividad. */
export type CbFeedItem =
  | { readonly kind: 'comment'; readonly comment: CbComment; readonly replies: readonly CbComment[]; readonly time: number }
  | { readonly kind: 'activity'; readonly activity: CbActivity; readonly time: number };

export function toTime(date: Date | string | undefined): number {
  if (!date) return 0;
  const t = (date instanceof Date ? date : new Date(date)).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Hilo ordenado por fecha: comentarios raíz (con sus respuestas, siempre de la más antigua a la
 * más reciente) y actividad. Una respuesta cuyo padre no existe se muestra como comentario raíz.
 */
export function buildFeed(
  comments: readonly CbComment[],
  activity: readonly CbActivity[],
  filter: CbCommentsFilter,
  order: 'oldest' | 'newest',
): CbFeedItem[] {
  const ids = new Set(comments.map((c) => c.id));
  const replies = new Map<string, CbComment[]>();
  for (const c of comments) {
    if (c.parentId && ids.has(c.parentId)) {
      const list = replies.get(c.parentId) ?? [];
      list.push(c);
      replies.set(c.parentId, list);
    }
  }
  const items: CbFeedItem[] = [];
  if (filter !== 'activity') {
    for (const c of comments) {
      if (c.parentId && ids.has(c.parentId)) continue;
      const own = (replies.get(c.id) ?? []).sort((a, b) => toTime(a.date) - toTime(b.date));
      // Un comentario eliminado sin respuestas no aporta nada.
      if (c.deleted && !own.length) continue;
      items.push({ kind: 'comment', comment: c, replies: own, time: toTime(c.date) });
    }
  }
  if (filter !== 'comments') {
    for (const a of activity) items.push({ kind: 'activity', activity: a, time: toTime(a.date) });
  }
  items.sort((a, b) => (order === 'oldest' ? a.time - b.time : b.time - a.time));
  return items;
}

/** Ids de las personas mencionadas en un HTML (`data-mention`), sin repetir y en orden. */
export function mentionIds(html: string): string[] {
  const found: string[] = [];
  for (const m of html.matchAll(/data-mention="([^"]+)"/g)) {
    if (!found.includes(m[1])) found.push(m[1]);
  }
  return found;
}

/** Pone o quita la reacción `emoji` de `userId`; las reacciones que se quedan sin nadie desaparecen. */
export function toggleReaction(
  reactions: readonly CbCommentReaction[] | undefined,
  emoji: string,
  userId: string,
): { reactions: CbCommentReaction[]; added: boolean } {
  const list = [...(reactions ?? [])];
  const i = list.findIndex((r) => r.emoji === emoji);
  if (i < 0) return { reactions: [...list, { emoji, by: [userId] }], added: true };
  const had = list[i].by.includes(userId);
  const by = had ? list[i].by.filter((id) => id !== userId) : [...list[i].by, userId];
  if (by.length) list[i] = { emoji, by };
  else list.splice(i, 1);
  return { reactions: list, added: !had };
}

/**
 * Elimina un comentario. Si tiene respuestas se conserva como "eliminado" para no romper el hilo;
 * si era la última respuesta de un comentario ya eliminado, también desaparece el padre.
 */
export function removeComment(comments: readonly CbComment[], id: string): CbComment[] {
  const target = comments.find((c) => c.id === id);
  if (!target) return [...comments];
  const hasReplies = comments.some((c) => c.parentId === id);
  let next = hasReplies
    ? comments.map((c) => (c.id === id ? { ...c, html: '', deleted: true, reactions: [] } : c))
    : comments.filter((c) => c.id !== id);
  const parent = target.parentId ? next.find((c) => c.id === target.parentId) : undefined;
  if (parent?.deleted && !next.some((c) => c.parentId === parent.id)) next = next.filter((c) => c.id !== parent.id);
  return next;
}

/** Id nuevo (UUID si el entorno lo permite). */
export function newCommentId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  return c?.randomUUID ? c.randomUUID() : `cb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Iniciales de un nombre ("Ana López" → "AL"). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

