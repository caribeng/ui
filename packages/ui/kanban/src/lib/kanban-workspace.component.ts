import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbKanbanCalendar } from './kanban-calendar.component';
import { CbKanbanDashboard } from './kanban-dashboard.component';
import { CbKanbanList } from './kanban-list.component';
import { CbKanbanTimeline } from './kanban-timeline.component';
import { CbKanban } from './kanban.component';
import { CbKanbanView } from './kanban-view';

/** Vistas del espacio de trabajo. */
export type CbKanbanViewType = 'list' | 'board' | 'timeline' | 'dashboard' | 'calendar';

const ALL_VIEWS: readonly CbKanbanViewType[] = ['list', 'board', 'timeline', 'dashboard', 'calendar'];

let nextUid = 0;

/**
 * Espacio de trabajo con las vistas de las tareas (lista, tablero, cronograma,
 * panel y calendario) sobre un mismo `[(columns)]`. Los botones de arriba
 * encienden y apagan cada vista y se pueden ver varias a la vez (`[(views)]` es
 * una lista), una debajo de otra o lado a lado (`[(sideBySide)]`); con
 * `multiple = false` se comportan como pestañas (una sola vista).
 *
 * Recibe las mismas opciones que cada vista (`details`, `editable`, `addable`,
 * `people`…) y reemite sus eventos (`cardMove`, `cardEdit`…).
 *
 * @example
 * ```html
 * <cb-kanban-workspace [(columns)]="columnas" [(views)]="vistas" [people]="personas" details editable addable />
 * ```
 */
@Component({
  selector: 'cb-kanban-workspace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbKanban, CbKanbanCalendar, CbKanbanDashboard, CbKanbanList, CbKanbanTimeline],
  host: { class: 'cb-kanban-workspace' },
  template: `
    <div class="cb-kanban-workspace__bar">
      <div
        class="cb-kanban-workspace__tabs"
        role="group"
        [attr.aria-label]="ariaLabel() || t().kanbanViews"
        [attr.aria-describedby]="multiple() ? uid + '-hint' : null"
      >
        @for (v of available(); track v) {
          <button
            type="button"
            class="cb-kanban-workspace__tab"
            [class.cb-kanban-workspace__tab--on]="isOn(v)"
            [attr.data-view]="v"
            [attr.aria-pressed]="isOn(v)"
            (click)="toggleView(v)"
          >
            {{ viewName(v) }}
          </button>
        }
      </div>
      @if (multiple() && shown().length > 1) {
        <button
          type="button"
          class="cb-kanban-workspace__layout"
          [class.cb-kanban-workspace__tab--on]="sideBySide()"
          [attr.aria-pressed]="sideBySide()"
          (click)="sideBySide.set(!sideBySide())"
        >
          {{ t().kanbanSideBySide }}
        </button>
      }
      @if (multiple()) {
        <span class="cb-kanban-workspace__sr" [id]="uid + '-hint'">{{ t().kanbanViewsHint }}</span>
      }
    </div>

    <div
      class="cb-kanban-workspace__panes"
      [class.cb-kanban-workspace__panes--side]="sideBySide() && shown().length > 1"
      [style.--cb-kanban-workspace-panes]="shown().length"
    >
      @for (v of shown(); track v) {
        <section
          class="cb-kanban-workspace__pane"
          [attr.data-pane]="v"
          [attr.aria-labelledby]="shown().length > 1 ? uid + '-' + v : null"
          [attr.aria-label]="shown().length > 1 ? null : viewName(v)"
        >
          @if (shown().length > 1) {
            <div class="cb-kanban-workspace__pane-head">
              <span class="cb-kanban-workspace__pane-title" role="heading" [attr.aria-level]="headingLevel()" [id]="uid + '-' + v">{{ viewName(v) }}</span>
              <button
                type="button"
                class="cb-kanban-workspace__hide"
                [attr.aria-label]="fmt(t().kanbanHideView, viewName(v))"
                (click)="toggleView(v)"
              >
                <cb-icon name="x" [size]="16" aria-hidden="true" />
              </button>
            </div>
          }
          @switch (v) {
            @case ('board') {
              <cb-kanban
                [(columns)]="columns"
                [itemKey]="itemKey()"
                [itemLabel]="itemLabel()"
                [enforceLimit]="enforceLimit()"
                [editable]="editable()"
                [addable]="addable()"
                [columnsEditable]="columnsEditable()"
                [collapsible]="collapsible()"
                [confirmDelete]="confirmDelete()"
                [createCard]="createCard()"
                [disabled]="disabled()"
                [emptyMessage]="emptyMessage()"
                [details]="details()"
                [people]="people()"
                [priorities]="priorities()"
                [accept]="accept()"
                [ariaLabel]="viewName(v)"
                (cardMove)="cardMove.emit($event)"
                (cardOpen)="cardOpen.emit($event)"
                (cardAdd)="cardAdd.emit($event)"
                (cardEdit)="cardEdit.emit($event)"
                (cardDelete)="cardDelete.emit($event)"
                (columnAdd)="columnAdd.emit($event)"
                (columnRename)="columnRename.emit($event)"
                (columnDelete)="columnDelete.emit($event)"
              />
            }
            @case ('list') {
              <cb-kanban-list
                [(columns)]="columns"
                [itemKey]="itemKey()"
                [itemLabel]="itemLabel()"
                [enforceLimit]="enforceLimit()"
                [editable]="editable()"
                [addable]="addable()"
                [columnsEditable]="columnsEditable()"
                [confirmDelete]="confirmDelete()"
                [createCard]="createCard()"
                [disabled]="disabled()"
                [emptyMessage]="emptyMessage()"
                [details]="details()"
                [people]="people()"
                [priorities]="priorities()"
                [accept]="accept()"
                [ariaLabel]="viewName(v)"
                (cardMove)="cardMove.emit($event)"
                (cardOpen)="cardOpen.emit($event)"
                (cardAdd)="cardAdd.emit($event)"
                (cardEdit)="cardEdit.emit($event)"
                (cardDelete)="cardDelete.emit($event)"
                (columnAdd)="columnAdd.emit($event)"
                (columnRename)="columnRename.emit($event)"
                (columnDelete)="columnDelete.emit($event)"
              />
            }
            @case ('timeline') {
              <cb-kanban-timeline
                [(columns)]="columns"
                [itemKey]="itemKey()"
                [itemLabel]="itemLabel()"
                [enforceLimit]="enforceLimit()"
                [editable]="editable()"
                [addable]="addable()"
                [columnsEditable]="columnsEditable()"
                [createCard]="createCard()"
                [disabled]="disabled()"
                [details]="details()"
                [people]="people()"
                [priorities]="priorities()"
                [accept]="accept()"
                [ariaLabel]="viewName(v)"
                (cardMove)="cardMove.emit($event)"
                (cardOpen)="cardOpen.emit($event)"
                (cardAdd)="cardAdd.emit($event)"
                (cardEdit)="cardEdit.emit($event)"
                (cardDelete)="cardDelete.emit($event)"
                (columnAdd)="columnAdd.emit($event)"
              />
            }
            @case ('dashboard') {
              <cb-kanban-dashboard
                [columns]="columns()"
                [itemKey]="itemKey()"
                [itemLabel]="itemLabel()"
                [people]="people()"
                [priorities]="priorities()"
                [ariaLabel]="viewName(v)"
                [headingLevel]="headingLevel() + 1"
              />
            }
            @case ('calendar') {
              <cb-kanban-calendar
                [(columns)]="columns"
                [itemKey]="itemKey()"
                [itemLabel]="itemLabel()"
                [enforceLimit]="enforceLimit()"
                [editable]="editable()"
                [addable]="addable()"
                [createCard]="createCard()"
                [disabled]="disabled()"
                [details]="details()"
                [people]="people()"
                [priorities]="priorities()"
                [accept]="accept()"
                [ariaLabel]="viewName(v)"
                (cardOpen)="cardOpen.emit($event)"
                (cardAdd)="cardAdd.emit($event)"
                (cardEdit)="cardEdit.emit($event)"
                (cardDelete)="cardDelete.emit($event)"
              />
            }
          }
        </section>
      }
    </div>
  `,
  styleUrl: './kanban-workspace.component.css',
})
export class CbKanbanWorkspace extends CbKanbanView {
  protected readonly uid = `cb-kanban-workspace-${++nextUid}`;

