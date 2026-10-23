import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbGantt, type CbGanttChange, type CbGanttColumn, type CbGanttScale, type CbGanttTask } from '@caribeng/ui/gantt';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

/** Fecha `'AAAA-MM-DD'` a `offset` días de hoy (la demo siempre tiene tareas en curso). */
function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'doc-gantt-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbGantt, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="Gantt"
      lead="Diagrama de Gantt para planificar proyectos: tabla de tareas en árbol, barras en el tiempo con escalas de día, semana y mes, dependencias, avance, hitos y grupos. Se edita arrastrando o con el teclado, y con la planificación automática las tareas que dependen de otra se desplazan solas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="project"
      title="Proyecto completo"
      description="Arrastra una barra para moverla y sus bordes para cambiar el inicio o el fin; el tirador de abajo cambia el avance y el punto de la derecha, arrastrado hasta otra tarea, crea una dependencia (fin → inicio). Haz clic en una flecha para quitarla. Con autoSchedule (activo por defecto), retrasar «Wireframes» desplaza todo lo que depende de ello. Los grupos abarcan a sus tareas y promedian su avance; «Lanzamiento» es un hito. Doble clic (o Enter) abre la tarea."
      [code]="projectCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-gantt [(tasks)]="tareas" [(scale)]="escala" ariaLabel="Proyecto App móvil" (taskChange)="onChange($event)" (taskOpen)="ultimo.set('Abriste «' + $event.name + '»')" (linkAdd)="ultimo.set('Nueva dependencia: ' + nombre($event.from) + ' → ' + nombre($event.to))" />
        <p class="gt-log">{{ ultimo() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="scales"
      title="Escalas"
      description="[(scale)] elige un día, una semana o un mes por columna; la barra de herramientas lo cambia y Hoy lleva a la fecha actual. Con escala de mes se ven proyectos largos de un vistazo."
      [code]="scalesCode"
    >
      <cb-gantt [(tasks)]="tareas" scale="month" height="22rem" />
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura y columnas"
      description="readonly muestra el plan sin edición (las barras siguen siendo enfocables y se leen con lector de pantalla). columns elige las columnas de la tabla y su orden, aquí con Responsable; gridWidth fija su ancho y showToolbar oculta la barra."
      [code]="readonlyCode"
    >
      <cb-gantt [tasks]="tareas()" [columns]="columnas" gridWidth="26rem" height="20rem" scale="week" readonly [showToolbar]="false" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .gt-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class GanttDocComponent {
  protected readonly docApi = DOC_API['cb-gantt'];
  protected readonly a11y = DOC_A11Y['cb-gantt'];

  protected readonly escala = signal<CbGanttScale>('day');
  protected readonly ultimo = signal('');
  protected readonly columnas: CbGanttColumn[] = ['name', 'assignee', 'start', 'end'];

  protected readonly tareas = signal<readonly CbGanttTask[]>([
    { id: 'plan', name: 'Planificación', type: 'group', start: day(-6), end: day(-1) },
    { id: 'req', name: 'Requisitos', parent: 'plan', start: day(-6), end: day(-3), progress: 100, assignee: 'Laura' },
    { id: 'alcance', name: 'Alcance aprobado', parent: 'plan', type: 'milestone', start: day(-2), end: day(-2), dependencies: ['req'] },
    { id: 'des', name: 'Diseño', type: 'group', start: day(-1), end: day(8) },
    { id: 'ux', name: 'Wireframes', parent: 'des', start: day(-1), end: day(4), progress: 60, assignee: 'Camila', dependencies: ['alcance'], color: '#8b5cf6' },
    { id: 'ui', name: 'Prototipo navegable', parent: 'des', start: day(5), end: day(8), progress: 0, assignee: 'Camila', dependencies: ['ux'], color: '#8b5cf6' },
    { id: 'dev', name: 'Desarrollo', type: 'group', start: day(5), end: day(22) },
    { id: 'api', name: 'API de pagos', parent: 'dev', start: day(5), end: day(14), progress: 20, assignee: 'Mateo', dependencies: ['ux'] },
    { id: 'app', name: 'App móvil', parent: 'dev', start: day(9), end: day(20), progress: 0, assignee: 'Andrés', dependencies: ['ui'] },
    { id: 'qa', name: 'Pruebas', start: day(21), end: day(25), progress: 0, assignee: 'Laura', dependencies: ['api', 'app'], color: '#10b981' },
    { id: 'go', name: 'Lanzamiento', type: 'milestone', start: day(26), end: day(26), dependencies: ['qa'] },
  ]);

  protected nombre(id: string): string {
    return this.tareas().find((t) => t.id === id)?.name ?? id;
  }

  protected onChange(change: CbGanttChange): void {
    const verbo = change.reason === 'progress' ? `avance ${change.task.progress} %` : change.reason === 'schedule' ? 'replanificada' : `${change.task.start} → ${change.task.end}`;
    this.ultimo.set(`«${change.task.name}»: ${verbo}`);
  }

  protected readonly importCode = `import { CbGantt, type CbGanttTask } from '@caribeng/ui/gantt';`;
  protected readonly projectCode = `<div style="display: grid; gap: 0.5rem; width: 100%">
  <cb-gantt [(tasks)]="tareas" [(scale)]="escala" ariaLabel="Proyecto App móvil" (taskChange)="onChange($event)" (taskOpen)="ultimo.set('Abriste «' + $event.name + '»')" (linkAdd)="ultimo.set('Nueva dependencia: ' + nombre($event.from) + ' → ' + nombre($event.to))" />
  <p class="gt-log">{{ ultimo() }}</p>
</div>`;
  protected readonly scalesCode = `<cb-gantt [(tasks)]="tareas" scale="month" height="22rem" />`;
  protected readonly readonlyCode = `<cb-gantt [tasks]="tareas()" [columns]="columnas" gridWidth="26rem" height="20rem" scale="week" readonly [showToolbar]="false" />`;

  constructor() {
    inject(TocService).reset();
  }
}
