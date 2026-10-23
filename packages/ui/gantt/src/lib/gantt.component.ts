import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import {
  addDays,
  autoSchedule,
  canLink,
  clampProgress,
  dayDiff,
  descendants,
  isoDay,
  isoWeek,
  resolveTasks,
  startOfWeek,
  toDay,
  visibleRows,
  type CbGanttChange,
  type CbGanttColumn,
  type CbGanttLink,
  type CbGanttScale,
  type CbGanttTask,
  type ResolvedTask,
} from './gantt-model';

/** Alto de cada fila (px), igual que en el CSS. */
const ROW = 40;
/** Píxeles por día según la escala. */
const DAY_WIDTH: Record<CbGanttScale, number> = { day: 36, week: 14, month: 4 };

type DragMode = 'move' | 'start' | 'end' | 'progress' | 'link';

interface Drag {
  readonly id: string;
  readonly mode: DragMode;
  readonly x: number;
  readonly y: number;
  readonly startProgress: number;
  readonly width: number;
  moved: boolean;
}

interface Preview {
  readonly id: string;
  readonly mode: DragMode;
  /** Días desplazados (mover / cambiar inicio o fin). */
  readonly delta: number;
  /** Avance nuevo (al arrastrar el avance). */
  readonly progress: number;
  /** Punto del puntero en el diagrama (al crear una dependencia). */
  readonly point: { x: number; y: number } | null;
}

interface Bar {
  readonly row: ResolvedTask;
  readonly index: number;
  readonly x: number;
  readonly width: number;
  readonly y: number;
  readonly start: Date;
  readonly end: Date;
  readonly progress: number;
}

interface Unit {
  readonly key: string;
  readonly label: string;
  readonly x: number;
  readonly width: number;
  readonly weekend?: boolean;
}

let nextUid = 0;

/**
 * Diagrama de Gantt de CaribeNG: tabla de tareas en árbol (grupos plegables) y
 * barras en el tiempo, con escalas de día, semana y mes.
 *
 * - Arrastra una barra para moverla, sus bordes para cambiar inicio o fin, el
 *   tirador inferior para el avance y el punto de la derecha hasta otra tarea
 *   para crear una dependencia (fin → inicio).
 * - Con `autoSchedule`, al retrasar una tarea se desplazan las que dependen de ella.
 * - Los grupos abarcan a sus tareas y promedian su avance; los hitos son rombos.
 * - Con el teclado, cada barra es un botón: flechas mueven, Mayús + flechas cambian
 *   el fin, Alt + flechas el inicio, + / − el avance, Supr quita sus dependencias
 *   y Enter abre la tarea. Cada cambio se anuncia.
 *
 * @example
 * ```html
 * <cb-gantt [(tasks)]="tareas" [(scale)]="escala" (taskChange)="guardar($event)" />
 * ```
 */
