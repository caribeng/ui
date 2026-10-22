import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CdkDrag, CdkDragPlaceholder, CdkDropList, CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbDrawer } from '@caribeng/ui/drawer';
import { cbHtmlToText } from '@caribeng/ui/editor';
import { CbIcon } from '@caribeng/ui/icon';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { CbKanbanTaskPanel } from './kanban-task-panel.component';
import {
  formatDateRange,
  initials,
  newId,
  toDate,
  type CbKanbanPerson,
  type CbKanbanPriority,
  type CbKanbanTaskPatch,
} from './kanban-task';

/** Columna del tablero. */
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- la plantilla recibe la tarjeta sin tipar.
export interface CbKanbanCardContext<T = any> {
  $implicit: T;
  column: CbKanbanColumn<T>;
  index: number;
}

/** Plantilla de las tarjetas: `<ng-template cbKanbanCard let-item let-column="column">`. */
@Directive({ selector: 'ng-template[cbKanbanCard]' })
export class CbKanbanCardDirective {
  readonly template = inject<TemplateRef<CbKanbanCardContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbKanbanCardDirective, ctx: unknown): ctx is CbKanbanCardContext {
    return true;
  }
}

interface Grab {
  readonly key: unknown;
  readonly snapshot: readonly CbKanbanColumn[];
  readonly fromColumn: number;
  readonly fromIndex: number;
}

let nextUid = 0;

/**
 * Tablero Kanban de CaribeNG. Las tarjetas se reordenan y se mueven entre
 * columnas arrastrando (ratón o dedo, con `@angular/cdk/drag-drop`; toda la
 * columna es zona de soltar y el tablero se desplaza solo hacia las columnas
 * ocultas) o con el teclado (Espacio toma, flechas mueven, Espacio suelta,
 * Escape cancela), con cada paso anunciado.
 *
 * Con `editable` cada tarjeta tiene un menú ⋮ (editar, mover a otra columna,
 * eliminar) y atajos (F2 edita, Supr elimina); con `addable`, un campo para
 * añadir tarjetas al pie de cada columna; con `columnsEditable`, las columnas se
 * renombran, se eliminan y se añaden; con `collapsible`, se contraen.
 *
 * Con `details`, al abrir una tarjeta aparece un panel lateral para editar la
 * tarea completa: columna, responsables (`people`), prioridad (`priorities`),
 * fechas de inicio y fin, descripción y adjuntos (ver `CbKanbanTask`). La
 * tarjeta por defecto muestra la prioridad, las fechas, los adjuntos y los
 * responsables.
 *
 * @example
 * ```html
 * <cb-kanban [(columns)]="columnas" editable addable columnsEditable (cardMove)="guardar($event)">
 *   <ng-template cbKanbanCard let-tarea>{{ tarea.title }}</ng-template>
 * </cb-kanban>
 * ```
 */
