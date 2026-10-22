import {
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { cbHtmlToText } from '@caribeng/ui/editor';
import {
  formatDateRange,
  initials,
  newId,
  toDate,
  type CbKanbanPerson,
  type CbKanbanPriority,
  type CbKanbanTaskPatch,
} from './kanban-task';

/** Columna del tablero (en la lista, una sección). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como Table: los items llegan sin tipar.
export interface CbKanbanColumn<T = any> {
  readonly id: string;
  readonly title: string;
  readonly items: readonly T[];
  /** Límite de tarjetas (WIP). Se avisa al superarlo; con `enforceLimit` no deja pasarlo. */
  readonly limit?: number;
  /** Color de la columna (borde superior). */
  readonly color?: string;
}

/** Tarjeta movida (con ratón, dedo, teclado o el menú "Mover a"). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como Table: los items llegan sin tipar.
export interface CbKanbanMove<T = any> {
  readonly item: T;
  readonly from: string;
  readonly to: string;
  readonly fromIndex: number;
  readonly toIndex: number;
}

/** Tarjeta creada, editada o eliminada. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como Table: los items llegan sin tipar.
export interface CbKanbanCardEvent<T = any> {
  readonly item: T;
  /** Id de la columna. */
  readonly column: string;
  readonly index: number;
  /** Al editar, la tarjeta antes del cambio. */
  readonly previous?: T;
}

/** Columna creada, renombrada o eliminada. */
export interface CbKanbanColumnEvent {
  readonly column: CbKanbanColumn;
  /** Al renombrar, el título anterior. */
  readonly previousTitle?: string;
}

/**
 * Base común de las vistas de tareas (tablero, lista…). Todas leen y escriben el
 * mismo `[(columns)]` sin copia propia, así que varias vistas enlazadas a la misma
 * señal se pueden mostrar a la vez y siempre están al día.
 */
@Directive()
export abstract class CbKanbanView {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Columnas con sus tarjetas (bidireccional: se actualiza al mover, crear, editar o eliminar). */
  readonly columns = model<readonly CbKanbanColumn[]>([]);
  /** Propiedad que identifica cada tarjeta. */
  readonly itemKey = input<string>('id');
  /** Propiedad con el nombre de la tarjeta (tarjeta por defecto, edición y anuncios). */
  readonly itemLabel = input<string>('title');
  /** No deja superar el `limit` de una columna. */
  readonly enforceLimit = input(false, { transform: booleanAttribute });
  /** Las tareas se editan (en el tablero, menú ⋮ y atajos F2 / Supr). */
  readonly editable = input(false, { transform: booleanAttribute });
  /** Se pueden añadir tareas. */
  readonly addable = input(false, { transform: booleanAttribute });
  /** Las columnas se renombran, se eliminan y se añaden. */
  readonly columnsEditable = input(false, { transform: booleanAttribute });
  /** Las columnas se pueden contraer. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  /** Pide confirmación antes de eliminar (tarjetas, y columnas con tarjetas). */
  readonly confirmDelete = input(true, { transform: booleanAttribute });
  /** Crea la tarjeta nueva a partir del título. Por defecto, `{ [itemKey]: id, [itemLabel]: título }`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- la tarjeta es del tipo del consumidor.
  readonly createCard = input<((title: string, columnId: string) => any) | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Texto de una columna vacía. Por defecto, "Sin datos". */
  readonly emptyMessage = input<string | undefined>(undefined);
  /** Nombre de la vista. */
  readonly ariaLabel = input<string>('');
  /** Al abrir una tarea (clic o Enter) se muestra el panel de detalle. */
  readonly details = input(false, { transform: booleanAttribute });
  /** Personas que se pueden asignar (campo `assignees` con sus ids). */
  readonly people = input<readonly CbKanbanPerson[]>([]);
  /** Niveles de prioridad (campo `priority` con su id). Por defecto: baja, media y alta. */
  readonly priorities = input<readonly CbKanbanPriority[] | null>(null);
  /** Tipos de archivo admitidos en los adjuntos (atributo `accept`, p. ej. `'image/*,.pdf'`). */
  readonly accept = input<string>('');

