import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, model, signal } from '@angular/core';
import { cbFormat } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { CbKanbanDetails } from './kanban-details.component';
import { addDays, dayDiff, formatDateRange, sameDay, startOfDay, toDate, toIsoDay } from './kanban-task';
import { CbKanbanView, type CbKanbanColumn } from './kanban-view';

interface TimelineDay {
  readonly date: Date;
  readonly iso: string;
  readonly label: string;
  readonly weekend: boolean;
  readonly today: boolean;
}

interface TimelineMonth {
  readonly label: string;
  /** Primer día visible del mes (índice) y cuántos días ocupa. */
  readonly from: number;
  readonly span: number;
}

interface TimelineBar {
  readonly item: unknown;
  readonly key: unknown;
  readonly from: number;
  readonly span: number;
  readonly lane: number;
  /** La tarea empezó antes del rango visible / sigue después. */
  readonly continuesBefore: boolean;
  readonly continuesAfter: boolean;
  /** Barra corta: el nombre va fuera, a su derecha, ocupando estos días (0 = dentro). */
  readonly outside: number;
}

interface TimelineSection {
  readonly column: CbKanbanColumn;
  readonly bars: readonly TimelineBar[];
  readonly lanes: number;
}

type DragMode = 'move' | 'start' | 'end';

interface Drag {
  readonly key: unknown;
  readonly item: unknown;
  readonly mode: DragMode;
  readonly origin: Date;
  readonly x: number;
  readonly y: number;
  moved: boolean;
}

interface Preview {
  readonly key: unknown;
  readonly mode: DragMode;
  readonly delta: number;
  /** Sección bajo el puntero (solo al mover). */
  readonly section?: string;
}

/** Barras de hasta tantos días llevan el nombre fuera (no cabe dentro). */
const SHORT = 2;
/** Días que se reservan para el nombre de una barra corta. */
const OUTSIDE = 4;

/** Ancho de cada día según el zoom. */
const ZOOM = ['1.75rem', '2.5rem', '3.5rem', '5rem'] as const;

let nextUid = 0;

/**
 * Cronograma (diagrama de Gantt) de las tareas: una fila por sección (columna) y
 * cada tarea como una barra desde su `startDate` hasta su `endDate`.
 *
 * Usa el mismo `[(columns)]` que `cb-kanban`, `cb-kanban-list` y
 * `cb-kanban-calendar`. Con `editable`, las barras se arrastran para cambiar las
 * fechas (los bordes cambian la duración) o para pasarlas a otra sección, también
 * con Alt + flechas; con `addable`, cada sección tiene "Añadir tarea" (empieza
 * hoy). `[(viewDate)]` es el primer día visible, `span` cuántos días se ven y
 * `[(zoom)]` el ancho de los días.
 *
 * @example
 * ```html
 * <cb-kanban-timeline [(columns)]="columnas" [people]="personas" details editable addable />
 * ```
 */