@Component({
  selector: 'cb-kanban',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CdkScrollable, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPlaceholder, CbDrawer, CbIcon, CbKanbanTaskPanel, CbMenu],
  host: { class: 'cb-kanban' },
  template: `
    <div class="cb-kanban__board" cdkScrollable cdkDropListGroup [attr.aria-label]="ariaLabel() || null" [attr.role]="ariaLabel() ? 'group' : null">
      @for (col of columns(); track col.id; let c = $index) {
        <section
          class="cb-kanban__column"
          [class.cb-kanban__column--collapsed]="isCollapsed(col)"
          [style.--cb-kanban-color]="col.color || null"
          [attr.aria-labelledby]="uid + '-h' + c"
          cdkDropList
          cdkDropListElementContainer=".cb-kanban__list"
          [cdkDropListData]="col"
          [cdkDropListDisabled]="disabled() || isCollapsed(col)"
          [cdkDropListEnterPredicate]="canEnter"
          (cdkDropListDropped)="onDrop($event)"
        >
          <header class="cb-kanban__header">
            @if (collapsible()) {
              <button
                type="button"
                class="cb-kanban__icon-btn"
                [attr.aria-expanded]="!isCollapsed(col)"
                [attr.aria-controls]="uid + '-l' + c"
                [attr.aria-label]="fmt(isCollapsed(col) ? t().kanbanExpand : t().kanbanCollapse, col.title)"
                (click)="toggleCollapse(col)"
              >
                <cb-icon [name]="isCollapsed(col) ? 'chevron-right' : 'chevron-down'" [size]="16" aria-hidden="true" />
              </button>
            }
            @if (renamingColumn() === col.id) {
              <input
                #columnInput
                class="cb-kanban__title-input"
                type="text"
                [value]="col.title"
                [attr.aria-label]="t().kanbanColumnName"
                (keydown.enter)="$event.preventDefault(); renameColumn(col, $any($event.target).value)"
                (keydown.escape)="$event.preventDefault(); cancelColumnRename(col)"
                (blur)="renameColumn(col, $any($event.target).value)"
              />
            } @else {
              <h3 class="cb-kanban__title" [id]="uid + '-h' + c" (dblclick)="columnsEditable() && startColumnRename(col)">{{ col.title }}</h3>
            }
            <span class="cb-kanban__count" [class.cb-kanban__count--over]="isOver(col)">
              {{ col.limit ? fmt(t().kanbanCount, col.items.length, col.limit) : col.items.length }}
            </span>
            @if (columnsEditable()) {
              <button
                type="button"
                class="cb-kanban__icon-btn"
                [attr.data-column-menu]="col.id"
                aria-haspopup="menu"
                [attr.aria-label]="fmt(t().kanbanColumnActions, col.title)"
                (click)="openColumnMenu($event, col)"
              >
                <ng-container *ngTemplateOutlet="dots" />
              </button>
            }
          </header>

          @if (confirmingColumn() === col.id) {
            <div class="cb-kanban__confirm" role="group" [attr.aria-label]="t().kanbanDelete">
              <p class="cb-kanban__confirm-text">{{ fmt(t().kanbanConfirmDeleteColumn, col.title, col.items.length) }}</p>
              <div class="cb-kanban__confirm-actions">
                <button type="button" class="cb-kanban__btn" data-confirm-cancel (click)="cancelColumnDelete(col)" (keydown.escape)="cancelColumnDelete(col)">{{ t().cancel }}</button>
                <button type="button" class="cb-kanban__btn cb-kanban__btn--danger" (click)="deleteColumn(col)">{{ t().kanbanDelete }}</button>
              </div>
            </div>
          }

          <div class="cb-kanban__list" role="list" [id]="uid + '-l' + c">
            @for (item of col.items; track key(item); let i = $index) {
              <div
                class="cb-kanban__item"
                role="listitem"
                cdkDrag
                [cdkDragData]="item"
                [cdkDragDisabled]="disabled() || editingKey() === key(item) || confirmingKey() === key(item)"
                [cdkDragStartDelay]="{ touch: 180, mouse: 0 }"
                cdkDragPreviewClass="cb-kanban-preview"
              >
                @if (editingKey() === key(item)) {
                  <form class="cb-kanban__editor" (submit)="$event.preventDefault(); saveEdit(c, i, editField.value)">
                    <textarea
                      #editField
                      class="cb-kanban__textarea"
                      rows="2"
                      [value]="label(item)"
                      [attr.aria-label]="t().kanbanCardTitle"
                      (keydown)="onEditorKeydown($event, c, i, editField.value)"
                    ></textarea>
                    <div class="cb-kanban__confirm-actions">
                      <button type="button" class="cb-kanban__btn" (click)="cancelEdit(item)">{{ t().cancel }}</button>
                      <button type="submit" class="cb-kanban__btn cb-kanban__btn--primary">{{ t().save }}</button>
                    </div>
                  </form>
                } @else if (confirmingKey() === key(item)) {
                  <div class="cb-kanban__confirm cb-kanban__confirm--card" role="group" [attr.aria-label]="t().kanbanDelete">
                    <p class="cb-kanban__confirm-text">{{ fmt(t().kanbanConfirmDelete, label(item)) }}</p>
                    <div class="cb-kanban__confirm-actions">
                      <button type="button" class="cb-kanban__btn" data-confirm-cancel (click)="cancelDelete(item)" (keydown.escape)="cancelDelete(item)">{{ t().cancel }}</button>
                      <button type="button" class="cb-kanban__btn cb-kanban__btn--danger" (click)="deleteCard(c, i)">{{ t().kanbanDelete }}</button>
                    </div>
                  </div>
                } @else {
                  <div
                    class="cb-kanban__card"
                    tabindex="0"
                    role="button"
                    [class.cb-kanban__card--editable]="editable()"
                    [attr.data-key]="keyAttr(item)"
                    [class.cb-kanban__card--grabbed]="isGrabbed(item)"
                    [attr.aria-roledescription]="t().kanbanCard"
                    [attr.aria-describedby]="uid + '-help'"
                    [attr.aria-pressed]="isGrabbed(item)"
                    [attr.aria-haspopup]="details() ? 'dialog' : null"
                    (keydown)="onCardKeydown($event, c, i)"
                    (click)="openCard(item)"
                  >
                    <ng-container *ngTemplateOutlet="cardTpl()?.template ?? defaultCard; context: { $implicit: item, column: col, index: i }" />
                  </div>
                  @if (editable()) {
                    <button
                      type="button"
                      class="cb-kanban__card-menu"
                      [attr.data-card-menu]="keyAttr(item)"
                      aria-haspopup="menu"
                      [attr.aria-label]="fmt(t().kanbanCardActions, label(item))"
                      (mousedown)="$event.stopPropagation()"
                      (touchstart)="$event.stopPropagation()"
                      (click)="openCardMenu($event, c, i)"
                    >
                      <ng-container *ngTemplateOutlet="dots" />
                    </button>
                  }
                }
                <div *cdkDragPlaceholder class="cb-kanban__placeholder"></div>
              </div>
            } @empty {
              <div class="cb-kanban__empty">{{ emptyMessage() ?? t().noData }}</div>
            }
          </div>

          @if (addable() && !isCollapsed(col)) {
            @if (composing() === col.id) {
              <form class="cb-kanban__composer" (submit)="$event.preventDefault(); addCardFrom(col, composerField)">
                <textarea
                  #composerField
                  class="cb-kanban__textarea"
                  rows="2"
                  [attr.aria-label]="t().kanbanCardTitle"
                  [placeholder]="t().kanbanCardTitle"
                  (keydown)="onComposerKeydown($event, col, composerField)"
                ></textarea>
                <div class="cb-kanban__confirm-actions">
                  <button type="button" class="cb-kanban__btn" (click)="closeComposer(col)">{{ t().cancel }}</button>
                  <button type="submit" class="cb-kanban__btn cb-kanban__btn--primary">{{ t().kanbanAdd }}</button>
                </div>
              </form>
            } @else {
              <button
                type="button"
                class="cb-kanban__add"
                [attr.data-add]="col.id"
                [disabled]="disabled() || (enforceLimit() && isFull(col))"
                (click)="openComposer(col)"
              >
                <cb-icon name="plus" [size]="16" aria-hidden="true" />
                {{ t().kanbanAdd }}
              </button>
            }
          }
        </section>
      }
      @if (columnsEditable()) {
        <button type="button" class="cb-kanban__add-column" [disabled]="disabled()" (click)="addColumn()">
          <cb-icon name="plus" [size]="16" aria-hidden="true" />
          {{ t().kanbanAddColumn }}
        </button>
      }
    </div>
    <p class="cb-kanban__sr" [id]="uid + '-help'">{{ t().kanbanInstructions }}</p>
    <div class="cb-kanban__sr" role="status">{{ announcement() }}</div>
    <cb-menu #menu [items]="menuItems()" [ariaLabel]="menuLabel()" />

    @if (details()) {
      <cb-drawer
        [visible]="detailOpen()"
        (visibleChange)="!$event && closeDetails()"
        [header]="t().kanbanDetails"
        size="34rem"
        (onHide)="onDetailsHidden()"
      >
        @if (detailTask(); as task) {
          <cb-kanban-task-panel
            [task]="task"
            [itemLabel]="itemLabel()"
            [columns]="columns()"
            [columnId]="detailColumnId()"
            [people]="people()"
            [priorities]="resolvedPriorities()"
            [editable]="editable() && !disabled()"
            [accept]="accept()"
            [confirmDelete]="confirmDelete()"
            (patch)="updateTask(task, $event)"
            (move)="moveTask(task, $event)"
            (remove)="removeFromDetails(task)"
          />
        }
      </cb-drawer>
    }

    <ng-template #defaultCard let-item>
      <span class="cb-kanban__card-title">{{ label(item) }}</span>
      @if (item?.description) {
        <span class="cb-kanban__card-description">{{ plain(item.description) }}</span>
      }
      @if (hasMeta(item)) {
        <span class="cb-kanban__meta">
          @if (priorityOf(item); as p) {
            <span class="cb-kanban__priority" [attr.data-severity]="p.severity || 'secondary'">
              <span class="cb-kanban__sr">{{ t().kanbanPriority }}: </span>{{ p.label }}
            </span>
          }
          @if (dateLabel(item); as d) {
            <span class="cb-kanban__date" [class.cb-kanban__date--overdue]="isOverdue(item)">
              <cb-icon name="calendar" [size]="13" aria-hidden="true" />
              <span class="cb-kanban__sr">{{ t().kanbanDates }}: </span>{{ d }}
              @if (isOverdue(item)) {
                <span class="cb-kanban__sr"> ({{ t().kanbanOverdue }})</span>
              }
            </span>
          }
          @if (attachmentCount(item); as n) {
            <span class="cb-kanban__attachments">
              <cb-icon name="file" [size]="13" aria-hidden="true" />
              <span aria-hidden="true">{{ n }}</span>
              <span class="cb-kanban__sr">{{ fmt(t().kanbanAttachmentCount, n) }}</span>
            </span>
          }
          @if (peopleOf(item); as people) {
            @if (people.length) {
              <span class="cb-kanban__avatars">
                @for (person of people.slice(0, 3); track person.id) {
                  <span class="cb-kanban__avatar" aria-hidden="true" [attr.title]="person.name">
                    @if (person.image) {
                      <img [src]="person.image" alt="" />
                    } @else {
                      {{ initialsOf(person.name) }}
                    }
                  </span>
                }
                @if (people.length > 3) {
                  <span class="cb-kanban__avatar cb-kanban__avatar--more" aria-hidden="true">+{{ people.length - 3 }}</span>
                }
                <span class="cb-kanban__sr">{{ fmt(t().kanbanAssignedTo, names(people)) }}</span>
              </span>
            }
          }
        </span>
      }
    </ng-template>
    <ng-template #dots>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
      </svg>
    </ng-template>
  `,
  styleUrl: './kanban.component.css',
})
export class CbKanban {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly menu = viewChild.required<CbMenu>('menu');
  protected readonly uid = `cb-kanban-${++nextUid}`;
  protected readonly cardTpl = contentChild(CbKanbanCardDirective);

