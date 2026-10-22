/*
 * Public API Surface de @caribeng/ui/kanban
 */
export { CbKanban, CbKanbanCardDirective, type CbKanbanCardContext } from './lib/kanban.component';
export { CbKanbanCalendar } from './lib/kanban-calendar.component';
export { CbKanbanDashboard, type CbKanbanDashboardWidget } from './lib/kanban-dashboard.component';
export { CbKanbanList } from './lib/kanban-list.component';
export { CbKanbanTimeline } from './lib/kanban-timeline.component';
export {
  CbKanbanView,
  type CbKanbanCardEvent,
  type CbKanbanColumn,
  type CbKanbanColumnEvent,
  type CbKanbanMove,
} from './lib/kanban-view';
export { CbKanbanTaskPanel } from './lib/kanban-task-panel.component';
export { CbKanbanWorkspace, type CbKanbanViewType } from './lib/kanban-workspace.component';
export type { CbKanbanAttachment, CbKanbanPerson, CbKanbanPriority, CbKanbanTask, CbKanbanTaskPatch } from './lib/kanban-task';
