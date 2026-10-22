import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CbKanban,
  CbKanbanCalendar,
  CbKanbanCardDirective,
  CbKanbanDashboard,
  CbKanbanList,
  CbKanbanTimeline,
  type CbKanbanColumn,
  type CbKanbanMove,
  type CbKanbanPerson,
  type CbKanbanTask,
} from '@caribeng/ui/kanban';
import { CbTag } from '@caribeng/ui/tag';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Story {
  id: number;
  title: string;
  owner: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

/** Fecha `'AAAA-MM-DD'` a `offset` días de hoy (la demo siempre tiene tareas en curso y una vencida). */
function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'doc-kanban-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbKanban, CbKanbanCalendar, CbKanbanCardDirective, CbKanbanDashboard, CbKanbanList, CbKanbanTimeline, CbTag, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="Kanban"
      lead="Tablero de columnas con tarjetas que se reordenan y se mueven entre columnas arrastrando (ratón o dedo) o con el teclado, y vistas de lista, cronograma, calendario y panel de resumen sobre los mismos datos. Cada tarea se abre en un panel con responsables, prioridad, fechas de inicio y fin, descripción y adjuntos; también se crean, editan y eliminan tarjetas y columnas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="board"
      title="Tablero completo"
      description="Haz clic (o Enter) en una tarjeta para abrir su detalle: cambia la columna, asigna personas, elige la prioridad, pon fecha de inicio y de fin, escribe la descripción y adjunta archivos (botón o arrastrándolos). Cada cambio se aplica al momento, actualiza [(columns)] y emite cardEdit. Arrastra tarjetas a cualquier punto de otra columna; el menú ⋮ edita, mueve o elimina (F2 y Supr con el teclado); las columnas se renombran, se contraen, se eliminan y se añaden. En curso tiene límite de 3 (enforceLimit)."
      [code]="boardCode"
    >
      <div class="kb-demo">
        <cb-kanban
          [(columns)]="columns"
          details
          editable
          addable
          columnsEditable
          collapsible
          enforceLimit
          ariaLabel="Sprint 14"
          [people]="people"
          [createCard]="createTask"
          (cardMove)="onMove($event)"
          (cardAdd)="log('Añadida', $event.item.title)"
          (cardEdit)="log('Editada', $event.item.title)"
          (cardDelete)="log('Eliminada', $event.item.title)"
          (columnAdd)="log('Columna añadida', $event.column.title)"
          (columnRename)="log('Columna renombrada', $event.column.title)"
          (columnDelete)="log('Columna eliminada', $event.column.title)"
        />
        <p class="kb-log">Último cambio: {{ last() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="list"
      title="Vista de lista"
      description="cb-kanban-list muestra las mismas tareas como una tabla con una sección (contraíble) por columna, con responsables, fechas y prioridad. Usa el mismo [(columns)] que el tablero de arriba, así que las dos vistas se pueden mostrar a la vez y lo que cambies en una se ve en la otra. El círculo marca la tarea como finalizada (completed); las filas se arrastran entre secciones o se mueven con Alt + ↑/↓; Añadir tarea y Añadir sección crean tareas y secciones."
      [code]="listCode"
    >
      <cb-kanban-list
        [(columns)]="columns"
        details
        editable
        addable
        columnsEditable
        enforceLimit
        ariaLabel="Sprint 14 en lista"
        [people]="people"
        [createCard]="createTask"
        (cardMove)="onMove($event)"
        (cardEdit)="log('Editada', $event.item.title)"
      />
    </doc-section>

    <doc-section
      id="timeline"
      title="Cronograma"
      description="cb-kanban-timeline es un diagrama de Gantt: una fila por sección y cada tarea como una barra de su inicio a su fin, con la línea de hoy. Arrastra la barra para cambiar sus fechas (o a otra sección), o sus bordes para cambiar la duración; con el teclado, Alt + ←→ la mueve un día, Alt + Mayús + ←→ cambia el fin y Alt + ↑↓ la pasa de sección. ‹ › avanzan una semana, − + cambian el ancho de los días ([(zoom)]) y Sin fecha lista las tareas sin fechas. Comparte [(columns)] con las vistas de arriba."
      [code]="timelineCode"
    >
      <cb-kanban-timeline
        [(columns)]="columns"
        details
        editable
        addable
        columnsEditable
        enforceLimit
        ariaLabel="Sprint 14 en cronograma"
        [people]="people"
        [createCard]="createTask"
        (cardMove)="onMove($event)"
        (cardEdit)="log('Editada', $event.item.title)"
        (cardAdd)="log('Añadida', $event.item.title)"
      />
    </doc-section>

    <doc-section
      id="calendar"
      title="Vista de calendario"
      description="cb-kanban-calendar pinta el mes con cada tarea como una barra desde su fecha de inicio hasta la de fin, del color de su columna. Arrastra una barra a otro día (o Alt + flechas: ←→ un día, ↑↓ una semana) para cambiar sus fechas; Añadir tarea en un día la crea con esa fecha. Sin fecha lista las tareas que aún no tienen. Comparte [(columns)] con el tablero y la lista de arriba."
      [code]="calendarCode"
    >
      <cb-kanban-calendar
        [(columns)]="columns"
        details
        editable
        addable
        ariaLabel="Sprint 14 en calendario"
        [people]="people"
        [createCard]="createTask"
        (cardEdit)="log('Editada', $event.item.title)"
        (cardAdd)="log('Añadida', $event.item.title)"
      />
    </doc-section>

    <doc-section
      id="dashboard"
      title="Panel de resumen"
      description="cb-kanban-dashboard resume las mismas tareas: finalizadas (completed), sin finalizar, con retraso (fecha de fin pasada sin finalizar) y total, y gráficos de las tareas sin finalizar por sección y por responsable, por estado y de entregas por semana. Se recalcula al momento: marca una tarea como finalizada en la lista o muévela en el cronograma y el panel cambia. widgets elige qué bloques se ven y en qué orden."
      [code]="dashboardCode"
    >
      <cb-kanban-dashboard [columns]="columns()" [people]="people" />
    </doc-section>

    <doc-section
      id="template"
      title="Tarjeta personalizada"
      description="Con una plantilla cbKanbanCard pintas la tarjeta a tu manera; recibe la tarjeta, su columna y su posición."
      [code]="templateCode"
    >
      <cb-kanban [(columns)]="stories" ariaLabel="Historias">
        <ng-template cbKanbanCard let-story>
          <span class="kb-title">{{ story.title }}</span>
          <span class="kb-meta">
            <cb-tag [value]="story.priority" [severity]="story.priority === 'Alta' ? 'danger' : story.priority === 'Media' ? 'warning' : 'secondary'" />
            <span class="kb-owner" aria-hidden="true">{{ initials(story.owner) }}</span>
            <span class="cb-sr-only">Responsable: {{ story.owner }}</span>
          </span>
        </ng-template>
      </cb-kanban>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .kb-demo {
        display: grid;
        gap: 0.75rem;
        width: 100%;
      }
      .kb-title {
        font-weight: 500;
      }
      .kb-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.375rem;
      }
      .kb-owner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        background: var(--cb-color-surface-hover);
        font-size: 0.65rem;
        font-weight: 600;
      }
      .kb-log {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class KanbanDocComponent {
  protected readonly docApi = DOC_API['cb-kanban'];
  protected readonly a11y = DOC_A11Y['cb-kanban'];
  private nextId = 10;

  protected readonly people: CbKanbanPerson[] = [
    { id: 'laura', name: 'Laura Gómez' },
    { id: 'andres', name: 'Andrés Pérez' },
    { id: 'camila', name: 'Camila Díaz' },
    { id: 'mateo', name: 'Mateo Ruiz' },
  ];

  protected readonly columns = signal<readonly CbKanbanColumn<CbKanbanTask>[]>([
    {
      id: 'todo',
      title: 'Por hacer',
      color: '#94a3b8',
      items: [
        {
          id: 1,
          title: 'Diseñar pantalla de transferencias',
          description: 'Flujo de origen, destino, monto y confirmación con OTP.',
          assignees: ['laura', 'camila'],
          priority: 'high',
          startDate: day(1),
          endDate: day(6),
          attachments: [{ id: 'a1', name: 'boceto-transferencias.pdf', size: 482_000, type: 'application/pdf' }],
        },
        { id: 2, title: 'Validar números de teléfono', assignees: ['andres'], priority: 'medium', endDate: day(9) },
        { id: 3, title: 'Textos en inglés', priority: 'low' },
      ],
    },
    {
      id: 'doing',
      title: 'En curso',
      color: '#3b82f6',
      limit: 3,
      items: [
        { id: 4, title: 'Login con OTP', assignees: ['mateo'], priority: 'high', startDate: day(-4), endDate: day(-1) },
        { id: 5, title: 'Extracto en PDF', assignees: ['laura'], priority: 'medium', startDate: day(-2), endDate: day(3) },
      ],
    },
    {
      id: 'review',
      title: 'En revisión',
      color: '#f59e0b',
      items: [{ id: 6, title: 'Revisión de accesibilidad', assignees: ['andres'], priority: 'high', startDate: day(-6), endDate: day(-3) }],
    },
    {
      id: 'done',
      title: 'Hecho',
      color: '#10b981',
      items: [{ id: 7, title: 'Diseño del onboarding', assignees: ['camila'], priority: 'medium', startDate: day(-12), endDate: day(-7), completed: true }],
    },
  ]);
  protected readonly last = signal('—');

  protected readonly stories = signal<readonly CbKanbanColumn<Story>[]>([
    {
      id: 'backlog',
      title: 'Pendientes',
      items: [
        { id: 1, title: 'Pagos programados', owner: 'Laura Gómez', priority: 'Alta' },
        { id: 2, title: 'Modo oscuro', owner: 'Camila Díaz', priority: 'Baja' },
      ],
    },
    { id: 'sprint', title: 'En el sprint', items: [{ id: 3, title: 'Alertas de saldo', owner: 'Mateo Ruiz', priority: 'Media' }] },
  ]);

  protected initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2);
  }

  protected onMove(move: CbKanbanMove<CbKanbanTask>): void {
    const to = this.columns().find((c) => c.id === move.to)?.title;
    this.last.set(`«${move.item.title}» → ${to} (posición ${move.toIndex + 1})`);
  }

  protected log(action: string, name: string): void {
    this.last.set(`${action}: «${name}»`);
  }

  /** Las tarjetas nuevas nacen sin responsable y con prioridad baja. */
  protected readonly createTask = (title: string): CbKanbanTask => ({ id: this.nextId++, title, priority: 'low' });

  protected readonly importCode = `import { CbKanban, CbKanbanCalendar, CbKanbanCardDirective, CbKanbanDashboard, CbKanbanList, CbKanbanTimeline, type CbKanbanColumn, type CbKanbanPerson, type CbKanbanTask } from '@caribeng/ui/kanban';`;
  protected readonly boardCode = `<div class="kb-demo">
  <cb-kanban
    [(columns)]="columns"
    details
    editable
    addable
    columnsEditable
    collapsible
    enforceLimit
    ariaLabel="Sprint 14"
    [people]="people"
    [createCard]="createTask"
    (cardMove)="onMove($event)"
    (cardAdd)="log('Añadida', $event.item.title)"
    (cardEdit)="log('Editada', $event.item.title)"
    (cardDelete)="log('Eliminada', $event.item.title)"
    (columnAdd)="log('Columna añadida', $event.column.title)"
    (columnRename)="log('Columna renombrada', $event.column.title)"
    (columnDelete)="log('Columna eliminada', $event.column.title)"
  />
  <p class="kb-log">Último cambio: {{ last() }}</p>
</div>`;
  protected readonly listCode = `<cb-kanban-list
  [(columns)]="columns"
  details
  editable
  addable
  columnsEditable
  enforceLimit
  ariaLabel="Sprint 14 en lista"
  [people]="people"
  [createCard]="createTask"
  (cardMove)="onMove($event)"
  (cardEdit)="log('Editada', $event.item.title)"
/>

<!-- El tablero y la lista comparten la misma señal: se pueden mostrar a la vez. -->
<cb-kanban [(columns)]="columns" details editable [people]="people" />`;
  protected readonly timelineCode = `<cb-kanban-timeline
  [(columns)]="columns"
  details
  editable
  addable
  columnsEditable
  enforceLimit
  ariaLabel="Sprint 14 en cronograma"
  [people]="people"
  [createCard]="createTask"
  (cardMove)="onMove($event)"
  (cardEdit)="log('Editada', $event.item.title)"
  (cardAdd)="log('Añadida', $event.item.title)"
/>

<!-- Rango y zoom propios: 8 semanas visibles con los días anchos. -->
<cb-kanban-timeline [(columns)]="columns" [span]="56" [zoom]="2" />`;
  protected readonly calendarCode = `<cb-kanban-calendar
  [(columns)]="columns"
  details
  editable
  addable
  ariaLabel="Sprint 14 en calendario"
  [people]="people"
  [createCard]="createTask"
  (cardEdit)="log('Editada', $event.item.title)"
  (cardAdd)="log('Añadida', $event.item.title)"
/>`;
  protected readonly dashboardCode = `<cb-kanban-dashboard [columns]="columns()" [people]="people" />

<!-- Solo algunos bloques, en este orden. -->
<cb-kanban-dashboard [columns]="columns()" [widgets]="['overdue', 'total', 'byAssignee']" />`;
  protected readonly templateCode = `<cb-kanban [(columns)]="stories" ariaLabel="Historias">
  <ng-template cbKanbanCard let-story>
    <span class="kb-title">{{ story.title }}</span>
    <span class="kb-meta">
      <cb-tag [value]="story.priority" [severity]="story.priority === 'Alta' ? 'danger' : story.priority === 'Media' ? 'warning' : 'secondary'" />
      <span class="kb-owner" aria-hidden="true">{{ initials(story.owner) }}</span>
      <span class="cb-sr-only">Responsable: {{ story.owner }}</span>
    </span>
  </ng-template>
</cb-kanban>`;

  constructor() {
    inject(TocService).reset();
  }
}