  /** Columnas con sus tarjetas (bidireccional: se actualiza al mover, crear, editar o eliminar). */
  readonly columns = model<readonly CbKanbanColumn[]>([]);
  /** Propiedad que identifica cada tarjeta. */
  readonly itemKey = input<string>('id');
  /** Propiedad con el nombre de la tarjeta (tarjeta por defecto, edición y anuncios). */
  readonly itemLabel = input<string>('title');
  /** No deja superar el `limit` de una columna. */
  readonly enforceLimit = input(false, { transform: booleanAttribute });
  /** Menú ⋮ en cada tarjeta (editar, mover a, eliminar) y atajos F2 / Supr. */
  readonly editable = input(false, { transform: booleanAttribute });
  /** Campo "Añadir tarjeta" al pie de cada columna. */
  readonly addable = input(false, { transform: booleanAttribute });
  /** Las columnas se renombran (doble clic o menú), se eliminan y se añaden. */
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
  /** Nombre del tablero. */
  readonly ariaLabel = input<string>('');
  /** Al abrir una tarjeta (clic o Enter) se muestra el panel de detalle de la tarea. */
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
  /** Tarjeta creada con el campo "Añadir tarjeta". */
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
  private readonly grab = signal<Grab | null>(null);
  protected readonly editingKey = signal<unknown>(undefined);
  protected readonly confirmingKey = signal<unknown>(undefined);
  protected readonly composing = signal<string | null>(null);
  protected readonly renamingColumn = signal<string | null>(null);
  protected readonly confirmingColumn = signal<string | null>(null);
  private readonly collapsed = signal<ReadonlySet<string>>(new Set());
  protected readonly menuItems = signal<CbMenuItem[]>([]);
  protected readonly menuLabel = signal('');
  /** Al renombrar con Enter, el blur posterior no vuelve a guardar. */
  private renameDone = false;
  private readonly detailKey = signal<unknown>(undefined);
  protected readonly detailOpen = signal(false);
  /** La tarea abierta en el panel, siempre en su versión actual. */
  protected readonly detailTask = computed(() => {
    const key = this.detailKey();
    if (key === undefined) return undefined;
    for (const col of this.columns()) {
      const item = col.items.find((i) => this.key(i) === key);
      if (item !== undefined) return item;
    }
    return undefined;
  });
  protected readonly detailColumnId = computed(() => {
    const key = this.detailKey();
    return this.columns().find((c) => c.items.some((i) => this.key(i) === key))?.id ?? '';
  });
  protected readonly resolvedPriorities = computed<readonly CbKanbanPriority[]>(() => {
    const t = this.t();
    return (
      this.priorities() ?? [
        { id: 'low', label: t.kanbanPriorityLow, severity: 'success' },
        { id: 'medium', label: t.kanbanPriorityMedium, severity: 'warning' },
        { id: 'high', label: t.kanbanPriorityHigh, severity: 'danger' },
      ]
    );
  });
  protected readonly initialsOf = initials;
  /** La descripción puede ser HTML (del editor): en la tarjeta va como texto. */
  protected plain(html: unknown): string {
    return typeof html === 'string' && html.includes('<') ? cbHtmlToText(html).trim() : String(html ?? '');
  }