@Component({
  selector: 'cb-gantt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-gantt', '[class.cb-gantt--readonly]': 'readonly()' },
  template: `
    @if (showToolbar()) {
      <div class="cb-gantt__toolbar">
        <div class="cb-gantt__scales" role="group" [attr.aria-label]="t().ganttScale">
          @for (s of scales; track s) {
            <button type="button" class="cb-gantt__scale" [attr.aria-pressed]="scale() === s" (click)="scale.set(s)">{{ scaleLabel(s) }}</button>
          }
        </div>
        <button type="button" class="cb-gantt__btn" (click)="scrollToToday()">{{ t().today }}</button>
      </div>
    }

    <div #scroller class="cb-gantt__scroller" [style.height]="height()" (pointermove)="onPointerMove($event)" (pointerup)="onPointerUp($event)" (pointercancel)="cancelDrag()">
      <div class="cb-gantt__inner" [style.--cb-gantt-grid]="gridSize()">
        <!-- Cabecera: columnas de la tabla y escala de tiempo -->
        <div class="cb-gantt__head">
          <div class="cb-gantt__head-grid" aria-hidden="true">
            @for (col of columns(); track col) {
              <span class="cb-gantt__head-cell" [class]="'cb-gantt__head-cell cb-gantt__col-' + col">{{ columnLabel(col) }}</span>
            }
          </div>
          <div class="cb-gantt__head-scale" [style.width.px]="chartWidth()" aria-hidden="true">
            <div class="cb-gantt__head-row">
              @for (u of topUnits(); track u.key) {
                <span class="cb-gantt__unit cb-gantt__unit--top" [style.left.px]="u.x" [style.width.px]="u.width">{{ u.label }}</span>
              }
            </div>
            <div class="cb-gantt__head-row">
              @for (u of units(); track u.key) {
                <span class="cb-gantt__unit" [class.cb-gantt__unit--weekend]="u.weekend" [style.left.px]="u.x" [style.width.px]="u.width">{{ u.label }}</span>
              }
            </div>
          </div>
        </div>

        <div class="cb-gantt__body" [style.height.px]="rows().length * row">
          <!-- Tabla de tareas (árbol) -->
          <div class="cb-gantt__grid" role="treegrid" [attr.aria-label]="ariaLabel() || t().ganttChart" [attr.aria-rowcount]="rows().length">
            @for (r of rows(); track r.task.id; let i = $index) {
              <div
                class="cb-gantt__row"
                role="row"
                [class.cb-is-selected]="selected() === r.task.id"
                [attr.aria-level]="r.level + 1"
                [attr.aria-expanded]="r.children.length ? !collapsed().has(r.task.id) : null"
                [attr.aria-rowindex]="i + 1"
                [attr.aria-selected]="selected() === r.task.id"
              >
                @for (col of columns(); track col) {
                  @if (col === 'name') {
                    <span class="cb-gantt__cell cb-gantt__col-name" role="gridcell" [style.padding-left]="0.5 + r.level * 1.1 + 'rem'">
                      @if (r.children.length) {
                        <button
                          type="button"
                          class="cb-gantt__toggle"
                          [attr.aria-label]="fmt(collapsed().has(r.task.id) ? t().ganttExpand : t().ganttCollapse, r.task.name)"
                          [attr.aria-expanded]="!collapsed().has(r.task.id)"
                          (click)="toggle(r.task.id)"
                        >
                          <cb-icon [name]="collapsed().has(r.task.id) ? 'chevron-right' : 'chevron-down'" [size]="14" aria-hidden="true" />
                        </button>
                      } @else {
                        <span class="cb-gantt__toggle-space" aria-hidden="true"></span>
                      }
                      <button type="button" class="cb-gantt__name" [class.cb-gantt__name--group]="r.isGroup" (click)="focusBar(r.task.id)" (dblclick)="taskOpen.emit(r.task)">
                        @if (r.isMilestone) {
                          <span class="cb-gantt__diamond-mini" aria-hidden="true"></span>
                        }
                        {{ r.task.name }}
                      </button>
                    </span>
                  } @else {
                    <span [class]="'cb-gantt__cell cb-gantt__col-' + col" role="gridcell">{{ cellText(r, col) }}</span>
                  }
                }
              </div>
            }
          </div>

          <!-- Diagrama -->
          <div #chart class="cb-gantt__chart" [style.width.px]="chartWidth()">
            @for (u of units(); track u.key) {
              <span class="cb-gantt__col" [class.cb-gantt__col--weekend]="u.weekend" [style.left.px]="u.x" [style.width.px]="u.width" aria-hidden="true"></span>
            }
            @for (r of rows(); track r.task.id; let i = $index) {
              <span class="cb-gantt__stripe" [class.cb-is-selected]="selected() === r.task.id" [style.top.px]="i * row" aria-hidden="true"></span>
            }
            @if (todayX() !== null) {
              <span class="cb-gantt__today" [style.left.px]="todayX()" aria-hidden="true"></span>
            }

            <svg class="cb-gantt__links" [attr.width]="chartWidth()" [attr.height]="rows().length * row" aria-hidden="true">
              <defs>
                <marker [attr.id]="uid + '-arrow'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L8 4 L0 8 z" />
                </marker>
              </defs>
              @for (l of links(); track l.key) {
                <path class="cb-gantt__link-hit" [attr.d]="l.path" (click)="selectLink(l)" />
                <path class="cb-gantt__link" [class.cb-is-selected]="selectedLink()?.key === l.key" [attr.d]="l.path" [attr.marker-end]="'url(#' + uid + '-arrow)'" />
              }
              @if (linkLine(); as line) {
                <path class="cb-gantt__link cb-gantt__link--draft" [attr.d]="line" />
              }
            </svg>

            @if (selectedLink(); as sl) {
              <button
                type="button"
                class="cb-gantt__unlink"
                [style.left.px]="sl.mid.x"
                [style.top.px]="sl.mid.y"
                [attr.aria-label]="fmt(t().ganttRemoveLink, sl.fromName, sl.toName)"
                [attr.title]="fmt(t().ganttRemoveLink, sl.fromName, sl.toName)"
                (click)="removeLink(sl.from, sl.to)"
              >
                <cb-icon name="x" [size]="12" aria-hidden="true" />
              </button>
            }

            @for (b of bars(); track b.row.task.id) {
              <div
                class="cb-gantt__bar"
                role="button"
                tabindex="0"
                [attr.data-gantt-id]="b.row.task.id"
                [class.cb-gantt__bar--group]="b.row.isGroup"
                [class.cb-gantt__bar--milestone]="b.row.isMilestone"
                [class.cb-gantt__bar--short]="!b.row.isMilestone && !b.row.isGroup && b.width < 72"
                [class.cb-is-selected]="selected() === b.row.task.id"
                [class.cb-is-dragging]="preview()?.id === b.row.task.id"
                [style.left.px]="b.x"
                [style.top.px]="b.y"
                [style.width.px]="b.width"
                [style.--cb-gantt-color]="b.row.task.color || null"
                [attr.aria-label]="barLabel(b)"
                [attr.aria-describedby]="readonly() ? null : uid + '-help'"
                (pointerdown)="onPointerDown($event, b)"
                (keydown)="onBarKeydown($event, b.row)"
                (click)="selected.set(b.row.task.id)"
                (dblclick)="taskOpen.emit(b.row.task)"
              >
                @if (!b.row.isMilestone) {
                  <span class="cb-gantt__progress" [style.width.%]="b.progress" aria-hidden="true"></span>
                  <span class="cb-gantt__bar-label" aria-hidden="true">{{ b.row.task.name }}</span>
                  @if (!readonly() && !b.row.isGroup) {
                    <span class="cb-gantt__handle cb-gantt__handle--start" data-mode="start" aria-hidden="true"></span>
                    <span class="cb-gantt__handle cb-gantt__handle--end" data-mode="end" aria-hidden="true"></span>
                    <span class="cb-gantt__progress-handle" data-mode="progress" [style.left.%]="b.progress" aria-hidden="true"></span>
                  }
                } @else {
                  <span class="cb-gantt__diamond" aria-hidden="true"></span>
                  <span class="cb-gantt__milestone-label" aria-hidden="true">{{ b.row.task.name }}</span>
                }
                @if (!readonly()) {
                  <span class="cb-gantt__connector" data-mode="link" aria-hidden="true"></span>
                }
              </div>
            }
          </div>
        </div>
      </div>
      @if (!rows().length) {
        <p class="cb-gantt__empty">{{ emptyMessage() ?? t().noData }}</p>
      }
    </div>
    <p class="cb-gantt__sr" [id]="uid + '-help'">{{ t().ganttInstructions }}</p>
    <div class="cb-gantt__sr" role="status">{{ announcement() }}</div>
  `,
  styleUrl: './gantt.component.css',
})
export class CbGantt {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly uid = `cb-gantt-${++nextUid}`;
  protected readonly row = ROW;
  protected readonly scales: readonly CbGanttScale[] = ['day', 'week', 'month'];

