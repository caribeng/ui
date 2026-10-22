import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { CdkDrag, CdkDropList, CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { cbFormat } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { CbKanbanDetails } from './kanban-details.component';
import { CbKanbanView, type CbKanbanColumn } from './kanban-view';

let nextUid = 0;

/**
 * Vista de lista de las tareas: una tabla con una sección (contraíble) por cada
 * columna del tablero y, por tarea, responsables, fechas y prioridad.
 *
 * Usa el mismo `[(columns)]` que `cb-kanban`, así que ambas vistas se pueden
 * mostrar a la vez sobre los mismos datos. Las filas se arrastran entre
 * secciones (o Alt + ↑/↓ con el teclado); con `editable`, el círculo marca la
 * tarea como finalizada (`completed`); con `addable`, cada sección tiene
 * "Añadir tarea"; con `columnsEditable`, las secciones se renombran y se añaden.
 *
 * @example
 * ```html
 * <cb-kanban-list [(columns)]="columnas" [people]="personas" details editable addable />
 * ```
 */
@Component({
  selector: 'cb-kanban-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, CbIcon, CbKanbanDetails],
  host: { class: 'cb-kanban-list' },
  template: `
    @if (addable() && columns().length) {
      <div class="cb-kanban-list__toolbar">
        <button type="button" class="cb-kanban-list__btn" data-add-top [disabled]="disabled()" (click)="openComposer(columns()[0])">
          <cb-icon name="plus" [size]="16" aria-hidden="true" />
          {{ t().kanbanAddTask }}
        </button>
      </div>
    }
    <div class="cb-kanban-list__scroll">
      <table class="cb-kanban-list__table" cdkDropListGroup [attr.aria-label]="ariaLabel() || null" [attr.aria-describedby]="uid + '-help'">
        <thead>
          <tr>
            <th scope="col" class="cb-kanban-list__col-name">{{ t().kanbanTaskName }}</th>
            <th scope="col" class="cb-kanban-list__col-people">{{ t().kanbanAssignees }}</th>
            <th scope="col" class="cb-kanban-list__col-date">{{ t().kanbanDates }}</th>
            <th scope="col" class="cb-kanban-list__col-priority">{{ t().kanbanPriority }}</th>
          </tr>
        </thead>
        @for (col of columns(); track col.id; let c = $index) {
          <tbody
            class="cb-kanban-list__section"
            [style.--cb-kanban-color]="col.color || null"
            cdkDropList
            [cdkDropListData]="col"
            [cdkDropListDisabled]="!canDrag() || isCollapsed(col)"
            [cdkDropListEnterPredicate]="canEnter"
            (cdkDropListDropped)="onDrop($event)"
          >
            <tr class="cb-kanban-list__section-row">
              <th scope="rowgroup" colspan="4">
                <div class="cb-kanban-list__section-head">
                  @if (renaming() === col.id) {
                    <input
                      class="cb-kanban-list__rename"
                      type="text"
                      [value]="col.title"
                      [attr.aria-label]="t().kanbanColumnName"
                      (keydown.enter)="$event.preventDefault(); rename(col, $any($event.target).value)"
                      (keydown.escape)="$event.preventDefault(); cancelRename(col)"
                      (blur)="rename(col, $any($event.target).value)"
                    />
                  } @else {
                    <button
                      type="button"
                      class="cb-kanban-list__toggle"
                      [attr.data-section]="col.id"
                      [attr.aria-expanded]="!isCollapsed(col)"
                      [attr.aria-label]="fmt(t().kanbanSectionCount, col.title, col.items.length)"
                      (click)="toggleCollapse(col)"
                    >
                      <cb-icon [name]="isCollapsed(col) ? 'chevron-right' : 'chevron-down'" [size]="16" aria-hidden="true" />
                      <span class="cb-kanban-list__section-title">{{ col.title }}</span>
                      <span class="cb-kanban-list__count" [class.cb-kanban-list__count--over]="isOver(col)" aria-hidden="true">
                        {{ col.limit ? fmt(t().kanbanCount, col.items.length, col.limit) : col.items.length }}
                      </span>
                    </button>
                    @if (columnsEditable()) {
                      <button
                        type="button"
                        class="cb-kanban-list__icon-btn"
                        [attr.aria-label]="t().kanbanRename + ': ' + col.title"
                        [disabled]="disabled()"
                        (click)="startRename(col)"
                      >
                        <cb-icon name="pencil" [size]="14" aria-hidden="true" />
                      </button>
                    }
                  }
                </div>
              </th>
            </tr>
            @if (!isCollapsed(col)) {
              @for (item of col.items; track key(item); let i = $index) {
                <tr
                  class="cb-kanban-list__row"
                  cdkDrag
                  [cdkDragData]="item"
                  [cdkDragDisabled]="!canDrag()"
                  [cdkDragStartDelay]="{ touch: 180, mouse: 0 }"
                  cdkDragPreviewClass="cb-kanban-list-preview"
                  [attr.data-key]="keyAttr(item)"
                  [class.cb-kanban-list__row--completed]="isCompleted(item)"
                  (click)="openCard(item)"
                >
                  <td class="cb-kanban-list__name-cell">
                    <div class="cb-kanban-list__name-wrap">
                      @if (editable()) {
                        <button
                          type="button"
                          class="cb-kanban-list__check"
                          [attr.aria-pressed]="isCompleted(item)"
                          [attr.aria-label]="fmt(isCompleted(item) ? t().kanbanMarkIncomplete : t().kanbanMarkComplete, label(item))"
                          [disabled]="disabled()"
                          (mousedown)="$event.stopPropagation()"
                          (click)="$event.stopPropagation(); toggleCompleted(item)"
                        >
                          <cb-icon [name]="isCompleted(item) ? 'circle-check' : 'circle'" [size]="18" aria-hidden="true" />
                        </button>
                      } @else if (isCompleted(item)) {
                        <span class="cb-kanban-list__check cb-kanban-list__check--static">
                          <cb-icon name="circle-check" [size]="18" aria-hidden="true" />
                          <span class="cb-kanban-list__sr">{{ t().kanbanCompleted }}</span>
                        </span>
                      }
                      <button
                        type="button"
                        class="cb-kanban-list__name"
                        [attr.aria-haspopup]="details() ? 'dialog' : null"
                        (click)="$event.stopPropagation(); openCard(item)"
                        (keydown)="onRowKeydown($event, c, i)"
                      >
                        {{ label(item) }}
                      </button>
                    </div>
                  </td>
                  <td class="cb-kanban-list__people">
                    @if (peopleOf(item); as people) {
                      @if (people.length) {
                        <span class="cb-kanban-list__person">
                          <span class="cb-kanban-list__avatar" aria-hidden="true">
                            @if (people[0].image) {
                              <img [src]="people[0].image" alt="" />
                            } @else {
                              {{ initialsOf(people[0].name) }}
                            }
                          </span>
                          <span class="cb-kanban-list__person-name" [attr.title]="names(people)">{{ people[0].name }}</span>
                          @if (people.length > 1) {
                            <span class="cb-kanban-list__more" aria-hidden="true">+{{ people.length - 1 }}</span>
                            <span class="cb-kanban-list__sr">{{ fmt(t().kanbanAssignedTo, names(people)) }}</span>
                          }
                        </span>
                      } @else {
                        <span class="cb-kanban-list__placeholder" aria-hidden="true"><cb-icon name="user" [size]="14" /></span>
                        <span class="cb-kanban-list__sr">{{ t().kanbanNoAssignees }}</span>
                      }
                    }
                  </td>
                  <td class="cb-kanban-list__date-cell">
                    @if (dateLabel(item); as d) {
                      <span class="cb-kanban-list__date" [class.cb-kanban-list__date--overdue]="isOverdue(item)">
                        {{ d }}
                        @if (isOverdue(item)) {
                          <span class="cb-kanban-list__sr"> ({{ t().kanbanOverdue }})</span>
                        }
                      </span>
                    } @else {
                      <span class="cb-kanban-list__placeholder" aria-hidden="true"><cb-icon name="calendar" [size]="14" /></span>
                    }
                  </td>
                  <td>
                    @if (priorityOf(item); as p) {
                      <span class="cb-kanban-list__priority" [attr.data-severity]="p.severity || 'secondary'">{{ p.label }}</span>
                    }
                  </td>
                </tr>
              }
              @if (!col.items.length && !addable()) {
                <tr class="cb-kanban-list__empty">
                  <td colspan="4">{{ emptyMessage() ?? t().noData }}</td>
                </tr>
              }
              @if (addable()) {
                <tr class="cb-kanban-list__add-row">
                  <td colspan="4">
                    @if (composing() === col.id) {
                      <input
                        #composer
                        class="cb-kanban-list__composer"
                        type="text"
                        [attr.aria-label]="t().kanbanCardTitle"
                        [placeholder]="t().kanbanCardTitle"
                        (keydown)="onComposerKeydown($event, col, composer)"
                        (blur)="!composer.value.trim() && closeComposer(col, false)"
                      />
                    } @else {
                      <button
                        type="button"
                        class="cb-kanban-list__add"
                        [attr.data-add]="col.id"
                        [disabled]="disabled() || (enforceLimit() && isFull(col))"
                        (click)="openComposer(col)"
                      >
                        {{ t().kanbanAddTask }}
                      </button>
                    }
                  </td>
                </tr>
              }
            }
          </tbody>
        }
      </table>
    </div>
    @if (columnsEditable()) {
      <button type="button" class="cb-kanban-list__add-section" [disabled]="disabled()" (click)="addSection()">
        <cb-icon name="plus" [size]="16" aria-hidden="true" />
        {{ t().kanbanAddSection }}
      </button>
    }
    <p class="cb-kanban-list__sr" [id]="uid + '-help'">{{ t().kanbanListInstructions }}</p>
    <div class="cb-kanban-list__sr" role="status">{{ announcement() }}</div>
    @if (details()) {
      <cb-kanban-details [view]="this" />
    }
  `,
  styleUrl: './kanban-list.component.css',
})
export class CbKanbanList extends CbKanbanView {
  protected readonly uid = `cb-kanban-list-${++nextUid}`;
  protected readonly composing = signal<string | null>(null);
  protected readonly renaming = signal<string | null>(null);
  private readonly collapsed = signal<ReadonlySet<string>>(new Set());
  /** Al renombrar con Enter, el blur posterior no vuelve a guardar. */
  private renameDone = false;

  protected canDrag(): boolean {
    return this.editable() && !this.disabled();
  }

  protected isCollapsed(col: CbKanbanColumn): boolean {
    return this.collapsed().has(col.id);
  }

  protected toggleCollapse(col: CbKanbanColumn): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      if (next.has(col.id)) next.delete(col.id);
      else next.add(col.id);
      return next;
    });
  }

  protected toggleCompleted(item: unknown): void {
    this.updateTask(item, { completed: !this.isCompleted(item) });
  }

  // --- Mover filas -----------------------------------------------------------------
  protected readonly canEnter = (drag: CdkDrag, drop: CdkDropList<CbKanbanColumn>): boolean =>
    !this.enforceLimit() || drag.dropContainer === drop || !this.isFull(drop.data);

  protected onDrop(event: CdkDragDrop<CbKanbanColumn>): void {
    const columns = this.columns();
    const from = columns.indexOf(event.previousContainer.data);
    const to = columns.indexOf(event.container.data);
    if (from < 0 || to < 0 || (from === to && event.previousIndex === event.currentIndex)) return;
    this.moveCard(from, event.previousIndex, to, event.currentIndex);
  }

  /** Alt + ↑/↓ mueve la fila (al llegar al borde, pasa a la sección vecina abierta). */
  protected onRowKeydown(event: KeyboardEvent, column: number, index: number): void {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || !this.canDrag()) return;
    event.preventDefault();
    const columns = this.columns();
    const down = event.key === 'ArrowDown';
    const toIndex = index + (down ? 1 : -1);
    if (toIndex >= 0 && toIndex < columns[column].items.length) {
      this.moveCard(column, index, column, toIndex, true);
      return;
    }
    let target = column + (down ? 1 : -1);
    while (target >= 0 && target < columns.length && (this.isCollapsed(columns[target]) || (this.enforceLimit() && this.isFull(columns[target])))) {
      target += down ? 1 : -1;
    }
    if (target < 0 || target >= columns.length) return;
    this.moveCard(column, index, target, down ? 0 : columns[target].items.length, true);
  }

  // --- Añadir ------------------------------------------------------------------------
  protected openComposer(col: CbKanbanColumn): void {
    if (this.isCollapsed(col)) this.toggleCollapse(col);
    this.composing.set(col.id);
    this.afterRender(() => this.host.nativeElement.querySelector<HTMLInputElement>('.cb-kanban-list__composer')?.focus());
  }

  protected closeComposer(col: CbKanbanColumn, focus = true): void {
    this.composing.set(null);
    if (focus) this.afterRender(() => this.byData('data-add', col.id)?.focus());
  }

  protected onComposerKeydown(event: KeyboardEvent, col: CbKanbanColumn, field: HTMLInputElement): void {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      const title = field.value.trim();
      if (!title) return;
      const current = this.columns().find((c) => c.id === col.id) ?? col;
      if (this.enforceLimit() && this.isFull(current)) {
        this.announcement.set(cbFormat(this.t().kanbanFull, col.title));
        return;
      }
      this.addCard(col.id, title);
      // El campo sigue abierto para añadir varias seguidas.
      field.value = '';
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeComposer(col);
    }
  }

  // --- Secciones -----------------------------------------------------------------
  /** Añade una sección al final y abre su nombre para editarlo. */
  addSection(title = this.t().kanbanNewColumn): void {
    this.startRename(this.appendColumn(title));
  }

  protected startRename(col: CbKanbanColumn): void {
    this.renameDone = false;
    this.renaming.set(col.id);
    this.afterRender(() => {
      const field = this.host.nativeElement.querySelector<HTMLInputElement>('.cb-kanban-list__rename');
      field?.focus();
      field?.select();
    });
  }

  protected rename(col: CbKanbanColumn, value: string): void {
    if (this.renameDone || this.renaming() !== col.id) return;
    this.renameDone = true;
    this.renaming.set(null);
    const title = value.trim();
    if (title && title !== col.title) this.renameColumnTo(col, title);
    this.focusSection(col.id);
  }

  protected cancelRename(col: CbKanbanColumn): void {
    this.renameDone = true;
    this.renaming.set(null);
    this.focusSection(col.id);
  }

  // --- Foco ------------------------------------------------------------------------
  protected override focusItem(key: unknown): void {
    this.afterRender(() => this.rowOf(key)?.querySelector<HTMLElement>('.cb-kanban-list__name')?.focus());
  }

  protected override afterDelete(next: readonly CbKanbanColumn[], column: number, index: number): void {
    const neighbour = next[column].items[index] ?? next[column].items[index - 1];
    if (neighbour !== undefined) this.focusItem(this.key(neighbour));
    else this.focusSection(next[column].id);
  }

  private focusSection(id: string): void {
    this.afterRender(() => this.byData('data-section', id)?.focus());
  }

  private rowOf(key: unknown): HTMLElement | undefined {
    return this.byData('data-key', String(key));
  }

  /** Elemento con `name` igual a `value` (sin depender de CSS.escape). */
  private byData(name: 'data-add' | 'data-section' | 'data-key', value: string): HTMLElement | undefined {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(`[${name}]`)).find((el) => el.getAttribute(name) === value);
  }
}