  /** Tarjeta movida (al soltarla o con "Mover a"). */
  readonly cardMove = output<CbKanbanMove>();
  /** Se pulsó (o Enter sobre) una tarjeta. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- la tarjeta llega sin tipar.
  readonly cardOpen = output<any>();
  /** Tarjeta creada. */
  readonly cardAdd = output<CbKanbanCardEvent>();
  /** Tarjeta editada: título, o cualquier campo desde el panel de detalle (`previous` es la tarjeta anterior). */
  readonly cardEdit = output<CbKanbanCardEvent>();
  /** Tarjeta eliminada. */
  readonly cardDelete = output<CbKanbanCardEvent>();
  /** Columna añadida. */
  readonly columnAdd = output<CbKanbanColumnEvent>();
  /** Columna renombrada. */
  readonly columnRename = output<CbKanbanColumnEvent>();
  /** Columna eliminada (con sus tarjetas). */
  readonly columnDelete = output<CbKanbanColumnEvent>();

  protected readonly announcement = signal('');

  // --- Detalle (lo usa el panel compartido) ----------------------------------------
  private readonly detailKey = signal<unknown>(undefined);
  /** @internal */
  readonly detailOpen = signal(false);
  /** @internal La tarea abierta en el panel, siempre en su versión actual. */
  readonly detailTask = computed(() => {
    const key = this.detailKey();
    if (key === undefined) return undefined;
    for (const col of this.columns()) {
      const item = col.items.find((i) => this.key(i) === key);
      if (item !== undefined) return item;
    }
    return undefined;
  });
  /** @internal */
  readonly detailColumnId = computed(() => {
    const key = this.detailKey();
    return this.columns().find((c) => c.items.some((i) => this.key(i) === key))?.id ?? '';
  });
  /** @internal */
  readonly resolvedPriorities = computed<readonly CbKanbanPriority[]>(() => {
    const t = this.t();
    return (
      this.priorities() ?? [
        { id: 'low', label: t.kanbanPriorityLow, severity: 'success' },
        { id: 'medium', label: t.kanbanPriorityMedium, severity: 'warning' },
        { id: 'high', label: t.kanbanPriorityHigh, severity: 'danger' },
      ]
    );
  });

  /** Lleva el foco a la tarea con esa clave (tras el render). */
  protected abstract focusItem(key: unknown): void;

  // --- Datos ---------------------------------------------------------------------
  protected readonly initialsOf = initials;

  protected key(item: unknown): unknown {
    const field = this.itemKey();
    return item && typeof item === 'object' && field in item ? (item as Record<string, unknown>)[field] : item;
  }

  protected keyAttr(item: unknown): string {
    return String(this.key(item));
  }

  protected label(item: unknown): string {
    const field = this.itemLabel();
    if (item && typeof item === 'object' && field in item) return String((item as Record<string, unknown>)[field]);
    return String(item);
  }

  protected field(item: unknown, name: string): unknown {
    return item && typeof item === 'object' ? (item as Record<string, unknown>)[name] : undefined;
  }

  /** La descripción puede ser HTML (del editor): fuera del panel va como texto. */
  protected plain(html: unknown): string {
    return typeof html === 'string' && html.includes('<') ? cbHtmlToText(html).trim() : String(html ?? '');
  }

  protected priorityOf(item: unknown): CbKanbanPriority | undefined {
    const id = this.field(item, 'priority');
    return id == null ? undefined : this.resolvedPriorities().find((p) => p.id === id);
  }

  protected peopleOf(item: unknown): CbKanbanPerson[] {
    const ids = this.field(item, 'assignees');
    if (!Array.isArray(ids)) return [];
    const people = this.people();
    return ids.map((id) => people.find((p) => p.id === id) ?? { id: String(id), name: String(id) });
  }