  // --- Datos ---------------------------------------------------------------
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

  private field(item: unknown, name: string): unknown {
    return item && typeof item === 'object' ? (item as Record<string, unknown>)[name] : undefined;
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
    return start || end ? formatDateRange(start, end, this.t().intlLocale) : '';
  }

  /** La fecha de fin ya pasó. */
  protected isOverdue(item: unknown): boolean {
    const end = toDate(this.field(item, 'endDate'));
    if (!end) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end < today;
  }

  protected attachmentCount(item: unknown): number {
    const list = this.field(item, 'attachments');
    return Array.isArray(list) ? list.length : 0;
  }

  protected hasMeta(item: unknown): boolean {
    return !!(this.priorityOf(item) || this.dateLabel(item) || this.attachmentCount(item) || this.peopleOf(item).length);
  }

  protected isFull(col: CbKanbanColumn): boolean {
    return col.limit !== undefined && col.items.length >= col.limit;
  }

  protected isOver(col: CbKanbanColumn): boolean {
    return col.limit !== undefined && col.items.length > col.limit;
  }

  protected isGrabbed(item: unknown): boolean {
    const grab = this.grab();
    return !!grab && grab.key === this.key(item);
  }

  protected isCollapsed(col: CbKanbanColumn): boolean {
    return this.collapsed().has(col.id);
  }

