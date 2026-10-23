/**
 * Modelo del diagrama de Gantt: fechas, árbol de tareas, grupos calculados,
 * dependencias (fin → inicio) y planificación automática. Funciones puras: el
 * componente las usa y los tests las prueban sin DOM.
 */

/** Tarea del diagrama. Las fechas son días (`'AAAA-MM-DD'` o `Date`); el fin es inclusivo. */
export interface CbGanttTask {
  readonly id: string;
  readonly name: string;
  readonly start: string | Date;
  readonly end: string | Date;
  /** Avance de 0 a 100. En los grupos se calcula con el de sus tareas. */
  readonly progress?: number;
  /** Tarea que la contiene (grupo). */
  readonly parent?: string | null;
  /** Tareas que deben terminar antes de que esta empiece (fin → inicio). */
  readonly dependencies?: readonly string[];
  /** `milestone` es un hito (un solo día, rombo); `group` agrupa tareas (sus fechas se calculan). */
  readonly type?: 'task' | 'milestone' | 'group';
  /** Color de la barra. */
  readonly color?: string;
  /** Texto de la columna Responsable. */
  readonly assignee?: string;
}

/** Escala del diagrama: un día, una semana o un mes por columna. */
export type CbGanttScale = 'day' | 'week' | 'month';

/** Columnas de la tabla de la izquierda. */
export type CbGanttColumn = 'name' | 'start' | 'end' | 'duration' | 'progress' | 'assignee';

/** Una tarea cambió (al arrastrar, con el teclado o por la planificación automática). */
export interface CbGanttChange {
  readonly task: CbGanttTask;
  readonly previous: CbGanttTask;
  readonly reason: 'move' | 'resize' | 'progress' | 'schedule';
}

/** Dependencia creada o quitada: `to` depende de `from`. */
export interface CbGanttLink {
  readonly from: string;
  readonly to: string;
}

// --- Fechas -------------------------------------------------------------------------------

export function toDay(value: string | Date | null | undefined): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (typeof value !== 'string' || !value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  return isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Días de calendario entre `a` y `b` (`b` − `a`). */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);
}

/** Lunes de la semana de `date` (semana ISO). */
export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

/** Número de semana ISO. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

// --- Árbol y grupos -------------------------------------------------------------------------

/** Tarea con sus fechas ya resueltas (en los grupos, calculadas con sus tareas). */
export interface ResolvedTask {
  readonly task: CbGanttTask;
  readonly start: Date;
  readonly end: Date;
  readonly progress: number;
  readonly level: number;
  readonly isGroup: boolean;
  readonly isMilestone: boolean;
  readonly children: readonly string[];
}

/** Resuelve fechas y avance (los grupos abarcan a sus tareas y promedian su avance por duración). */
export function resolveTasks(tasks: readonly CbGanttTask[]): Map<string, ResolvedTask> {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const children = new Map<string, string[]>();
  for (const t of tasks) {
    if (t.parent && byId.has(t.parent) && t.parent !== t.id) {
      const list = children.get(t.parent) ?? [];
      list.push(t.id);
      children.set(t.parent, list);
    }
  }
  const out = new Map<string, ResolvedTask>();
  const visiting = new Set<string>();
  const level = (t: CbGanttTask): number => {
    let n = 0;
    const seen = new Set<string>();
    for (let p = t.parent; p && byId.has(p) && !seen.has(p); p = byId.get(p)!.parent) {
      seen.add(p);
      n++;
    }
    return n;
  };
  const resolve = (id: string): ResolvedTask | null => {
    const done = out.get(id);
    if (done) return done;
    const task = byId.get(id);
    if (!task || visiting.has(id)) return null;
    visiting.add(id);
    const kids = children.get(id) ?? [];
    const isGroup = task.type === 'group' || kids.length > 0;
    let start = toDay(task.start);
    let end = toDay(task.end) ?? start;
    let progress = clampProgress(task.progress ?? 0);
    if (isGroup && kids.length) {
      const resolved = kids.map(resolve).filter((r): r is ResolvedTask => !!r);
      if (resolved.length) {
        start = new Date(Math.min(...resolved.map((r) => r.start.getTime())));
        end = new Date(Math.max(...resolved.map((r) => r.end.getTime())));
        const weights = resolved.map((r) => Math.max(1, dayDiff(r.start, r.end) + 1));
        const total = weights.reduce((a, b) => a + b, 0);
        progress = Math.round(resolved.reduce((sum, r, i) => sum + r.progress * weights[i], 0) / total);
      }
    }
    visiting.delete(id);
    if (!start) return null;
    if (!end || end < start) end = start;
    const isMilestone = task.type === 'milestone' && !isGroup;
    if (isMilestone) end = start;
    const result: ResolvedTask = { task, start, end, progress, level: level(task), isGroup, isMilestone, children: kids };
    out.set(id, result);
    return result;
  };
  for (const t of tasks) resolve(t.id);
  return out;
}

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

