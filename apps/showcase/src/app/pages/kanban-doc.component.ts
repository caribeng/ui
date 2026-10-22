import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbKanban, CbKanbanCardDirective, type CbKanbanColumn, type CbKanbanMove } from '@caribeng/ui/kanban';
import { CbTag } from '@caribeng/ui/tag';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Task {
  id: number;
  title: string;
  owner: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

@Component({
  selector: 'doc-kanban-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbKanban, CbKanbanCardDirective, CbTag, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="Kanban"
      lead="Tablero de columnas con tarjetas que se reordenan y se mueven entre columnas arrastrando (ratón o dedo) o con el teclado. Admite límite de tarjetas por columna y plantilla de tarjeta propia."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="board"
      title="Tablero con plantilla propia"
      description="[(columns)] se actualiza al mover y (cardMove) avisa con { item, from, to, fromIndex, toIndex } para guardar. Con el teclado: enfoca una tarjeta, Espacio para tomarla, flechas para moverla, Espacio para soltarla y Escape para cancelar. En curso tiene límite de 2 (enforceLimit)."
      [code]="boardCode"
      [codeTs]="boardTs"
    >
      <div class="kb-demo">
        <cb-kanban [(columns)]="columns" enforceLimit addable ariaLabel="Sprint 14" (cardMove)="onMove($event)" (addCard)="add($event)">
          <ng-template cbKanbanCard let-task>
            <span class="kb-title">{{ task.title }}</span>
            <span class="kb-meta">
              <cb-tag [value]="task.priority" [severity]="task.priority === 'Alta' ? 'danger' : task.priority === 'Media' ? 'warning' : 'secondary'" />
              <span class="kb-owner" aria-hidden="true">{{ initials(task.owner) }}</span>
              <span class="cb-sr-only">Responsable: {{ task.owner }}</span>
            </span>
          </ng-template>
        </cb-kanban>
        <p class="kb-log">Último movimiento: {{ last() }}</p>
      </div>
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

  protected readonly columns = signal<readonly CbKanbanColumn<Task>[]>([
    {
      id: 'todo',
      title: 'Por hacer',
      color: '#94a3b8',
      items: [
        { id: 1, title: 'Diseñar pantalla de transferencias', owner: 'Laura Gómez', priority: 'Alta' },
        { id: 2, title: 'Validar números de teléfono', owner: 'Andrés Pérez', priority: 'Media' },
        { id: 3, title: 'Textos en inglés', owner: 'Camila Díaz', priority: 'Baja' },
      ],
    },
    {
      id: 'doing',
      title: 'En curso',
      color: '#3b82f6',
      limit: 2,
      items: [{ id: 4, title: 'Login con OTP', owner: 'Mateo Ruiz', priority: 'Alta' }],
    },
    { id: 'review', title: 'En revisión', color: '#f59e0b', items: [{ id: 5, title: 'Extracto en PDF', owner: 'Laura Gómez', priority: 'Media' }] },
    { id: 'done', title: 'Hecho', color: '#10b981', items: [] },
  ]);
  protected readonly last = signal('—');

  protected initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2);
  }

  protected onMove(move: CbKanbanMove<Task>): void {
    const to = this.columns().find((c) => c.id === move.to)?.title;
    this.last.set(`«${move.item.title}» → ${to} (posición ${move.toIndex + 1})`);
  }

  protected add(columnId: string): void {
    const task: Task = { id: this.nextId++, title: `Tarea nueva ${this.nextId - 10}`, owner: 'Tú', priority: 'Baja' };
    this.columns.update((cols) => cols.map((c) => (c.id === columnId ? { ...c, items: [...c.items, task] } : c)));
  }

  protected readonly importCode = `import { CbKanban, CbKanbanCardDirective, type CbKanbanColumn, type CbKanbanMove } from '@caribeng/ui/kanban';`;
  protected readonly boardCode = `<cb-kanban [(columns)]="columnas" enforceLimit addable ariaLabel="Sprint 14"
  (cardMove)="guardar($event)" (addCard)="nueva($event)">
  <ng-template cbKanbanCard let-tarea>
    <span>{{ tarea.title }}</span>
    <cb-tag [value]="tarea.priority" />
  </ng-template>
</cb-kanban>`;
  protected readonly boardTs = `columnas = signal<CbKanbanColumn<Tarea>[]>([
  { id: 'todo', title: 'Por hacer', items: [...] },
  { id: 'doing', title: 'En curso', limit: 2, color: '#3b82f6', items: [...] },
  { id: 'done', title: 'Hecho', items: [] },
]);

guardar({ item, from, to, toIndex }: CbKanbanMove<Tarea>) {
  this.api.mover(item.id, to, toIndex).subscribe();
}`;

  constructor() {
    inject(TocService).reset();
  }
}
