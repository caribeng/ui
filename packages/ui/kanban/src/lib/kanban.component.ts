import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CdkDrag, CdkDragPlaceholder, CdkDropList, CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { cbFormat } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { CbKanbanDetails } from './kanban-details.component';
import { CbKanbanView, type CbKanbanColumn } from './kanban-view';

export type { CbKanbanCardEvent, CbKanbanColumn, CbKanbanColumnEvent, CbKanbanMove } from './kanban-view';

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
  imports: [NgTemplateOutlet, CdkScrollable, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPlaceholder, CbIcon, CbKanbanDetails, CbMenu],
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
      <cb-kanban-details [view]="this" />
    }

    <ng-template #defaultCard let-item>
      <span class="cb-kanban__card-title" [class.cb-kanban__card-title--completed]="isCompleted(item)">
        @if (isCompleted(item)) {
          <cb-icon name="circle-check" [size]="14" aria-hidden="true" /><span class="cb-kanban__sr">{{ t().kanbanCompleted }}: </span>
        }
        {{ label(item) }}
      </span>
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
export class CbKanban extends CbKanbanView {
  private readonly menu = viewChild.required<CbMenu>('menu');
  protected readonly uid = `cb-kanban-${++nextUid}`;
  protected readonly cardTpl = contentChild(CbKanbanCardDirective);

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

  protected hasMeta(item: unknown): boolean {
    return !!(this.priorityOf(item) || this.dateLabel(item) || this.attachmentCount(item) || this.peopleOf(item).length);
  }

  protected isGrabbed(item: unknown): boolean {
    const grab = this.grab();
    return !!grab && grab.key === this.key(item);
  }

  protected isCollapsed(col: CbKanbanColumn): boolean {
    return this.collapsed().has(col.id);
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

  protected override afterDelete(next: readonly CbKanbanColumn[], column: number, index: number): void {
    this.confirmingKey.set(undefined);
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
    this.renameColumnTo(col, title);
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
    this.removeColumn(col);
  }

  /** Añade una columna al final y abre su nombre para editarlo. */
  addColumn(title = this.t().kanbanNewColumn): void {
    this.startColumnRename(this.appendColumn(title));
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

  protected override focusItem(key: unknown): void {
    this.focusCard(key);
  }

  /** La tarjeta se vuelve a pintar al cambiar: se recupera el foco tras el render. */
  private focusCard(key: unknown): void {
    this.afterRender(() => {
      const cards = this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-kanban__card');
      Array.from(cards).find((c) => c.dataset['key'] === String(key))?.focus();
    });
  }
}