  /** Vistas visibles (bidireccional). Varias a la vez si `multiple`. */
  readonly views = model<readonly CbKanbanViewType[]>(['board']);
  /** Vistas que se ofrecen arriba, en este orden. */
  readonly available = input<readonly CbKanbanViewType[]>(ALL_VIEWS);
  /** Se pueden ver varias vistas a la vez. Con `false`, los botones son pestañas. */
  readonly multiple = input(true, { transform: booleanAttribute });
  /** Con varias vistas, las pone lado a lado en lugar de una debajo de otra (bidireccional). */
  readonly sideBySide = model<boolean>(false);
  /** Nivel de encabezado del título de cada vista (con varias a la vez). */
  readonly headingLevel = input<number>(2);

  /** Vistas a pintar, en el orden de `available`. Siempre hay al menos una. */
  protected readonly shown = computed<CbKanbanViewType[]>(() => {
    const available = this.available().filter((v) => ALL_VIEWS.includes(v));
    const on = this.views();
    const shown = available.filter((v) => on.includes(v));
    const one = this.multiple() ? shown : shown.slice(0, 1);
    return one.length ? one : available.slice(0, 1);
  });

  protected isOn(view: CbKanbanViewType): boolean {
    return this.shown().includes(view);
  }

  protected viewName(view: CbKanbanViewType): string {
    const t = this.t();
    return {
      list: t.kanbanViewList,
      board: t.kanbanViewBoard,
      timeline: t.kanbanViewTimeline,
      dashboard: t.kanbanViewDashboard,
      calendar: t.kanbanViewCalendar,
    }[view];
  }

  /** Enciende o apaga una vista (con `multiple = false`, la elige). La última no se apaga. */
  toggleView(view: CbKanbanViewType): void {
    const shown = this.shown();
    if (!this.multiple()) {
      this.views.set([view]);
      return;
    }
    if (shown.includes(view)) {
      if (shown.length > 1) {
        this.views.set(shown.filter((v) => v !== view));
        this.afterRender(() => this.host.nativeElement.querySelector<HTMLElement>(`.cb-kanban-workspace__tab[data-view="${view}"]`)?.focus());
      }
      return;
    }
    this.views.set(this.available().filter((v) => v === view || shown.includes(v)));
  }

  /** Cada vista enfoca sus propias tareas. */
  protected override focusItem(): void {
    // Nada que enfocar aquí.
  }
}