@Component({
  selector: 'cb-kanban-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbKanbanDetails],
  host: { class: 'cb-kanban-timeline' },
  template: `
    <div class="cb-kanban-timeline__toolbar">
      @if (addable() && columns().length) {
        <button type="button" class="cb-kanban-timeline__btn" data-add-top [disabled]="disabled()" (click)="addTop()">
          <cb-icon name="plus" [size]="16" aria-hidden="true" />
          {{ t().kanbanAddTask }}
        </button>
      }
      <div class="cb-kanban-timeline__nav">
        <button type="button" class="cb-kanban-timeline__icon-btn" [attr.aria-label]="t().kanbanPreviousWeek" (click)="shiftView(-7)">
          <cb-icon name="chevron-left" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-kanban-timeline__btn cb-kanban-timeline__btn--ghost" (click)="goToday()">{{ t().today }}</button>
        <button type="button" class="cb-kanban-timeline__icon-btn" [attr.aria-label]="t().kanbanNextWeek" (click)="shiftView(7)">
          <cb-icon name="chevron-right" [size]="16" aria-hidden="true" />
        </button>
        <span class="cb-kanban-timeline__range" aria-live="polite">{{ rangeLabel() }}</span>
      </div>
      @if (undated().length) {
        <button
          type="button"
          class="cb-kanban-timeline__btn cb-kanban-timeline__btn--ghost cb-kanban-timeline__undated-btn"
          [attr.aria-expanded]="showUndated()"
          [attr.aria-controls]="uid + '-undated'"
          (click)="showUndated.set(!showUndated())"
        >
          {{ fmt(t().kanbanNoDate, undated().length) }}
        </button>
      }
      <div class="cb-kanban-timeline__zoom" role="group" [attr.aria-label]="t().kanbanDays">
        <span aria-hidden="true">{{ t().kanbanDays }}</span>
        <button type="button" class="cb-kanban-timeline__icon-btn" data-zoom="out" [attr.aria-label]="t().kanbanZoomOut" [disabled]="zoom() <= 0" (click)="setZoom(-1)">
          <cb-icon name="minus" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-kanban-timeline__icon-btn" data-zoom="in" [attr.aria-label]="t().kanbanZoomIn" [disabled]="zoom() >= zoomMax" (click)="setZoom(1)">
          <cb-icon name="plus" [size]="16" aria-hidden="true" />
        </button>
      </div>
    </div>

    @if (showUndated() && undated().length) {
      <ul class="cb-kanban-timeline__undated" [id]="uid + '-undated'">
        @for (u of undated(); track key(u.item)) {
          <li>
            <button
              type="button"
              class="cb-kanban-timeline__undated-item"
              [style.--cb-kanban-color]="u.column.color || null"
              [attr.aria-haspopup]="details() ? 'dialog' : null"
              (click)="openCard(u.item)"
            >
              {{ label(u.item) }}
              <span class="cb-kanban-timeline__undated-column">{{ u.column.title }}</span>
            </button>
          </li>
        }
      </ul>
    }

    <div class="cb-kanban-timeline__scroll" role="group" [attr.aria-label]="ariaLabel() || rangeLabel()">
      <div class="cb-kanban-timeline__sheet" [style.--cb-kanban-timeline-day]="dayWidth()">
        <div class="cb-kanban-timeline__head" aria-hidden="true" [style.grid-template-columns]="template()">
          <div class="cb-kanban-timeline__corner"></div>
          @for (m of months(); track m.from) {
            <div class="cb-kanban-timeline__month" [style.grid-column]="m.from + 2 + ' / span ' + m.span">{{ m.label }}</div>
          }
          @for (d of days(); track d.iso; let i = $index) {
            <div
              class="cb-kanban-timeline__day"
              [class.cb-kanban-timeline__day--weekend]="d.weekend"
              [class.cb-kanban-timeline__day--today]="d.today"
              [style.grid-column]="i + 2"
            >
              {{ d.label }}
            </div>
          }
        </div>

        @for (sec of sections(); track sec.column.id) {
          <div
            class="cb-kanban-timeline__section"
            role="group"
            [attr.aria-label]="fmt(t().kanbanSectionCount, sec.column.title, sec.column.items.length)"
            [style.grid-template-columns]="template()"
            [style.grid-template-rows]="rowsOf(sec)"
            [style.--cb-kanban-color]="sec.column.color || null"
          >
            <div class="cb-kanban-timeline__side">
              <button
                type="button"
                class="cb-kanban-timeline__toggle"
                [attr.data-section]="sec.column.id"
                [attr.aria-expanded]="!isCollapsed(sec.column)"
                [attr.aria-label]="fmt(t().kanbanSectionCount, sec.column.title, sec.column.items.length)"
                (click)="toggleCollapse(sec.column)"
              >
                <cb-icon [name]="isCollapsed(sec.column) ? 'chevron-right' : 'chevron-down'" [size]="16" aria-hidden="true" />
                <span class="cb-kanban-timeline__section-title">{{ sec.column.title }}</span>
                <span class="cb-kanban-timeline__count" [class.cb-kanban-timeline__count--over]="isOver(sec.column)" aria-hidden="true">
                  {{ sec.column.limit ? fmt(t().kanbanCount, sec.column.items.length, sec.column.limit) : sec.column.items.length }}
                </span>
              </button>
              @if (addable() && !isCollapsed(sec.column)) {
                @if (composing() === sec.column.id) {
                  <input
                    #composer
                    class="cb-kanban-timeline__composer"
                    type="text"
                    [attr.aria-label]="fmt(t().kanbanAddTaskIn, sec.column.title)"
                    [placeholder]="t().kanbanCardTitle"
                    (keydown)="onComposerKeydown($event, sec.column, composer)"
                    (blur)="!composer.value.trim() && closeComposer(sec.column.id, false)"
                  />
                } @else {
                  <button
                    type="button"
                    class="cb-kanban-timeline__add"
                    [attr.data-add]="sec.column.id"
                    [attr.aria-label]="fmt(t().kanbanAddTaskIn, sec.column.title)"
                    [disabled]="disabled()"
                    (click)="openComposer(sec.column.id)"
                  >
                    <cb-icon name="plus" [size]="14" aria-hidden="true" />
                    <span aria-hidden="true">{{ t().kanbanAddTask }}</span>
                  </button>
                }
              }
            </div>
            @for (d of days(); track d.iso; let i = $index) {
              <div
                class="cb-kanban-timeline__cell"
                [class.cb-kanban-timeline__cell--weekend]="d.weekend"
                [class.cb-kanban-timeline__cell--target]="dropCell() === sec.column.id + '|' + d.iso"
                [attr.data-date]="d.iso"
                [attr.data-drop]="sec.column.id"
                [style.grid-column]="i + 2"
              ></div>
            }
            @if (todayIndex() >= 0) {
              <div class="cb-kanban-timeline__now" aria-hidden="true" [style.grid-column]="todayIndex() + 2"></div>
            }
            @if (!isCollapsed(sec.column)) {
              @for (bar of sec.bars; track bar.key) {
                <button
                  type="button"
                  class="cb-kanban-timeline__bar"
                  [class.cb-kanban-timeline__bar--before]="bar.continuesBefore"
                  [class.cb-kanban-timeline__bar--after]="bar.continuesAfter"
                  [class.cb-kanban-timeline__bar--completed]="isCompleted(bar.item)"
                  [class.cb-kanban-timeline__bar--dragging]="dragKey() === bar.key"
                  [class.cb-kanban-timeline__bar--movable]="canEdit()"
                  [style.grid-column]="bar.from + 2 + ' / span ' + bar.span"
                  [style.grid-row]="bar.lane + 1"
                  [attr.data-key]="keyAttr(bar.item)"
                  [attr.aria-label]="barLabel(bar, sec.column)"
                  [attr.aria-describedby]="canEdit() ? uid + '-help' : null"
                  [attr.aria-haspopup]="details() ? 'dialog' : null"
                  (pointerdown)="onPointerDown($event, bar)"
                  (click)="onBarClick(bar.item)"
                  (keydown)="onBarKeydown($event, bar.item)"
                >
                  @if (canEdit() && !bar.continuesBefore) {
                    <span class="cb-kanban-timeline__handle cb-kanban-timeline__handle--start" data-edge="start" aria-hidden="true"></span>
                  }
                  @if (peopleOf(bar.item)[0]; as person) {
                    <span class="cb-kanban-timeline__avatar" aria-hidden="true">
                      @if (person.image) {
                        <img [src]="person.image" alt="" />
                      } @else {
                        {{ initialsOf(person.name) }}
                      }
                    </span>
                  }
                  @if (!bar.outside) {
                    <span class="cb-kanban-timeline__bar-title">{{ label(bar.item) }}</span>
                  }
                  @if (canEdit() && !bar.continuesAfter) {
                    <span class="cb-kanban-timeline__handle cb-kanban-timeline__handle--end" data-edge="end" aria-hidden="true"></span>
                  }
                </button>
                @if (bar.outside) {
                  <span
                    class="cb-kanban-timeline__outside"
                    [class.cb-kanban-timeline__outside--completed]="isCompleted(bar.item)"
                    aria-hidden="true"
                    [style.grid-column]="bar.from + bar.span + 2 + ' / span ' + bar.outside"
                    [style.grid-row]="bar.lane + 1"
                    >{{ label(bar.item) }}</span
                  >
                }
              }
            }
          </div>
        }
      </div>
    </div>

    @if (columnsEditable()) {
      <button type="button" class="cb-kanban-timeline__add-section" [disabled]="disabled()" (click)="addSection()">
        <cb-icon name="plus" [size]="16" aria-hidden="true" />
        {{ t().kanbanAddSection }}
      </button>
    }
    <p class="cb-kanban-timeline__sr" [id]="uid + '-help'">{{ t().kanbanTimelineInstructions }}</p>
    <div class="cb-kanban-timeline__sr" role="status">{{ announcement() }}</div>
    @if (details()) {
      <cb-kanban-details [view]="this" />
    }
  `,
  styleUrl: './kanban-timeline.component.css',
})
export class CbKanbanTimeline extends CbKanbanView {
  private readonly document = inject(DOCUMENT);
  protected readonly uid = `cb-kanban-timeline-${++nextUid}`;
  private readonly today = startOfDay(new Date());