  /** Tareas (bidireccional: se actualiza al arrastrar, con el teclado y al planificar). */
  readonly tasks = model<readonly CbGanttTask[]>([]);
  /** Escala: un día, una semana o un mes por columna. */
  readonly scale = model<CbGanttScale>('day');
  /** Columnas de la tabla de la izquierda y su orden. */
  readonly columns = input<readonly CbGanttColumn[]>(['name', 'start', 'end', 'duration', 'progress']);
  /** Ancho de la tabla de la izquierda; por defecto, el de sus columnas (como mucho, el 60 % del componente). */
  readonly gridWidth = input<string>('');
  /** Alto del componente (con scroll). */
  readonly height = input<string>('28rem');
  /** Al retrasar una tarea, desplaza las que dependen de ella (fin → inicio). */
  readonly autoSchedule = input(true, { transform: booleanAttribute });
  /** Sin edición: no se arrastra ni se crean dependencias. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Barra con la escala y el botón Hoy. */
  readonly showToolbar = input(true, { transform: booleanAttribute });
  /** Texto sin tareas. Por defecto, "Sin datos". */
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly ariaLabel = input<string>('');

  /** Una tarea cambió de fechas o de avance (también las desplazadas por la planificación). */
  readonly taskChange = output<CbGanttChange>();
  /** Doble clic o Enter sobre una tarea. */
  readonly taskOpen = output<CbGanttTask>();
  /** Dependencia creada (`to` depende de `from`). */
  readonly linkAdd = output<CbGanttLink>();
  /** Dependencia quitada. */
  readonly linkRemove = output<CbGanttLink>();

