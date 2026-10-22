import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { CbDrawer } from '@caribeng/ui/drawer';
import { CbKanbanTaskPanel } from './kanban-task-panel.component';
import type { CbKanbanView } from './kanban-view';

/**
 * Panel lateral con el detalle de la tarea, común a todas las vistas.
 * @internal
 */
@Component({
  selector: 'cb-kanban-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CbDrawer, CbKanbanTaskPanel],
  template: `
    @let v = view();
    <cb-drawer
      [visible]="v.detailOpen()"
      (visibleChange)="!$event && v.closeDetails()"
      [header]="v.t().kanbanDetails"
      size="34rem"
      (onHide)="v.onDetailsHidden()"
    >
      @if (v.detailTask(); as task) {
        <cb-kanban-task-panel
          [task]="task"
          [itemLabel]="v.itemLabel()"
          [columns]="v.columns()"
          [columnId]="v.detailColumnId()"
          [people]="v.people()"
          [priorities]="v.resolvedPriorities()"
          [editable]="v.editable() && !v.disabled()"
          [accept]="v.accept()"
          [confirmDelete]="v.confirmDelete()"
          (patch)="v.updateTask(task, $event)"
          (move)="v.moveTask(task, $event)"
          (remove)="v.removeFromDetails(task)"
        />
      }
    </cb-drawer>
  `,
})
export class CbKanbanDetails {
  readonly view = input.required<CbKanbanView>();
}