  protected names(people: readonly CbKanbanPerson[]): string {
    return people.map((p) => p.name).join(', ');
  }

  protected dateLabel(item: unknown): string {
    const start = toDate(this.field(item, 'startDate'));
    const end = toDate(this.field(item, 'endDate'));
    return start || end ? formatDateRange(start, end, this.t().intlLocale, this.t().today) : '';
  }

  /** La fecha de fin ya pasó (las tareas finalizadas no vencen). */
  protected isOverdue(item: unknown): boolean {
    const end = toDate(this.field(item, 'endDate'));
    if (!end || this.isCompleted(item)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end < today;
  }

  protected isCompleted(item: unknown): boolean {
    return this.field(item, 'completed') === true;
  }

  protected attachmentCount(item: unknown): number {
    const list = this.field(item, 'attachments');
    return Array.isArray(list) ? list.length : 0;
  }

  protected isFull(col: CbKanbanColumn): boolean {
    return col.limit !== undefined && col.items.length >= col.limit;
  }

  protected isOver(col: CbKanbanColumn): boolean {
    return col.limit !== undefined && col.items.length > col.limit;
  }

  /** Copia de las columnas con listas mutables (para cambiarlas y publicar el resultado). */
  protected cloneColumns(): (CbKanbanColumn & { items: unknown[] })[] {
    return this.columns().map((c) => ({ ...c, items: [...c.items] }));
  }

  /** Mueve una tarjeta (de forma inmutable) y devuelve las columnas nuevas. */
  protected moved(columns: readonly CbKanbanColumn[], from: number, fromIndex: number, to: number, toIndex: number): CbKanbanColumn[] {
    const next = columns.map((c) => ({ ...c, items: [...c.items] }));
    const [item] = next[from].items.splice(fromIndex, 1);
    next[to].items.splice(Math.max(0, Math.min(toIndex, next[to].items.length)), 0, item);
    return next;
  }

  protected columnIndexOf(item: unknown): number {
    const key = this.key(item);
    return this.columns().findIndex((c) => c.items.some((i) => this.key(i) === key));
  }

  protected indexOf(item: unknown): number {
    const key = this.key(item);
    const col = this.columns()[this.columnIndexOf(item)];
    return col ? col.items.findIndex((i) => this.key(i) === key) : -1;
  }

  // --- Cambios ---------------------------------------------------------------------
  protected moveCard(from: number, fromIndex: number, to: number, toIndex: number, focus = false): void {
    const columns = this.columns();
    const item = columns[from].items[fromIndex];
    const next = this.moved(columns, from, fromIndex, to, toIndex);
    this.columns.set(next);
    const finalIndex = next[to].items.indexOf(item);
    this.cardMove.emit({ item, from: columns[from].id, to: columns[to].id, fromIndex, toIndex: finalIndex });
    this.announcement.set(cbFormat(this.t().kanbanDropped, this.label(item), columns[to].title, finalIndex + 1));
    if (focus) this.focusItem(this.key(item));
  }

  /** Aplica cambios a una tarjeta (emite `cardEdit`). */
  updateTask(item: unknown, patch: CbKanbanTaskPatch): void {
    const next = this.cloneColumns();
    const key = this.key(item);
    const column = next.findIndex((c) => c.items.some((i) => this.key(i) === key));
    if (column < 0) return;
    const index = next[column].items.findIndex((i) => this.key(i) === key);
    const previous = next[column].items[index];
    const updated = { ...(previous as object), ...patch };
    next[column].items.splice(index, 1, updated);
    this.columns.set(next);
    this.cardEdit.emit({ item: updated, previous, column: next[column].id, index });
    this.announcement.set(cbFormat(this.t().kanbanUpdated, this.label(updated)));
  }

  /** Mueve una tarjeta al final de otra columna. */
  moveTask(item: unknown, columnId: string): void {
    const columns = this.columns();
    const to = columns.findIndex((c) => c.id === columnId);
    const from = this.columnIndexOf(item);
    if (to < 0 || from < 0 || to === from) return;
    if (this.enforceLimit() && this.isFull(columns[to])) {
      this.announcement.set(cbFormat(this.t().kanbanFull, columns[to].title));
      return;
    }
    this.moveCard(from, this.indexOf(item), to, columns[to].items.length);
  }

  /** Elimina una tarjeta (emite `cardDelete`). */
  protected deleteCard(column: number, index: number): void {
    const next = this.cloneColumns();
    const [item] = next[column].items.splice(index, 1);
    this.columns.set(next);
    this.cardDelete.emit({ item, column: next[column].id, index });
    this.announcement.set(cbFormat(this.t().kanbanDeleted, this.label(item)));
    this.afterDelete(next, column, index);
  }

  /** Tras eliminar: cada vista decide a dónde va el foco. */
  protected afterDelete(_columns: readonly CbKanbanColumn[], _column: number, _index: number): void {
    // Por defecto, nada.
  }

  /**
   * Añade una tarjeta al final de la columna (`createCard` decide su forma) con los
   * campos de `extra` (p. ej. las fechas del día en el calendario). Devuelve la tarjeta.
   */
  addCard(columnId: string, title: string, extra?: CbKanbanTaskPatch): unknown {
    const factory = this.createCard();
    const created = factory ? factory(title, columnId) : { [this.itemKey()]: newId(), [this.itemLabel()]: title };
    const item = extra && created && typeof created === 'object' ? { ...created, ...extra } : created;
    const next = this.cloneColumns();
    const column = next.findIndex((c) => c.id === columnId);
    if (column < 0) return undefined;
    next[column].items.push(item);
    this.columns.set(next);
    this.cardAdd.emit({ item, column: columnId, index: next[column].items.length - 1 });
    this.announcement.set(cbFormat(this.t().kanbanAdded, title, next[column].title));
    return item;
  }

  /** Crea una columna vacía al final y la devuelve. */
  protected appendColumn(title: string): CbKanbanColumn {
    const column: CbKanbanColumn = { id: newId(), title, items: [] };
    this.columns.set([...this.columns(), column]);
    this.columnAdd.emit({ column });
    return column;
  }

  protected renameColumnTo(col: CbKanbanColumn, title: string): void {
    const next = this.columns().map((c) => (c.id === col.id ? { ...c, title } : c));
    this.columns.set(next);
    this.columnRename.emit({ column: next.find((c) => c.id === col.id)!, previousTitle: col.title });
    this.announcement.set(cbFormat(this.t().kanbanRenamed, col.title, title));
  }

  protected removeColumn(col: CbKanbanColumn): void {
    this.columns.set(this.columns().filter((c) => c.id !== col.id));
    this.columnDelete.emit({ column: col });
    this.announcement.set(cbFormat(this.t().kanbanDeleted, col.title));
  }

  // --- Detalle de la tarea -----------------------------------------------------------
  protected openCard(item: unknown): void {
    this.cardOpen.emit(item);
    if (this.details()) this.openDetails(item);
  }

  /** Abre el panel de detalle de una tarjeta. */
  openDetails(item: unknown): void {
    this.detailKey.set(this.key(item));
    this.detailOpen.set(true);
  }

  /** Cierra el panel de detalle. */
  closeDetails(): void {
    this.detailOpen.set(false);
  }

  /** @internal */
  onDetailsHidden(): void {
    const key = this.detailKey();
    this.detailKey.set(undefined);
    // La tarjeta pudo cambiar de columna mientras el panel estaba abierto.
    if (key !== undefined) this.focusItem(key);
  }

  /** @internal */
  removeFromDetails(item: unknown): void {
    const column = this.columnIndexOf(item);
    if (column < 0) return;
    this.detailKey.set(undefined);
    this.closeDetails();
    this.deleteCard(column, this.indexOf(item));
  }

  // --- Utilidades ------------------------------------------------------------------
  protected afterRender(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }
}