  /** Copia de las columnas con listas mutables (para cambiarlas y publicar el resultado). */
  private cloneColumns(): (CbKanbanColumn & { items: unknown[] })[] {
    return this.columns().map((c) => ({ ...c, items: [...c.items] }));
  }

  /** Mueve una tarjeta (de forma inmutable) y devuelve las columnas nuevas. */
  private moved(columns: readonly CbKanbanColumn[], from: number, fromIndex: number, to: number, toIndex: number): CbKanbanColumn[] {
    const next = columns.map((c) => ({ ...c, items: [...c.items] }));
    const [item] = next[from].items.splice(fromIndex, 1);
    next[to].items.splice(Math.max(0, Math.min(toIndex, next[to].items.length)), 0, item);
    return next;
  }

  // --- Arrastrar (CDK) ------------------------------------------------------
  protected readonly canEnter = (drag: CdkDrag, drop: CdkDropList<CbKanbanColumn>): boolean =>
    !this.enforceLimit() || drag.dropContainer === drop || !this.isFull(drop.data);

  protected onDrop(event: CdkDragDrop<CbKanbanColumn>): void {
    const columns = this.columns();
    const from = columns.indexOf(event.previousContainer.data);
    const to = columns.indexOf(event.container.data);
    if (from < 0 || to < 0 || (from === to && event.previousIndex === event.currentIndex)) return;
    this.moveCard(from, event.previousIndex, to, event.currentIndex);
  }

  private moveCard(from: number, fromIndex: number, to: number, toIndex: number, focus = false): void {
    const columns = this.columns();
    const item = columns[from].items[fromIndex];
    const next = this.moved(columns, from, fromIndex, to, toIndex);
    this.columns.set(next);
    const finalIndex = next[to].items.indexOf(item);
    this.cardMove.emit({ item, from: columns[from].id, to: columns[to].id, fromIndex, toIndex: finalIndex });
    this.announcement.set(cbFormat(this.t().kanbanDropped, this.label(item), columns[to].title, finalIndex + 1));
    if (focus) this.focusCard(this.key(item));
  }

