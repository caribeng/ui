import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { CbChart, type CbChartData, type CbChartType } from '@caribeng/ui/chart';
import { addDays, dayDiff, startOfDay, startOfWeek, toDate } from './kanban-task';
import { CbKanbanView } from './kanban-view';

/**
 * Bloques del panel:
 * - Indicadores: `completed`, `incomplete`, `overdue` y `total`.
 * - Gráficos: `bySection` (sin finalizar por sección), `byStatus` (dona por estado),
 *   `byAssignee` (sin finalizar por responsable) y `byWeek` (entregas por semana).
 */
export type CbKanbanDashboardWidget =
  | 'completed'
  | 'incomplete'
  | 'overdue'
  | 'total'
  | 'bySection'
  | 'byStatus'
  | 'byAssignee'
  | 'byWeek';

interface Kpi {
  readonly kind: 'kpi';
  readonly id: CbKanbanDashboardWidget;
  readonly title: string;
  readonly value: number;
  readonly hint?: string;
  readonly tone?: 'success' | 'danger';
}

interface ChartWidget {
  readonly kind: 'chart';
  readonly id: CbKanbanDashboardWidget;
  readonly title: string;
  readonly type: CbChartType;
  readonly data: CbChartData;
  readonly stacked?: boolean;
}

const KPIS: readonly CbKanbanDashboardWidget[] = ['completed', 'incomplete', 'overdue', 'total'];

/** Semanas del gráfico de entregas: dos antes de la actual y cinco después. */
const WEEKS_BEFORE = 2;
const WEEKS_AFTER = 5;

let nextUid = 0;

/**
 * Panel de resumen de las tareas: indicadores (finalizadas, sin finalizar, con
 * retraso y total) y gráficos por sección, por estado, por responsable y por
 * semana de entrega, calculados al momento desde el mismo `[(columns)]` que
 * usan `cb-kanban`, `cb-kanban-list`, `cb-kanban-timeline` y `cb-kanban-calendar`.
 *
 * Una tarea cuenta como finalizada con `completed: true` y con retraso si su
 * `endDate` ya pasó sin finalizarla. `widgets` elige qué bloques se ven y en qué orden.
 *
 * @example
 * ```html
 * <cb-kanban-dashboard [columns]="columnas" [people]="personas" />
 * ```
 */
@Component({
  selector: 'cb-kanban-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbChart],
  host: { class: 'cb-kanban-dashboard', role: 'region', '[attr.aria-label]': 'ariaLabel() || t().kanbanDashboard' },
  template: `
    <div class="cb-kanban-dashboard__grid">
      @for (w of blocks(); track w.id) {
        @if (w.kind === 'kpi') {
          <section class="cb-kanban-dashboard__card cb-kanban-dashboard__kpi" [attr.data-widget]="w.id" [attr.aria-labelledby]="uid + '-' + w.id">
            <div class="cb-kanban-dashboard__title" role="heading" [attr.aria-level]="headingLevel()" [id]="uid + '-' + w.id">{{ w.title }}</div>
            <p class="cb-kanban-dashboard__value" [class.cb-kanban-dashboard__value--danger]="w.tone === 'danger'" [class.cb-kanban-dashboard__value--success]="w.tone === 'success'">
              {{ num(w.value) }}
            </p>
            @if (w.hint) {
              <p class="cb-kanban-dashboard__hint">{{ w.hint }}</p>
            }
          </section>
        } @else {
          <section class="cb-kanban-dashboard__card cb-kanban-dashboard__chart" [attr.data-widget]="w.id" [attr.aria-labelledby]="uid + '-' + w.id">
            <div class="cb-kanban-dashboard__title" role="heading" [attr.aria-level]="headingLevel()" [id]="uid + '-' + w.id">{{ w.title }}</div>
            <cb-chart
              [type]="w.type"
              [data]="w.data"
              [stacked]="!!w.stacked"
              [height]="chartHeight()"
              [ariaLabel]="w.title"
              [locale]="t().intlLocale"
              [valueFormat]="integer"
              [showLegend]="w.type === 'doughnut' || !!w.stacked"
              [animate]="animate()"
            />
          </section>
        }
      }
    </div>
  `,
  styleUrl: './kanban-dashboard.component.css',
})
export class CbKanbanDashboard extends CbKanbanView {
  protected readonly uid = `cb-kanban-dashboard-${++nextUid}`;
  protected readonly integer: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

  /** Bloques a mostrar y su orden. Por defecto, los cuatro indicadores y los cuatro gráficos. */
  readonly widgets = input<readonly CbKanbanDashboardWidget[]>([...KPIS, 'bySection', 'byStatus', 'byAssignee', 'byWeek']);
  /** Nivel de encabezado de los títulos de cada bloque. */
  readonly headingLevel = input<number>(3);
  /** Alto de los gráficos (px). */
  readonly chartHeight = input<number>(220);
  /** Anima los gráficos al aparecer. */
  readonly animate = input<boolean>(true);

  private readonly today = startOfDay(new Date());

  /** Todas las tareas con su estado. */
  private readonly tasks = computed(() =>
    this.columns().flatMap((column) =>
      column.items.map((item) => ({ item, column, completed: this.isCompleted(item), overdue: this.isOverdue(item) })),
    ),
  );

  private readonly counts = computed(() => {
    const tasks = this.tasks();
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter((t) => t.overdue).length;
    return { total: tasks.length, completed, incomplete: tasks.length - completed, overdue };
  });