  protected readonly collapsed = signal<ReadonlySet<string>>(new Set());
  protected readonly selected = signal<string | null>(null);
  protected readonly selectedLink = signal<{ key: string; from: string; to: string; fromName: string; toName: string; mid: { x: number; y: number } } | null>(null);
  protected readonly preview = signal<Preview | null>(null);
  protected readonly announcement = signal('');
  private drag: Drag | null = null;
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly chart = viewChild<ElementRef<HTMLElement>>('chart');

  private readonly resolved = computed(() => resolveTasks(this.tasks()));
  /** Ancho de la tabla: el indicado o el nombre (14rem) más el de cada columna. */
  protected readonly gridSize = computed(() => {
    if (this.gridWidth()) return this.gridWidth();
    const widths: Record<CbGanttColumn, number> = { name: 14, start: 4.5, end: 4.5, duration: 4.5, progress: 4, assignee: 6.5 };
    return `${this.columns().reduce((sum, c) => sum + widths[c], 0)}rem`;
  });
  protected readonly rows = computed(() => visibleRows(this.tasks(), this.resolved(), this.collapsed()));
  protected readonly dayWidth = computed(() => DAY_WIDTH[this.scale()]);

  /** Primer y último día del diagrama (con margen, alineados a la unidad de la escala). */
  protected readonly range = computed(() => {
    const all = [...this.resolved().values()];
    const today = toDay(new Date())!;
    let min = all.length ? new Date(Math.min(...all.map((r) => r.start.getTime()))) : today;
    let max = all.length ? new Date(Math.max(...all.map((r) => r.end.getTime()))) : addDays(today, 30);
    const scale = this.scale();
    if (scale === 'day') {
      min = addDays(min, -3);
      max = addDays(max, 10);
    } else if (scale === 'week') {
      min = startOfWeek(addDays(min, -7));
      max = addDays(startOfWeek(addDays(max, 14)), 6);
    } else {
      min = new Date(min.getFullYear(), min.getMonth() - 1, 1);
      max = new Date(max.getFullYear(), max.getMonth() + 2, 0);
    }
    return { start: min, end: max, days: dayDiff(min, max) + 1 };
  });
  protected readonly chartWidth = computed(() => this.range().days * this.dayWidth());

  private x(date: Date): number {
    return dayDiff(this.range().start, date) * this.dayWidth();
  }

  /** Unidades de la escala (fila inferior de la cabecera y columnas del fondo). */
  protected readonly units = computed<Unit[]>(() => {
    const { start, days } = this.range();
    const locale = this.t().intlLocale;
    const scale = this.scale();
    const w = this.dayWidth();
    const units: Unit[] = [];
    if (scale === 'day') {
      const weekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
      for (let i = 0; i < days; i++) {
        const d = addDays(start, i);
        units.push({ key: isoDay(d), label: `${weekday.format(d)} ${d.getDate()}`, x: i * w, width: w, weekend: d.getDay() === 0 || d.getDay() === 6 });
      }
    } else if (scale === 'week') {
      const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
      for (let i = 0; i < days; i += 7) {
        const d = addDays(start, i);
        units.push({ key: isoDay(d), label: `${cbFormat(this.t().ganttWeekShort, isoWeek(d))} · ${day.format(d)}`, x: i * w, width: 7 * w });
      }
    } else {
      const month = new Intl.DateTimeFormat(locale, { month: 'short' });
      for (let d = new Date(start); d <= this.range().end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        units.push({ key: isoDay(d), label: month.format(d), x: this.x(d), width: dayDiff(d, next) * w });
      }
    }
    return units;
  });