  // --- Teclado en la tarjeta -------------------------------------------------------
  protected onCardKeydown(event: KeyboardEvent, column: number, index: number): void {
    if (this.disabled()) return;
    const columns = this.columns();
    const item = columns[column].items[index];
    const grab = this.grab();

    if (!grab) {
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        this.grab.set({ key: this.key(item), snapshot: columns, fromColumn: column, fromIndex: index });
        this.announce('kanbanGrabbed', item, column, index);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.openCard(item);
      } else if (event.key === 'F2' && this.editable()) {
        event.preventDefault();
        this.startEdit(item);
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && this.editable()) {
        event.preventDefault();
        this.requestDelete(column, index);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        const toIndex = index + (event.key === 'ArrowDown' ? 1 : -1);
        if (toIndex < 0 || toIndex >= columns[column].items.length) return;
        this.applyKeyboardMove(column, index, column, toIndex, item);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        event.preventDefault();
        const step = event.key === 'ArrowRight' ? 1 : -1;
        let target = column + step;
        // Salta las columnas contraídas y, si el límite es obligatorio, las llenas.
        while (target >= 0 && target < columns.length && (this.isCollapsed(columns[target]) || (this.enforceLimit() && this.isFull(columns[target])))) {
          if (this.isFull(columns[target])) this.announcement.set(cbFormat(this.t().kanbanFull, columns[target].title));
          target += step;
        }
        if (target < 0 || target >= columns.length) return;
        this.applyKeyboardMove(column, index, target, Math.min(index, columns[target].items.length), item);
        break;
      }
      case ' ':
      case 'Spacebar':
      case 'Enter': {
        event.preventDefault();
        this.grab.set(null);
        const from = grab.snapshot[grab.fromColumn];
        if (from.id !== columns[column].id || grab.fromIndex !== index) {
          this.cardMove.emit({ item, from: from.id, to: columns[column].id, fromIndex: grab.fromIndex, toIndex: index });
        }
        this.announcement.set(cbFormat(this.t().kanbanDropped, this.label(item), columns[column].title, index + 1));
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.grab.set(null);
        this.columns.set(grab.snapshot);
        this.announcement.set(cbFormat(this.t().kanbanCancelled, this.label(item), grab.snapshot[grab.fromColumn].title));
        this.focusCard(this.key(item));
        break;
      }
      case 'Tab':
        // Salir con Tab suelta la tarjeta donde está.
        this.grab.set(null);
        break;
    }
  }

  private applyKeyboardMove(from: number, fromIndex: number, to: number, toIndex: number, item: unknown): void {
    this.columns.set(this.moved(this.columns(), from, fromIndex, to, toIndex));
    this.announce('kanbanMoved', item, to, toIndex);
    this.focusCard(this.key(item));
  }

  private announce(key: 'kanbanGrabbed' | 'kanbanMoved', item: unknown, column: number, index: number): void {
    const col = this.columns()[column];
    this.announcement.set(cbFormat(this.t()[key], this.label(item), col.title, index + 1, col.items.length));
  }

  // --- Menú ⋮ ------------------------------------------------------------------
  protected openCardMenu(event: MouseEvent, column: number, index: number): void {
    const columns = this.columns();
    const item = columns[column].items[index];
    const moveTo = columns
      .map((c, i) => ({ c, i }))
      .filter(({ c, i }) => i !== column && !(this.enforceLimit() && this.isFull(c)))
      .map(({ c, i }) => ({
        label: cbFormat(this.t().kanbanMoveTo, c.title),
        icon: 'arrow-right',
        command: () => this.moveCard(this.columnIndexOf(item), this.indexOf(item), i, this.columns()[i].items.length, true),
      }));
    this.menuLabel.set(cbFormat(this.t().kanbanCardActions, this.label(item)));
    this.menuItems.set([
      ...(this.details() ? [{ label: this.t().kanbanOpenDetails, icon: 'panel-right-open', command: () => this.openDetails(item) }] : []),
      { label: this.t().kanbanEdit, icon: 'pencil', command: () => this.startEdit(item) },
      ...moveTo,
      { label: '', separator: true },
      { label: this.t().kanbanDelete, icon: 'trash', command: () => this.requestDelete(this.columnIndexOf(item), this.indexOf(item)) },
    ]);
    this.menu().toggle(event);
  }

  protected openColumnMenu(event: MouseEvent, col: CbKanbanColumn): void {
    this.menuLabel.set(cbFormat(this.t().kanbanColumnActions, col.title));
    this.menuItems.set([
      { label: this.t().kanbanRename, icon: 'pencil', command: () => this.startColumnRename(col) },
      ...(this.addable() ? [{ label: this.t().kanbanAdd, icon: 'plus', command: () => this.openComposer(col) }] : []),
      { label: '', separator: true },
      { label: this.t().kanbanDelete, icon: 'trash', command: () => this.requestColumnDelete(col) },
    ]);
    this.menu().toggle(event);
  }

  private columnIndexOf(item: unknown): number {
    const key = this.key(item);
    return this.columns().findIndex((c) => c.items.some((i) => this.key(i) === key));
  }

  private indexOf(item: unknown): number {
    const key = this.key(item);
    const col = this.columns()[this.columnIndexOf(item)];
    return col ? col.items.findIndex((i) => this.key(i) === key) : -1;
  }

  // --- Detalle de la tarea ------------------------------------------------------
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

  protected onDetailsHidden(): void {
    const key = this.detailKey();
    this.detailKey.set(undefined);
    // La tarjeta pudo cambiar de columna mientras el panel estaba abierto.
    if (key !== undefined) this.focusCard(key);
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

  protected removeFromDetails(item: unknown): void {
    const column = this.columnIndexOf(item);
    if (column < 0) return;
    this.detailKey.set(undefined);
    this.closeDetails();
    this.deleteCard(column, this.indexOf(item));
  }

  // --- Editar ------------------------------------------------------------------
  /** Pasa la tarjeta a modo edición (título). */
  startEdit(item: unknown): void {
    this.confirmingKey.set(undefined);
    this.editingKey.set(this.key(item));
    this.afterRender(() => {
      const field = this.host.nativeElement.querySelector<HTMLTextAreaElement>('.cb-kanban__editor textarea');
      field?.focus();
      field?.select();
    });
  }

  protected onEditorKeydown(event: KeyboardEvent, column: number, index: number, value: string): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.saveEdit(column, index, value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit(this.columns()[column].items[index]);
    }
  }

  protected saveEdit(column: number, index: number, value: string): void {
    const title = value.trim();
    const previous = this.columns()[column].items[index];
    if (!title || title === this.label(previous)) return this.cancelEdit(previous);
    const updated = typeof previous === 'object' && previous !== null ? { ...previous, [this.itemLabel()]: title } : title;
    const next = this.cloneColumns();
    next[column].items.splice(index, 1, updated);
    this.columns.set(next);
    this.editingKey.set(undefined);
    this.cardEdit.emit({ item: updated, previous, column: next[column].id, index });
    this.announcement.set(cbFormat(this.t().kanbanRenamed, this.label(previous), title));
    this.focusCard(this.key(updated));
  }

  protected cancelEdit(item: unknown): void {
    this.editingKey.set(undefined);
    this.focusCard(this.key(item));
  }

  // --- Eliminar ------------------------------------------------------------------
  private requestDelete(column: number, index: number): void {
    const item = this.columns()[column].items[index];
    if (!this.confirmDelete()) return this.deleteCard(column, index);
    this.editingKey.set(undefined);
    this.confirmingKey.set(this.key(item));
    this.afterRender(() => this.host.nativeElement.querySelector<HTMLElement>('.cb-kanban__confirm--card [data-confirm-cancel]')?.focus());
  }

  protected cancelDelete(item: unknown): void {
    this.confirmingKey.set(undefined);
    this.focusCard(this.key(item));
  }

  protected deleteCard(column: number, index: number): void {
    const next = this.cloneColumns();
    const [item] = next[column].items.splice(index, 1);
    this.columns.set(next);
    this.confirmingKey.set(undefined);
    this.cardDelete.emit({ item, column: next[column].id, index });
    this.announcement.set(cbFormat(this.t().kanbanDeleted, this.label(item)));
    // El foco pasa a la tarjeta vecina, o al botón de añadir de la columna.
    const neighbour = next[column].items[index] ?? next[column].items[index - 1];
    if (neighbour !== undefined) this.focusCard(this.key(neighbour));
    else this.afterRender(() => this.byData('add', next[column].id)?.focus());
  }

  // --- Añadir tarjetas ---------------------------------------------------------------
  protected openComposer(col: CbKanbanColumn): void {
    this.composing.set(col.id);
    this.afterRender(() => this.host.nativeElement.querySelector<HTMLTextAreaElement>('.cb-kanban__composer textarea')?.focus());
  }

  protected closeComposer(col: CbKanbanColumn): void {
    this.composing.set(null);
    this.afterRender(() => this.byData('add', col.id)?.focus());
  }

  protected onComposerKeydown(event: KeyboardEvent, col: CbKanbanColumn, field: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.addCardFrom(col, field);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeComposer(col);
    }
  }

  protected addCardFrom(col: CbKanbanColumn, field: HTMLTextAreaElement): void {
    const title = field.value.trim();
    if (!title) return;
    if (this.enforceLimit() && this.isFull(this.columns().find((c) => c.id === col.id) ?? col)) {
      this.announcement.set(cbFormat(this.t().kanbanFull, col.title));
      return;
    }
    this.addCard(col.id, title);
    // El campo sigue abierto para añadir varias seguidas.
    field.value = '';
    field.focus();
  }

  /** Añade una tarjeta al final de la columna (`createCard` decide su forma). */
  addCard(columnId: string, title: string): void {
    const factory = this.createCard();
    const item = factory ? factory(title, columnId) : { [this.itemKey()]: newId(), [this.itemLabel()]: title };
    const next = this.cloneColumns();
    const column = next.findIndex((c) => c.id === columnId);
    if (column < 0) return;
    next[column].items.push(item);
    this.columns.set(next);
    this.cardAdd.emit({ item, column: columnId, index: next[column].items.length - 1 });
    this.announcement.set(cbFormat(this.t().kanbanAdded, title, next[column].title));
  }

  // --- Columnas ---------------------------------------------------------------------
  protected toggleCollapse(col: CbKanbanColumn): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      if (next.has(col.id)) next.delete(col.id);
      else next.add(col.id);
      return next;
    });
  }

  protected startColumnRename(col: CbKanbanColumn): void {
    this.renameDone = false;
    this.renamingColumn.set(col.id);
    this.afterRender(() => {
      const field = this.host.nativeElement.querySelector<HTMLInputElement>('.cb-kanban__title-input');
      field?.focus();
      field?.select();
    });
  }

  protected renameColumn(col: CbKanbanColumn, value: string): void {
    if (this.renameDone || this.renamingColumn() !== col.id) return;
    this.renameDone = true;
    this.renamingColumn.set(null);
    const title = value.trim();
    if (!title || title === col.title) return this.focusColumnMenu(col);
    const next = this.columns().map((c) => (c.id === col.id ? { ...c, title } : c));
    this.columns.set(next);
    this.columnRename.emit({ column: next.find((c) => c.id === col.id)!, previousTitle: col.title });
    this.announcement.set(cbFormat(this.t().kanbanRenamed, col.title, title));
    this.focusColumnMenu(col);
  }

  protected cancelColumnRename(col: CbKanbanColumn): void {
    this.renameDone = true;
    this.renamingColumn.set(null);
    this.focusColumnMenu(col);
  }

  private requestColumnDelete(col: CbKanbanColumn): void {
    if (!col.items.length || !this.confirmDelete()) return this.deleteColumn(col);
    this.confirmingColumn.set(col.id);
    this.afterRender(() => this.host.nativeElement.querySelector<HTMLElement>('.cb-kanban__confirm:not(.cb-kanban__confirm--card) [data-confirm-cancel]')?.focus());
  }

  protected cancelColumnDelete(col: CbKanbanColumn): void {
    this.confirmingColumn.set(null);
    this.focusColumnMenu(col);
  }

  protected deleteColumn(col: CbKanbanColumn): void {
    this.confirmingColumn.set(null);
    this.columns.set(this.columns().filter((c) => c.id !== col.id));
    this.columnDelete.emit({ column: col });
    this.announcement.set(cbFormat(this.t().kanbanDeleted, col.title));
  }

  /** Añade una columna al final y abre su nombre para editarlo. */
  addColumn(title = this.t().kanbanNewColumn): void {
    const column: CbKanbanColumn = { id: newId(), title, items: [] };
    this.columns.set([...this.columns(), column]);
    this.columnAdd.emit({ column });
    this.startColumnRename(column);
    this.afterRender(() =>
      this.host.nativeElement.querySelector('.cb-kanban__board')?.scrollTo?.({ left: Number.MAX_SAFE_INTEGER, behavior: 'smooth' }),
    );
  }

  private focusColumnMenu(col: CbKanbanColumn): void {
    this.afterRender(() => this.byData('columnMenu', col.id)?.focus());
  }

  // --- Foco ---------------------------------------------------------------------------
  /** Elemento del tablero con `data-<nombre>` igual a `value` (sin depender de CSS.escape). */
  private byData(name: 'add' | 'columnMenu', value: string): HTMLElement | undefined {
    const attr = name === 'add' ? 'data-add' : 'data-column-menu';
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(`[${attr}]`)).find((el) => el.getAttribute(attr) === value);
  }

  private afterRender(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }

  /** La tarjeta se vuelve a pintar al cambiar: se recupera el foco tras el render. */
  private focusCard(key: unknown): void {
    this.afterRender(() => {
      const cards = this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-kanban__card');
      Array.from(cards).find((c) => c.dataset['key'] === String(key))?.focus();
    });
  }
}
