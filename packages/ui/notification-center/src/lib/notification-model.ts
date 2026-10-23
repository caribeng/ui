/** Acción propia de una notificación ("Aprobar", "Ver pedido"…). */
export interface CbNotificationAction {
  readonly id: string;
  readonly label: string;
  /** `primary` para la acción principal; el resto se pinta como secundaria. */
  readonly severity?: 'primary' | 'secondary';
}

/** Aviso del centro de notificaciones. */
export interface CbNotification {
  readonly id: string;
  readonly title: string;
  /** Detalle en una o dos líneas. */
  readonly text?: string;
  /** Fecha (`Date` o ISO 8601). */
  readonly date: Date | string;
  readonly read?: boolean;
  /** Persona que lo origina: se muestra su foto o sus iniciales en lugar del icono. */
  readonly person?: { readonly name: string; readonly image?: string };
  /** Icono (si no hay `person`); por defecto, según `severity`. */
  readonly icon?: string;
  /** Color del icono. */
  readonly severity?: 'info' | 'success' | 'warning' | 'danger';
  readonly actions?: readonly CbNotificationAction[];
}

/** Acción pulsada en una notificación. */
export interface CbNotificationActionEvent {
  readonly notification: CbNotification;
  readonly action: CbNotificationAction;
}

/** Qué muestra el panel. */
export type CbNotificationFilter = 'all' | 'unread';

/** Grupo por fecha: hoy, ayer o antes. */
export type CbNotificationGroupKey = 'today' | 'yesterday' | 'earlier';

export interface CbNotificationGroup {
  readonly key: CbNotificationGroupKey;
  readonly items: readonly CbNotification[];
}

export function toTime(date: Date | string): number {
  const t = (date instanceof Date ? date : new Date(date)).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Inicio del día local de `time`. */
function startOfDay(time: number): number {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Notificaciones de la más reciente a la más antigua, filtradas y (con `group`) repartidas en
 * Hoy, Ayer y Anteriores. Sin agrupar devuelve un único grupo `earlier`.
 */
export function groupNotifications(
  list: readonly CbNotification[],
  filter: CbNotificationFilter,
  group: boolean,
  now: number,
): CbNotificationGroup[] {
  const items = list.filter((n) => filter === 'all' || !n.read).sort((a, b) => toTime(b.date) - toTime(a.date));
  if (!group) return items.length ? [{ key: 'earlier', items }] : [];
  const today = startOfDay(now);
  const yesterday = today - 86_400_000;
  const buckets: Record<CbNotificationGroupKey, CbNotification[]> = { today: [], yesterday: [], earlier: [] };
  for (const n of items) {
    const t = toTime(n.date);
    buckets[t >= today ? 'today' : t >= yesterday ? 'yesterday' : 'earlier'].push(n);
  }
  return (['today', 'yesterday', 'earlier'] as const).filter((k) => buckets[k].length).map((key) => ({ key, items: buckets[key] }));
}

/** Contador del botón: "99+" a partir de `max`. */
export function badgeText(count: number, max: number): string {
  return count > max ? `${max}+` : String(count);
}

/** Iniciales de un nombre ("Ana López" → "AL"). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