  /** Fila superior de la cabecera: meses (día y semana) o años (mes). */
  protected readonly topUnits = computed<Unit[]>(() => {
    const { start, end } = this.range();
    const locale = this.t().intlLocale;
    const units: Unit[] = [];
    if (this.scale() === 'month') {
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        const from = new Date(Math.max(start.getTime(), new Date(y, 0, 1).getTime()));
        const to = new Date(Math.min(addDays(end, 1).getTime(), new Date(y + 1, 0, 1).getTime()));
        units.push({ key: String(y), label: String(y), x: this.x(from), width: dayDiff(from, to) * this.dayWidth() });
      }
      return units;
    }
    const format = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const from = d < start ? start : d;
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const to = next > addDays(end, 1) ? addDays(end, 1) : next;
      const label = format.format(d);
      // Solo la primera letra en mayúscula ("Noviembre de 2026", no "Noviembre De 2026").
      units.push({ key: isoDay(d), label: label.charAt(0).toUpperCase() + label.slice(1), x: this.x(from), width: dayDiff(from, to) * this.dayWidth() });
    }
    return units;
  });

  protected readonly todayX = computed(() => {
    const today = toDay(new Date())!;
    const { start, end } = this.range();
    return today < start || today > end ? null : this.x(today) + this.dayWidth() / 2;
  });

  /** Geometría de las barras (con la vista previa del arrastre). */
  protected readonly bars = computed<Bar[]>(() => {
    const preview = this.preview();
    const moving = preview && preview.mode === 'move' ? new Set([preview.id, ...descendants(this.tasks(), preview.id)]) : null;
    const w = this.dayWidth();
    return this.rows().map((r, index) => {
      let start = r.start;
      let end = r.end;
      let progress = r.progress;
      if (preview && moving?.has(r.task.id)) {
        start = addDays(start, preview.delta);
        end = addDays(end, preview.delta);
      } else if (preview?.id === r.task.id) {
        if (preview.mode === 'start') start = addDays(start, Math.min(preview.delta, dayDiff(start, end)));
        if (preview.mode === 'end') end = addDays(end, Math.max(preview.delta, -dayDiff(start, end)));
        if (preview.mode === 'progress') progress = preview.progress;
      }
      if (moving && r.isGroup && !moving.has(r.task.id)) {
        // Un grupo que contiene la tarea movida se recalcula en la vista previa.
        const kids = descendants(this.tasks(), r.task.id).filter((id) => moving.has(id));
        if (kids.length) {
          const resolved = this.resolved();
          const spans = descendants(this.tasks(), r.task.id)
            .map((id) => resolved.get(id))
            .filter((k): k is ResolvedTask => !!k && !k.isGroup)
            .map((k) => (moving.has(k.task.id) ? [addDays(k.start, preview!.delta), addDays(k.end, preview!.delta)] : [k.start, k.end]));
          if (spans.length) {
            start = new Date(Math.min(...spans.map((s) => s[0].getTime())));
            end = new Date(Math.max(...spans.map((s) => s[1].getTime())));
          }
        }
      }
      const x = this.x(start);
      const width = r.isMilestone ? Math.max(18, w) : (dayDiff(start, end) + 1) * w;
      return { row: r, index, x: r.isMilestone ? x + w / 2 - 9 : x, width: r.isMilestone ? 18 : width, y: index * ROW, start, end, progress };
    });
  });

  /** Flechas de dependencias entre barras visibles. */
  protected readonly links = computed(() => {
    const bars = new Map(this.bars().map((b) => [b.row.task.id, b]));
    const out: { key: string; from: string; to: string; fromName: string; toName: string; path: string; mid: { x: number; y: number } }[] = [];
    for (const b of this.bars()) {
      for (const dep of b.row.task.dependencies ?? []) {
        const from = bars.get(dep);
        if (!from) continue;
        const x1 = from.x + from.width;
        const y1 = from.y + ROW / 2;
        const x2 = b.x;
        const y2 = b.y + ROW / 2;
        let path: string;
        if (x2 - x1 >= 16) {
          const mx = x1 + 8;
          path = `M${x1} ${y1} H${mx} V${y2} H${x2 - 1}`;
        } else {
          const midY = y2 > y1 ? b.y : b.y + ROW;
          path = `M${x1} ${y1} H${x1 + 8} V${midY} H${x2 - 10} V${y2} H${x2 - 1}`;
        }
        out.push({ key: `${dep}>${b.row.task.id}`, from: dep, to: b.row.task.id, fromName: from.row.task.name, toName: b.row.task.name, path, mid: { x: x1 + 8, y: (y1 + y2) / 2 } });
      }
    }
    return out;
  });

  /** Línea provisional al crear una dependencia. */
  protected readonly linkLine = computed(() => {
    const p = this.preview();
    if (p?.mode !== 'link' || !p.point) return null;
    const from = this.bars().find((b) => b.row.task.id === p.id);
    if (!from) return null;
    return `M${from.x + from.width} ${from.y + ROW / 2} L${p.point.x} ${p.point.y}`;
  });

  // --- Textos ---------------------------------------------------------------------------
  protected scaleLabel(s: CbGanttScale): string {
    const t = this.t();
    return s === 'day' ? t.ganttDay : s === 'week' ? t.ganttWeek : t.ganttMonth;
  }

  protected columnLabel(col: CbGanttColumn): string {
    const t = this.t();
    return { name: t.ganttTask, start: t.ganttStart, end: t.ganttEnd, duration: t.ganttDuration, progress: t.ganttProgress, assignee: t.ganttAssignee }[col];
  }

  private dateText(d: Date): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { day: 'numeric', month: 'short' }).format(d);
  }

  protected cellText(r: ResolvedTask, col: CbGanttColumn): string {
    switch (col) {
      case 'start':
        return this.dateText(r.start);
      case 'end':
        return this.dateText(r.end);
      case 'duration':
        return r.isMilestone ? '—' : cbFormat(this.t().ganttDays, dayDiff(r.start, r.end) + 1);
      case 'progress':
        return r.isMilestone ? '—' : `${r.progress} %`;
      case 'assignee':
        return r.task.assignee ?? '';
      default:
        return r.task.name;
    }
  }

  protected barLabel(b: Bar): string {
    const t = this.t();
    const deps = (b.row.task.dependencies ?? []).map((id) => this.resolved().get(id)?.task.name).filter(Boolean);
    const after = deps.length ? `. ${cbFormat(t.ganttDependsOn, deps.join(', '))}` : '';
    if (b.row.isMilestone) return cbFormat(t.ganttMilestoneLabel, b.row.task.name, this.dateText(b.start)) + after;
    const range = `${this.dateText(b.start)} – ${this.dateText(b.end)}`;
    return cbFormat(b.row.isGroup ? t.ganttGroupLabel : t.ganttBarLabel, b.row.task.name, range, b.progress) + after;
  }

  // --- Árbol ---------------------------------------------------------------------------------
  protected toggle(id: string): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Selecciona la tarea, lleva su barra a la vista y le da el foco. */
  focusBar(id: string): void {
    this.selected.set(id);
    afterNextRender(
      () => {
        const bar = this.barEl(id);
        const scroller = this.scroller()?.nativeElement;
        if (!bar || !scroller) return;
        const grid = scroller.querySelector<HTMLElement>('.cb-gantt__grid')?.offsetWidth ?? 0;
        const left = bar.offsetLeft + grid;
        if (left < scroller.scrollLeft + grid || left + bar.offsetWidth > scroller.scrollLeft + scroller.clientWidth) {
          scroller.scrollLeft = Math.max(0, left - grid - 48);
        }
        bar.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  /** Desplaza el diagrama hasta hoy (centrado en la parte visible). */
  scrollToToday(smooth = true): void {
    const x = this.todayX();
    const scroller = this.scroller()?.nativeElement;
    if (x === null || !scroller) return;
    const grid = scroller.querySelector<HTMLElement>('.cb-gantt__grid')?.offsetWidth ?? 0;
    scroller.scrollTo?.({ left: Math.max(0, x - (scroller.clientWidth - grid) / 3), behavior: smooth ? 'smooth' : 'auto' });
  }

  constructor() {
    // Al abrir, el diagrama empieza cerca de hoy.
    afterNextRender(() => this.scrollToToday(false));
  }

  private barEl(id: string): HTMLElement | null {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-gantt__bar')).find((b) => b.dataset['ganttId'] === id) ?? null;
  }

  // --- Cambios ---------------------------------------------------------------------------------
  /** Aplica un cambio a una tarea (y a las desplazadas por la planificación) y lo emite. */
  private apply(id: string, mode: Exclude<DragMode, 'link'>, delta: number, progress?: number): void {
    const tasks = this.tasks();
    const resolved = this.resolved();
    const target = resolved.get(id);
    if (!target) return;
    const shift = (t: CbGanttTask, d: number): CbGanttTask => {
      const r = resolved.get(t.id)!;
      return { ...t, start: isoDay(addDays(r.start, d)), end: isoDay(addDays(r.end, d)) };
    };
    let next: CbGanttTask[];
    if (mode === 'move') {
      if (!delta) return;
      const moved = new Set([id, ...descendants(tasks, id)]);
      next = tasks.map((t) => (moved.has(t.id) && !resolved.get(t.id)?.isGroup ? shift(t, delta) : t));
    } else if (mode === 'progress') {
      const value = clampProgress(progress ?? 0);
      if (value === target.progress || target.isGroup) return;
      next = tasks.map((t) => (t.id === id ? { ...t, progress: value } : t));
    } else {
      if (!delta || target.isGroup || target.isMilestone) return;
      const length = dayDiff(target.start, target.end);
      next = tasks.map((t) => {
        if (t.id !== id) return t;
        return mode === 'start'
          ? { ...t, start: isoDay(addDays(target.start, Math.min(delta, length))) }
          : { ...t, end: isoDay(addDays(target.end, Math.max(delta, -length))) };
      });
    }
    if (this.autoSchedule()) next = autoSchedule(next);
    this.commit(tasks, next, id, mode === 'progress' ? 'progress' : mode === 'move' ? 'move' : 'resize');
  }

  private commit(before: readonly CbGanttTask[], after: CbGanttTask[], id: string, reason: CbGanttChange['reason']): void {
    const prev = new Map(before.map((t) => [t.id, t]));
    this.tasks.set(after);
    const own = new Set([id, ...descendants(before, id)]);
    const changes: CbGanttChange[] = [];
    for (const t of after) {
      const p = prev.get(t.id);
      if (!p || p === t) continue;
      if (p.start === t.start && p.end === t.end && p.progress === t.progress && p.dependencies === t.dependencies) continue;
      changes.push({ task: t, previous: p, reason: own.has(t.id) ? reason : 'schedule' });
    }
    // Primero las replanificadas; al final, la tarea que cambió el usuario.
    changes.sort((a, b) => Number(a.reason !== 'schedule') - Number(b.reason !== 'schedule'));
    for (const change of changes) this.taskChange.emit(change);
    const r = this.resolveFresh(id);
    if (r) {
      const text =
        reason === 'progress'
          ? cbFormat(this.t().ganttProgressChanged, r.task.name, r.progress)
          : cbFormat(this.t().ganttMoved, r.task.name, `${this.dateText(r.start)} – ${this.dateText(r.end)}`);
      this.announcement.set(text);
    }
  }

  private resolveFresh(id: string): ResolvedTask | undefined {
    return this.resolved().get(id);
  }

  /** Crea la dependencia `from` → `to` (si no forma un ciclo). */
  addLink(from: string, to: string): boolean {
    const tasks = this.tasks();
    if (!canLink(tasks, from, to)) return false;
    let next = tasks.map((t) => (t.id === to ? { ...t, dependencies: [...(t.dependencies ?? []), from] } : t));
    if (this.autoSchedule()) next = autoSchedule(next);
    this.commit(tasks, next, to, 'schedule');
    this.linkAdd.emit({ from, to });
    const names = [from, to].map((id) => this.resolved().get(id)?.task.name ?? id);
    this.announcement.set(cbFormat(this.t().ganttLinkAdded, names[0], names[1]));
    return true;
  }

  /** Quita la dependencia `from` → `to`. */
  removeLink(from: string, to: string): void {
    const tasks = this.tasks();
    const target = tasks.find((t) => t.id === to);
    if (!target?.dependencies?.includes(from)) return;
    this.tasks.set(tasks.map((t) => (t.id === to ? { ...t, dependencies: t.dependencies!.filter((d) => d !== from) } : t)));
    this.selectedLink.set(null);
    this.linkRemove.emit({ from, to });
    this.announcement.set(this.t().ganttLinkRemoved);
  }

  protected selectLink(link: { key: string; from: string; to: string; fromName: string; toName: string; mid: { x: number; y: number } }): void {
    if (this.readonly()) return;
    this.selectedLink.set(this.selectedLink()?.key === link.key ? null : link);
  }

  // --- Arrastre --------------------------------------------------------------------------------
  protected onPointerDown(event: PointerEvent, bar: Bar): void {
    this.selected.set(bar.row.task.id);
    this.selectedLink.set(null);
    if (this.readonly() || event.button !== 0) return;
    const target = event.target as HTMLElement;
    let mode = (target.dataset['mode'] as DragMode | undefined) ?? 'move';
    if (bar.row.isMilestone && mode !== 'link') mode = 'move';
    if (bar.row.isGroup && mode !== 'move' && mode !== 'link') return;
    event.preventDefault();
    this.drag = { id: bar.row.task.id, mode, x: event.clientX, y: event.clientY, startProgress: bar.progress, width: bar.width, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 3 && Math.abs(event.clientY - drag.y) < 3) return;
    drag.moved = true;
    if (drag.mode === 'link') {
      const rect = this.chart()?.nativeElement.getBoundingClientRect();
      this.preview.set({ id: drag.id, mode: 'link', delta: 0, progress: 0, point: rect ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : null });
      return;
    }
    if (drag.mode === 'progress') {
      const value = clampProgress(drag.startProgress + (dx / Math.max(1, drag.width)) * 100);
      this.preview.set({ id: drag.id, mode: 'progress', delta: 0, progress: value, point: null });
      return;
    }
    this.preview.set({ id: drag.id, mode: drag.mode, delta: Math.round(dx / this.dayWidth()), progress: 0, point: null });
  }

  protected onPointerUp(event: PointerEvent): void {
    const drag = this.drag;
    const preview = this.preview();
    this.drag = null;
    this.preview.set(null);
    if (!drag?.moved || !preview) return;
    if (drag.mode === 'link') {
      const doc = this.host.nativeElement.ownerDocument;
      const under = doc.elementFromPoint?.(event.clientX, event.clientY) as HTMLElement | null;
      const to = under?.closest<HTMLElement>('.cb-gantt__bar')?.dataset['ganttId'];
      if (to) this.addLink(drag.id, to);
      return;
    }
    this.apply(drag.id, drag.mode, preview.delta, preview.progress);
  }

  protected cancelDrag(): void {
    this.drag = null;
    this.preview.set(null);
  }

  // --- Teclado ---------------------------------------------------------------------------------
  protected onBarKeydown(event: KeyboardEvent, r: ResolvedTask): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.taskOpen.emit(r.task);
      return;
    }
    if (event.key === 'Escape' && this.drag) {
      this.cancelDrag();
      return;
    }
    if (this.readonly()) return;
    const id = r.task.id;
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step) {
      event.preventDefault();
      const mode = event.shiftKey ? 'end' : event.altKey ? 'start' : 'move';
      if (mode !== 'move' && (r.isGroup || r.isMilestone)) return;
      this.apply(id, mode, step);
      this.focusBar(id);
    } else if (['+', '=', '-', 'PageUp', 'PageDown'].includes(event.key) && !r.isGroup && !r.isMilestone) {
      event.preventDefault();
      const up = event.key === '+' || event.key === '=' || event.key === 'PageUp';
      this.apply(id, 'progress', 0, r.progress + (up ? 10 : -10));
      this.focusBar(id);
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && r.task.dependencies?.length) {
      event.preventDefault();
      for (const from of [...r.task.dependencies]) this.removeLink(from, id);
      this.focusBar(id);
    }
  }
}