  protected readonly blocks = computed<(Kpi | ChartWidget)[]>(() => {
    const t = this.t();
    const c = this.counts();
    const percent = new Intl.NumberFormat(t.intlLocale, { style: 'percent', maximumFractionDigits: 0 });
    const share = (n: number) => (c.total ? this.fmt(t.kanbanOfTotal, percent.format(n / c.total)) : undefined);
    const build: Record<CbKanbanDashboardWidget, () => Kpi | ChartWidget> = {
      completed: () => ({ kind: 'kpi', id: 'completed', title: t.kanbanTotalCompleted, value: c.completed, hint: share(c.completed), tone: 'success' }),
      incomplete: () => ({ kind: 'kpi', id: 'incomplete', title: t.kanbanTotalIncomplete, value: c.incomplete, hint: share(c.incomplete) }),
      overdue: () => ({ kind: 'kpi', id: 'overdue', title: t.kanbanTotalOverdue, value: c.overdue, hint: share(c.overdue), tone: c.overdue ? 'danger' : undefined }),
      total: () => ({ kind: 'kpi', id: 'total', title: t.kanbanTotalTasks, value: c.total }),
      bySection: () => ({ kind: 'chart', id: 'bySection', title: t.kanbanIncompleteBySection, type: 'bar', data: this.bySection() }),
      byStatus: () => ({ kind: 'chart', id: 'byStatus', title: t.kanbanByCompletion, type: 'doughnut', data: this.byStatus() }),
      byAssignee: () => ({ kind: 'chart', id: 'byAssignee', title: t.kanbanIncompleteByAssignee, type: 'horizontalBar', data: this.byAssignee() }),
      byWeek: () => ({ kind: 'chart', id: 'byWeek', title: t.kanbanByWeek, type: 'bar', data: this.byWeek(), stacked: true }),
    };
    const seen = new Set<CbKanbanDashboardWidget>();
    return this.widgets()
      .filter((id) => id in build && !seen.has(id) && seen.add(id))
      .map((id) => build[id]());
  });

  // --- Datos de los gráficos -----------------------------------------------------------
  /** Sin finalizar por sección (columna). */
  readonly bySection = computed<CbChartData>(() => ({
    labels: this.columns().map((c) => c.title),
    datasets: [
      {
        label: this.t().kanbanIncompletePlural,
        data: this.columns().map((c) => c.items.filter((i) => !this.isCompleted(i)).length),
        color: 'var(--cb-color-primary-500)',
      },
    ],
  }));

  /** Finalizadas, a tiempo y con retraso. */
  readonly byStatus = computed<CbChartData>(() => {
    const t = this.t();
    const c = this.counts();
    return {
      labels: [t.kanbanCompletedPlural, t.kanbanPendingPlural, t.kanbanOverduePlural],
      datasets: [
        {
          label: t.kanbanTotalTasks,
          data: [c.completed, c.incomplete - c.overdue, c.overdue],
          colors: ['var(--cb-color-success-500)', 'var(--cb-color-primary-500)', 'var(--cb-color-danger-500)'],
        },
      ],
    };
  });

  /** Sin finalizar por responsable (una tarea con dos personas cuenta para las dos). */
  readonly byAssignee = computed<CbChartData>(() => {
    const t = this.t();
    const counts = new Map<string, number>();
    let unassigned = 0;
    for (const task of this.tasks()) {
      if (task.completed) continue;
      const people = this.peopleOf(task.item);
      if (!people.length) unassigned++;
      for (const person of people) counts.set(person.name, (counts.get(person.name) ?? 0) + 1);
    }
    const rows = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], t.intlLocale));
    if (unassigned) rows.push([t.kanbanNoAssignees, unassigned]);
    return {
      labels: rows.map(([name]) => name),
      datasets: [{ label: t.kanbanIncompletePlural, data: rows.map(([, n]) => n), color: 'var(--cb-color-primary-500)' }],
    };
  });

  /** Tareas por semana de su fecha de fin, finalizadas y sin finalizar. */
  readonly byWeek = computed<CbChartData>(() => {
    const t = this.t();
    const first = addDays(startOfWeek(this.today, 1), -7 * WEEKS_BEFORE);
    const weeks = WEEKS_BEFORE + 1 + WEEKS_AFTER;
    const done = new Array<number>(weeks).fill(0);
    const open = new Array<number>(weeks).fill(0);
    for (const task of this.tasks()) {
      const end = toDate(this.field(task.item, 'endDate'));
      if (!end) continue;
      const index = Math.floor(dayDiff(first, end) / 7);
      if (index < 0 || index >= weeks) continue;
      (task.completed ? done : open)[index]++;
    }
    const label = new Intl.DateTimeFormat(t.intlLocale, { day: 'numeric', month: 'short' });
    return {
      labels: Array.from({ length: weeks }, (_, i) => label.format(addDays(first, 7 * i))),
      datasets: [
        { label: t.kanbanCompletedPlural, data: done, color: 'var(--cb-color-success-500)' },
        { label: t.kanbanIncompletePlural, data: open, color: 'var(--cb-color-primary-500)' },
      ],
    };
  });

  protected num(n: number): string {
    return new Intl.NumberFormat(this.t().intlLocale).format(n);
  }

  /** El panel no tiene tareas enfocables. */
  protected override focusItem(): void {
    // Nada que enfocar.
  }
}