/** Filas visibles: el árbol en orden, sin los hijos de los grupos plegados. */
export function visibleRows(tasks: readonly CbGanttTask[], resolved: Map<string, ResolvedTask>, collapsed: ReadonlySet<string>): ResolvedTask[] {
  const rows: ResolvedTask[] = [];
  const ids = new Set(tasks.map((t) => t.id));
  const walk = (parent: string | null) => {
    for (const t of tasks) {
      const p = t.parent && ids.has(t.parent) && t.parent !== t.id ? t.parent : null;
      if (p !== parent) continue;
      const r = resolved.get(t.id);
      if (!r) continue;
      rows.push(r);
      if (r.children.length && !collapsed.has(t.id)) walk(t.id);
    }
  };
  walk(null);
  return rows;
}

/** Ids de todas las tareas dentro de un grupo (a cualquier nivel). */
export function descendants(tasks: readonly CbGanttTask[], id: string): string[] {
  const out: string[] = [];
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    for (const t of tasks) {
      if (t.parent === current && !out.includes(t.id)) {
        out.push(t.id);
        queue.push(t.id);
      }
    }
  }
  return out;
}

// --- Dependencias ---------------------------------------------------------------------------

/** ¿`to` depende (directa o indirectamente) de `from`? Evita crear ciclos. */
export function dependsOn(tasks: readonly CbGanttTask[], to: string, from: string): boolean {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const stack = [to];
  while (stack.length) {
    const id = stack.pop()!;
    if (id === from) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(byId.get(id)?.dependencies ?? []));
  }
  return false;
}

/** ¿Se puede crear la dependencia `from` → `to`? (sin repetir, sin ciclos ni grupos que se contienen). */
export function canLink(tasks: readonly CbGanttTask[], from: string, to: string): boolean {
  if (from === to) return false;
  const target = tasks.find((t) => t.id === to);
  if (!target || !tasks.some((t) => t.id === from)) return false;
  if (target.dependencies?.includes(from)) return false;
  if (descendants(tasks, from).includes(to) || descendants(tasks, to).includes(from)) return false;
  return !dependsOn(tasks, from, to);
}

/**
 * Planificación automática: cada tarea empieza como pronto el día siguiente al
 * fin de sus predecesoras; si no, se desplaza conservando su duración. Devuelve
 * las tareas cambiadas (las de grupos se resuelven con sus hijas).
 */
export function autoSchedule(tasks: readonly CbGanttTask[]): CbGanttTask[] {
  let current = [...tasks];
  for (let pass = 0; pass < tasks.length + 1; pass++) {
    const resolved = resolveTasks(current);
    let changed = false;
    current = current.map((t) => {
      if (!t.dependencies?.length) return t;
      const self = resolved.get(t.id);
      if (!self || self.isGroup) return t;
      const ends = t.dependencies.map((d) => resolved.get(d)?.end).filter((d): d is Date => !!d);
      if (!ends.length) return t;
      const earliest = addDays(new Date(Math.max(...ends.map((d) => d.getTime()))), 1);
      if (self.start >= earliest) return t;
      const shift = dayDiff(self.start, earliest);
      changed = true;
      return { ...t, start: isoDay(addDays(self.start, shift)), end: isoDay(addDays(self.end, shift)) };
    });
    if (!changed) break;
  }
  return current;
}
