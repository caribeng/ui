/** Persona que se puede asignar a una tarea. */
export interface CbKanbanPerson {
  readonly id: string;
  readonly name: string;
  /** Foto (si no hay, se muestran las iniciales). */
  readonly image?: string;
}

/** Nivel de prioridad. `severity` da el color de la etiqueta. */
export interface CbKanbanPriority {
  readonly id: string;
  readonly label: string;
  readonly severity?: 'secondary' | 'info' | 'success' | 'warning' | 'danger';
}

/** Archivo adjunto a una tarea. Los recién añadidos llevan `file` (para subirlo) y una `url` local. */
export interface CbKanbanAttachment {
  readonly id: string;
  readonly name: string;
  /** Tamaño en bytes. */
  readonly size?: number;
  /** Tipo MIME. */
  readonly type?: string;
  /** Enlace para abrir o descargar el archivo. */
  readonly url?: string;
  /** Archivo elegido en el navegador (solo en los adjuntos nuevos). */
  readonly file?: File;
}

/**
 * Campos que entiende el panel de detalle y la tarjeta por defecto. Todos son
 * opcionales salvo el id y el título (sus nombres los fijan `itemKey` e `itemLabel`).
 * Las fechas se guardan como `'AAAA-MM-DD'` (también se aceptan `Date`).
 */
export interface CbKanbanTask {
  readonly id: string | number;
  readonly title: string;
  readonly description?: string;
  /** Ids de las personas responsables (de `people`). */
  readonly assignees?: readonly string[];
  /** Id de la prioridad (de `priorities`). */
  readonly priority?: string | null;
  readonly startDate?: string | Date | null;
  readonly endDate?: string | Date | null;
  readonly attachments?: readonly CbKanbanAttachment[];
}

/** Cambios que el panel aplica a una tarea. */
export type CbKanbanTaskPatch = Partial<Omit<CbKanbanTask, 'id'>> & Record<string, unknown>;

/** Id único para tarjetas, columnas y adjuntos nuevos. */
export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  return c?.randomUUID ? c.randomUUID() : `cb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** `'AAAA-MM-DD'` o `Date` → `Date` local (sin desfase de zona horaria). */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' || !value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/** `Date` → `'AAAA-MM-DD'` (día local). */
export function toIsoDay(date: Date | null | undefined): string | null {
  if (!date) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "23 – 27 oct", "27 oct" o "desde 23 oct" según las fechas que haya. */
export function formatDateRange(start: Date | null, end: Date | null, locale: string): string {
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  if (start && end) {
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    return sameMonth ? `${start.getDate()} – ${day.format(end)}` : `${day.format(start)} – ${day.format(end)}`;
  }
  return day.format((end ?? start)!);
}

/** Tamaño legible: "820 B", "14 KB", "2,3 MB". */
export function formatSize(bytes: number, locale: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}

/** Iniciales de un nombre ("Laura Gómez" → "LG"). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