  /** Primer día visible. Bidireccional: cambia con ‹ › y "Hoy". Por defecto, unos días antes de hoy. */
  readonly viewDate = model<Date>(addDays(startOfDay(new Date()), -5));
  /** Días visibles. */
  readonly span = input<number>(35);
  /** Ancho de los días: 0 (estrecho) a 3 (ancho). Bidireccional: cambia con − y +. */
  readonly zoom = model<number>(1);
  /** Columna donde se crean las tareas de "Añadir tarea" de la barra (id). Por defecto, la primera. */
  readonly newTaskColumn = input<string | null>(null);

  protected readonly zoomMax = ZOOM.length - 1;
  protected readonly composing = signal<string | null>(null);
  protected readonly showUndated = signal(false);
  private readonly collapsed = signal<ReadonlySet<string>>(new Set());
  private readonly preview = signal<Preview | null>(null);
  protected readonly dragKey = computed(() => this.preview()?.key);
  protected readonly dropCell = signal<string | null>(null);
  private drag: Drag | null = null;
  private suppressClick = false;

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.stopListening());
  }

  protected canEdit(): boolean {
    return this.editable() && !this.disabled();
  }

  // --- Rango visible ---------------------------------------------------------------
  private readonly start = computed(() => startOfDay(this.viewDate()));
  private readonly count = computed(() => Math.max(1, Math.floor(this.span())));

  protected readonly dayWidth = computed(() => ZOOM[Math.max(0, Math.min(this.zoomMax, Math.round(this.zoom())))]);
  protected readonly template = computed(() => `var(--cb-kanban-timeline-side, 13rem) repeat(${this.count()}, var(--cb-kanban-timeline-day))`);

  protected readonly days = computed<TimelineDay[]>(() =>
    Array.from({ length: this.count() }, (_, i) => {
      const date = addDays(this.start(), i);
      return { date, iso: toIsoDay(date)!, label: String(date.getDate()), weekend: date.getDay() === 0 || date.getDay() === 6, today: sameDay(date, this.today) };
    }),
  );

  protected readonly todayIndex = computed(() => this.days().findIndex((d) => d.today));

  protected readonly months = computed<TimelineMonth[]>(() => {
    const locale = this.t().intlLocale;
    const format = new Intl.DateTimeFormat(locale, { month: 'long' });
    const months: TimelineMonth[] = [];
    this.days().forEach((d, i) => {
      const last = months[months.length - 1];
      if (last && d.date.getDate() !== 1) {
        months[months.length - 1] = { ...last, span: last.span + 1 };
        return;
      }
      const name = format.format(d.date);
      const year = d.date.getFullYear() !== this.today.getFullYear() ? ` ${d.date.getFullYear()}` : '';
      months.push({ label: name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) + year, from: i, span: 1 });
    });
    return months;
  });

  protected readonly rangeLabel = computed(() => {
    const end = addDays(this.start(), this.count() - 1);
    return `${formatDateRange(this.start(), end, this.t().intlLocale)} ${end.getFullYear()}`;
  });

  // --- Tareas ----------------------------------------------------------------------
  /** Fechas de cada tarea (inicio ≤ fin), con el arrastre en curso aplicado. */
  private rangeOf(item: unknown, preview: Preview | null): { start: Date; end: Date } | null {
    let start = toDate(this.field(item, 'startDate'));
    let end = toDate(this.field(item, 'endDate'));
    if (!start && !end) return null;
    start = startOfDay((start ?? end)!);
    end = startOfDay((end ?? start)!);
    if (end < start) [start, end] = [end, start];
    if (preview && preview.key === this.key(item)) {
      if (preview.mode !== 'end') start = addDays(start, preview.delta);
      if (preview.mode !== 'start') end = addDays(end, preview.delta);
      if (end < start && preview.mode === 'start') start = end;
      else if (end < start) end = start;
    }
    return { start, end };
  }

  protected readonly undated = computed(() =>
    this.columns().flatMap((column) =>
      column.items.filter((item) => !toDate(this.field(item, 'startDate')) && !toDate(this.field(item, 'endDate'))).map((item) => ({ item, column })),
    ),
  );

  protected readonly sections = computed<TimelineSection[]>(() => {
    const preview = this.preview();
    const first = this.start();
    const last = addDays(first, this.count() - 1);
    const byColumn = new Map<string, { item: unknown; key: unknown; start: Date; end: Date }[]>();
    for (const column of this.columns()) byColumn.set(column.id, []);
    for (const column of this.columns()) {
      for (const item of column.items) {
        const range = this.rangeOf(item, preview);
        if (!range || range.end < first || range.start > last) continue;
        const key = this.key(item);
        const moving = preview && preview.key === key ? preview.section : undefined;
        const target = moving && byColumn.has(moving) ? moving : column.id;
        byColumn.get(target)!.push({ item, key, ...range });
      }
    }
    return this.columns().map((column) => {
      const ranges = byColumn.get(column.id)!.sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
      // Cada barra va en el primer carril libre de la sección.
      const laneEnds: Date[] = [];
      const bars = ranges.map<TimelineBar>((r) => {
        const from = r.start < first ? first : r.start;
        const to = r.end > last ? last : r.end;
        const span = dayDiff(from, to) + 1;
        const outside = span <= SHORT ? Math.min(OUTSIDE, dayDiff(to, last)) : 0;
        // El nombre de fuera también ocupa el carril.
        const reserved = addDays(to, outside);
        let lane = laneEnds.findIndex((end) => end < from);
        if (lane < 0) lane = laneEnds.push(reserved) - 1;
        else laneEnds[lane] = reserved;
        return {
          item: r.item,
          key: r.key,
          from: dayDiff(first, from),
          span,
          lane,
          continuesBefore: r.start < first,
          continuesAfter: r.end > last,
          outside,
        };
      });
      return { column, bars, lanes: laneEnds.length };
    });
  });

  /** Filas de la sección: un carril por barra (al menos uno) y el hueco de "Añadir tarea". */
  protected rowsOf(sec: TimelineSection): string {
    if (this.isCollapsed(sec.column)) return '2.75rem';
    return `repeat(${Math.max(1, sec.lanes)}, 2.75rem) 2.5rem`;
  }

  protected barLabel(bar: TimelineBar, column: CbKanbanColumn): string {
    const t = this.t();
    const parts = [this.label(bar.item), this.dateLabel(bar.item)];
    const priority = this.priorityOf(bar.item);
    if (priority) parts.push(`${t.kanbanPriority}: ${priority.label}`);
    const people = this.peopleOf(bar.item);
    if (people.length) parts.push(cbFormat(t.kanbanAssignedTo, this.names(people)));
    parts.push(column.title);
    if (this.isCompleted(bar.item)) parts.push(t.kanbanCompleted);
    else if (this.isOverdue(bar.item)) parts.push(t.kanbanOverdue);
    return parts.join(', ');
  }

  // --- Secciones -------------------------------------------------------------------
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

  /** Añade una sección vacía al final. */
  addSection(title = this.t().kanbanNewColumn): void {
    const column = this.appendColumn(title);
    this.afterRender(() => this.byData('data-section', column.id)?.focus());
  }

  // --- Navegación ------------------------------------------------------------------
  protected shiftView(days: number): void {
    this.viewDate.set(addDays(this.start(), days));
  }

  protected goToday(): void {
    this.viewDate.set(addDays(this.today, -Math.min(5, Math.floor(this.count() / 4))));
  }

  protected setZoom(step: number): void {
    this.zoom.set(Math.max(0, Math.min(this.zoomMax, Math.round(this.zoom()) + step)));
  }

  /** Si la fecha queda fuera del rango visible, lo desplaza para mostrarla. */
  private reveal(date: Date): void {
    const first = this.start();
    if (date < first || date > addDays(first, this.count() - 1)) {
      this.viewDate.set(addDays(date, -Math.min(5, Math.floor(this.count() / 4))));
    }
  }

  // --- Cambiar fechas y sección ------------------------------------------------------
  /** Desplaza las fechas de la tarea `days` días (mantiene la duración). */
  shiftTask(item: unknown, days: number, focus = false): void {
    if (!days) return;
    const start = toDate(this.field(item, 'startDate'));
    const end = toDate(this.field(item, 'endDate'));
    if (!start && !end) return;
    const patch: Record<string, string> = {};
    if (start) patch['startDate'] = toIsoDay(addDays(start, days))!;
    if (end) patch['endDate'] = toIsoDay(addDays(end, days))!;
    this.applyDates(item, patch, focus);
  }

  /** Mueve el inicio o el fin de la tarea `days` días (sin pasar del otro extremo). */
  resizeTask(item: unknown, edge: 'start' | 'end', days: number, focus = false): void {
    if (!days) return;
    const range = this.rangeOf(item, null);
    if (!range) return;
    let { start, end } = range;
    if (edge === 'start') start = addDays(start, days) > end ? end : addDays(start, days);
    else end = addDays(end, days) < start ? start : addDays(end, days);
    if (sameDay(start, range.start) && sameDay(end, range.end)) return;
    this.applyDates(item, { startDate: toIsoDay(start)!, endDate: toIsoDay(end)! }, focus);
  }

  private applyDates(item: unknown, patch: Record<string, string>, focus: boolean): void {
    this.updateTask(item, patch);
    const updated = { ...(item as object), ...patch };
    this.announcement.set(cbFormat(this.t().kanbanRescheduled, this.label(item), this.dateLabel(updated)));
    this.reveal(toDate(patch['startDate'] ?? patch['endDate'])!);
    if (focus) this.focusItem(this.key(item));
  }

  /** Pasa la tarea a la sección vecina (`step` −1 o 1). */
  private moveToSection(item: unknown, step: number): void {
    const columns = this.columns();
    const target = columns[this.columnIndexOf(item) + step];
    if (!target) return;
    this.moveTask(item, target.id);
    this.focusItem(this.key(item));
  }

  protected onBarKeydown(event: KeyboardEvent, item: unknown): void {
    if (!event.altKey || !this.canEdit()) return;
    const horizontal = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const vertical = { ArrowUp: -1, ArrowDown: 1 }[event.key];
    if (horizontal) {
      event.preventDefault();
      if (event.shiftKey) this.resizeTask(item, 'end', horizontal, true);
      else this.shiftTask(item, horizontal, true);
    } else if (vertical) {
      event.preventDefault();
      this.moveToSection(item, vertical);
    }
  }

  protected onBarClick(item: unknown): void {
    if (this.suppressClick) return;
    this.openCard(item);
  }

  // --- Arrastre ----------------------------------------------------------------------
  protected onPointerDown(event: PointerEvent, bar: TimelineBar): void {
    if (!this.canEdit() || event.button !== 0) return;
    const at = this.cellAt(event.clientX, event.clientY);
    if (!at) return;
    const edge = (event.target as HTMLElement | null)?.closest?.('[data-edge]')?.getAttribute('data-edge');
    const mode: DragMode = edge === 'start' || edge === 'end' ? edge : 'move';
    this.drag = { key: bar.key, item: bar.item, mode, origin: at.date, x: event.clientX, y: event.clientY, moved: false };
    this.document.addEventListener('pointermove', this.onPointerMove);
    this.document.addEventListener('pointerup', this.onPointerUp);
    this.document.addEventListener('pointercancel', this.onPointerCancel);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
    drag.moved = true;
    event.preventDefault();
    const at = this.cellAt(event.clientX, event.clientY);
    if (!at) return;
    this.dropCell.set(`${at.section}|${toIsoDay(at.date)}`);
    this.preview.set({ key: drag.key, mode: drag.mode, delta: dayDiff(drag.origin, at.date), section: drag.mode === 'move' ? at.section : undefined });
  };

  private readonly onPointerUp = (): void => {
    const drag = this.drag;
    const preview = this.preview();
    this.endDrag();
    if (!drag?.moved || !preview) return;
    // El clic que sigue al soltar no abre el detalle.
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));
    if (drag.mode === 'move') {
      this.shiftTask(drag.item, preview.delta);
      const dates = preview.delta ? this.announcement() : '';
      const from = this.columns()[this.columnIndexOf(drag.item)];
      if (preview.section && from && preview.section !== from.id) {
        this.moveTask(drag.item, preview.section);
        // Se anuncian los dos cambios, no solo el último.
        if (dates) this.announcement.set(`${dates} ${this.announcement()}`);
      }
      this.focusItem(drag.key);
    } else {
      this.resizeTask(drag.item, drag.mode, preview.delta, true);
    }
  };

  private readonly onPointerCancel = (): void => this.endDrag();

  private endDrag(): void {
    this.drag = null;
    this.preview.set(null);
    this.dropCell.set(null);
    this.stopListening();
  }

  private stopListening(): void {
    this.document.removeEventListener('pointermove', this.onPointerMove);
    this.document.removeEventListener('pointerup', this.onPointerUp);
    this.document.removeEventListener('pointercancel', this.onPointerCancel);
  }

  /** Día y sección bajo el puntero. */
  private cellAt(x: number, y: number): { date: Date; section: string } | null {
    const elements = typeof this.document.elementsFromPoint === 'function' ? this.document.elementsFromPoint(x, y) : [];
    for (const el of elements) {
      const cell = el.closest<HTMLElement>('.cb-kanban-timeline__cell[data-date]');
      if (cell && this.host.nativeElement.contains(cell)) return { date: toDate(cell.dataset['date'])!, section: cell.dataset['drop'] ?? '' };
    }
    return null;
  }

  // --- Añadir ------------------------------------------------------------------------
  /** Día de las tareas nuevas: hoy si se ve; si no, el primer día visible. */
  private newTaskDay(): string {
    return toIsoDay(this.todayIndex() >= 0 ? this.today : this.start())!;
  }

  /** "Añadir tarea" de la barra: abre el campo en `newTaskColumn` (o la primera sección). */
  protected addTop(): void {
    const id = this.newTaskColumn();
    const column = (id && this.columns().find((c) => c.id === id)) || this.columns()[0];
    if (!column) return;
    if (this.isCollapsed(column)) this.toggleCollapse(column);
    if (this.todayIndex() < 0) this.goToday();
    this.openComposer(column.id);
  }

  protected openComposer(id: string): void {
    this.composing.set(id);
    this.afterRender(() => this.host.nativeElement.querySelector<HTMLInputElement>('.cb-kanban-timeline__composer')?.focus());
  }

  protected closeComposer(id: string, focus = true): void {
    this.composing.set(null);
    if (focus) this.afterRender(() => this.byData('data-add', id)?.focus());
  }

  protected onComposerKeydown(event: KeyboardEvent, column: CbKanbanColumn, field: HTMLInputElement): void {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      const title = field.value.trim();
      if (!title) return;
      const current = this.columns().find((c) => c.id === column.id) ?? column;
      if (this.enforceLimit() && this.isFull(current)) {
        this.announcement.set(cbFormat(this.t().kanbanFull, current.title));
        return;
      }
      const day = this.newTaskDay();
      this.addCard(column.id, title, { startDate: day, endDate: day });
      // El campo sigue abierto para añadir varias seguidas.
      field.value = '';
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeComposer(column.id);
    }
  }

  // --- Foco ------------------------------------------------------------------------
  protected override focusItem(key: unknown): void {
    this.afterRender(() => this.byData('data-key', String(key))?.focus());
  }

  /** Elemento con `name` igual a `value` (sin depender de CSS.escape). */
  private byData(name: 'data-add' | 'data-section' | 'data-key', value: string): HTMLElement | undefined {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(`[${name}]`)).find((el) => el.getAttribute(name) === value);
  }
}
