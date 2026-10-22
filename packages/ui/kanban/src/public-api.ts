/*
 * Public API Surface de @caribeng/ui/kanban
 */
export {
  CbKanban,
  CbKanbanCardDirective,
  type CbKanbanCardContext,
  type CbKanbanCardEvent,
  type CbKanbanColumn,
  type CbKanbanColumnEvent,
  type CbKanbanMove,
} from './lib/kanban.component';
export { CbKanbanTaskPanel } from './lib/kanban-task-panel.component';
export type { CbKanbanAttachment, CbKanbanPerson, CbKanbanPriority, CbKanbanTask, CbKanbanTaskPatch } from './lib/kanban-task';
