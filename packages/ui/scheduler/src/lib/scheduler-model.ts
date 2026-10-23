/**
 * Modelo del calendario de eventos: fechas, rejilla del mes, eventos de cada
 * día y colocación de los que se solapan. Funciones puras (sin DOM).
 */

/** Evento del calendario. `start` y `end` son fecha y hora (`Date` o ISO); en uno de día completo, días. */
export interface CbSchedulerEvent {
  readonly id: string;
  readonly title: string;
  readonly start: string | Date;
  /** Fin (exclusivo en eventos con hora; inclusivo en los de día completo). Por defecto, una hora después. */
  readonly end?: string | Date;
  /** Evento de día completo (va en la franja superior). */
  readonly allDay?: boolean;
  readonly color?: string;
  readonly location?: string;
  readonly description?: string;
}

/** Vista del calendario. */
export type CbSchedulerView = 'month' | 'week' | 'day' | 'agenda';

/** Un evento cambió de fecha u hora (al arrastrarlo, redimensionarlo o con el teclado). */
export interface CbSchedulerChange {
  readonly event: CbSchedulerEvent;
  readonly previous: CbSchedulerEvent;
}

/** Hueco elegido para crear un evento. */
export interface CbSchedulerSlot {
  readonly start: Date;
  readonly end: Date;
  readonly allDay: boolean;
}

// --- Fechas ------------------------------------------------------------------------------

export function toDate(value: string | Date | null | undefined): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : new Date(value);
  if (typeof value !== 'string' || !value) return null;
  // 'AAAA-MM-DD' sin hora: día local (new Date() lo leería en UTC).
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dayDiff(a: Date, b: Date): number {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);
}

/** Primer día de la semana de `date` (`first`: 0 = domingo, 1 = lunes). */
export function startOfWeek(date: Date, first: number): Date {
  return addDays(startOfDay(date), -((date.getDay() - first + 7) % 7));
}

/** Minutos desde la medianoche. */
export function minutesOf(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** `AAAA-MM-DD` del día. */
export function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Fecha y hora local sin zona (`AAAA-MM-DDTHH:mm`), como la escribe un `<input type="datetime-local">`. */
export function isoLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${isoDay(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// --- Eventos -----------------------------------------------------------------------------

/** Evento con sus fechas resueltas. En los de día completo, `end` es el último día (inclusivo). */
export interface ResolvedEvent {
  readonly event: CbSchedulerEvent;
  readonly start: Date;
  readonly end: Date;
  readonly allDay: boolean;
}

export function resolveEvent(event: CbSchedulerEvent): ResolvedEvent | null {
  const start = toDate(event.start);
  if (!start) return null;
  if (event.allDay) {
    const s = startOfDay(start);
    let e = startOfDay(toDate(event.end) ?? s);
    if (e < s) e = s;
    return { event, start: s, end: e, allDay: true };
  }
  let end = toDate(event.end) ?? addMinutes(start, 60);
  if (end <= start) end = addMinutes(start, 30);
  return { event, start, end, allDay: false };
}

/** ¿El evento ocupa (parte de) este día? */
export function onDay(e: ResolvedEvent, day: Date): boolean {
  const d0 = startOfDay(day);
  if (e.allDay) return e.start <= d0 && d0 <= e.end;
  const d1 = addDays(d0, 1);
  return e.start < d1 && e.end > d0;
}

/** Eventos de un día: primero los de día completo (y los que duran varios días), luego por hora. */
export function eventsOfDay(events: readonly ResolvedEvent[], day: Date): ResolvedEvent[] {
  return events
    .filter((e) => onDay(e, day))
    .sort((a, b) => Number(b.allDay || isMultiDay(b)) - Number(a.allDay || isMultiDay(a)) || a.start.getTime() - b.start.getTime() || a.event.title.localeCompare(b.event.title));
}

/** Un evento con hora que cruza la medianoche. */
export function isMultiDay(e: ResolvedEvent): boolean {
  return !e.allDay && !sameDay(e.start, addMinutes(e.end, -1));
}

/** Rejilla del mes: semanas completas (de 4 a 6) desde el primer día de la semana. */
export function monthGrid(date: Date, firstDay: number): Date[][] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const weeks: Date[][] = [];
  for (let d = startOfWeek(first, firstDay); d <= last || weeks.length < 4; d = addDays(d, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)));
    if (weeks.length === 6) break;
  }
  return weeks;
}

/** Posición de un evento con hora dentro de su día: columna y número de columnas del grupo que se solapa. */
export interface PlacedEvent {
  readonly e: ResolvedEvent;
  /** Minutos desde la medianoche, recortados al día. */
  readonly from: number;
  readonly to: number;
  readonly column: number;
  readonly columns: number;
}

/**
 * Coloca los eventos con hora de un día: los que se solapan se reparten en
 * columnas (cada grupo de solapados usa tantas como necesita).
 */
export function layoutDay(events: readonly ResolvedEvent[], day: Date): PlacedEvent[] {
  const d0 = startOfDay(day);
  const d1 = addDays(d0, 1);
  const timed = events
    .filter((e) => !e.allDay && e.start < d1 && e.end > d0)
    .map((e) => ({
      e,
      from: e.start < d0 ? 0 : minutesOf(e.start),
      to: e.end > d1 ? 24 * 60 : Math.max(minutesOf(e.end) || 24 * 60, (e.start < d0 ? 0 : minutesOf(e.start)) + 15),
    }))
    .sort((a, b) => a.from - b.from || b.to - a.to);
  const placed: PlacedEvent[] = [];
  let group: { item: (typeof timed)[number]; column: number }[] = [];
  let groupEnd = -1;
  const flush = () => {
    const columns = Math.max(1, ...group.map((g) => g.column + 1));
    for (const g of group) placed.push({ e: g.item.e, from: g.item.from, to: g.item.to, column: g.column, columns });
    group = [];
  };
  for (const item of timed) {
    if (item.from >= groupEnd && group.length) flush();
    // Primera columna libre (cuyo último evento ya terminó).
    const used = new Set(group.filter((g) => g.item.to > item.from).map((g) => g.column));
    let column = 0;
    while (used.has(column)) column++;
    group.push({ item, column });
    groupEnd = Math.max(groupEnd, item.to);
  }
  if (group.length) flush();
  return placed;
}

/** Mueve un evento: `days` días y `minutes` minutos (conserva la duración). */
export function shiftEvent(event: CbSchedulerEvent, days: number, minutes: number): CbSchedulerEvent {
  const r = resolveEvent(event);
  if (!r) return event;
  if (r.allDay) return { ...event, start: isoDay(addDays(r.start, days)), end: isoDay(addDays(r.end, days)) };
  return { ...event, start: isoLocal(addMinutes(addDays(r.start, days), minutes)), end: isoLocal(addMinutes(addDays(r.end, days), minutes)) };
}

/** Cambia la duración de un evento con hora (`minutes` en el fin; nunca menos de `min`). */
export function resizeEvent(event: CbSchedulerEvent, minutes: number, min = 15): CbSchedulerEvent {
  const r = resolveEvent(event);
  if (!r || r.allDay) return event;
  const end = addMinutes(r.end, minutes);
  return { ...event, end: isoLocal(end < addMinutes(r.start, min) ? addMinutes(r.start, min) : end) };
}
