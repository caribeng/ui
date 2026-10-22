import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, model, signal } from '@angular/core';
import { cbFormat } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { CbKanbanDetails } from './kanban-details.component';
import { addDays, dayDiff, sameDay, startOfDay, startOfWeek, toDate, toIsoDay } from './kanban-task';
import { CbKanbanView, type CbKanbanColumn } from './kanban-view';

interface CalendarDay {
  readonly date: Date;
  readonly iso: string;
  /** Número del día ("1 nov" el primero de cada mes). */
  readonly label: string;
  /** Fecha completa para lectores de pantalla. */
  readonly full: string;
  readonly inMonth: boolean;
  readonly today: boolean;
}

interface CalendarBar {
  readonly item: unknown;
  readonly key: unknown;
  readonly column: CbKanbanColumn;
  /** Columna de la semana (0–6) donde empieza la barra y cuántos días ocupa. */
  readonly from: number;
  readonly span: number;
  readonly lane: number;
  /** La tarea empezó antes de esta semana / sigue después. */
  readonly continuesBefore: boolean;
  readonly continuesAfter: boolean;
}

interface CalendarWeek {
  readonly days: readonly CalendarDay[];
  readonly bars: readonly CalendarBar[];
  readonly lanes: number;
  readonly label: string;
}

interface Drag {
  readonly key: unknown;
  readonly item: unknown;
  readonly origin: Date;
  readonly x: number;
  readonly y: number;
  moved: boolean;
}

let nextUid = 0;

/**
 * Vista de calendario de las tareas: un mes con cada tarea como una barra que va
 * de su fecha de inicio a la de fin (`startDate` / `endDate`, ver `CbKanbanTask`).
 *
 * Usa el mismo `[(columns)]` que `cb-kanban` y `cb-kanban-list`, así que se puede
 * mostrar a la vez que ellas. Con `editable`, las tareas cambian de día
 * arrastrándolas (o con Alt + flechas); con `addable`, cada día tiene "Añadir
 * tarea" (se crea con esa fecha en `newTaskColumn`). Las tareas sin fechas se
 * listan en "Sin fecha".
 *
 * @example
 * ```html
 * <cb-kanban-calendar [(columns)]="columnas" [people]="personas" details editable addable />
 * ```
 */
@Component({
  selector: 'cb-kanban-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbKanbanDetails],
  host: { class: 'cb-kanban-calendar' },
  template: `
    <div class="cb-kanban-calendar__toolbar">
      @if (addable() && columns().length) {
        <button type="button" class="cb-kanban-calendar__btn" data-add-top [disabled]="disabled()" (click)="addToday()">
          <cb-icon name="plus" [size]="16" aria-hidden="true" />
          {{ t().kanbanAddTask }}
        </button>
      }
      <div class="cb-kanban-calendar__nav">
        <button type="button" class="cb-kanban-calendar__icon-btn" [attr.aria-label]="t().previousMonth" (click)="shiftMonth(-1)">
          <cb-icon name="chevron-left" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-kanban-calendar__btn cb-kanban-calendar__btn--ghost" (click)="goToday()">{{ t().today }}</button>
        <button type="button" class="cb-kanban-calendar__icon-btn" [attr.aria-label]="t().nextMonth" (click)="shiftMonth(1)">
          <cb-icon name="chevron-right" [size]="16" aria-hidden="true" />
        </button>
        <span class="cb-kanban-calendar__month" aria-live="polite">{{ monthLabel() }}</span>
      </div>
      @if (undated().length) {
        <button
          type="button"
          class="cb-kanban-calendar__btn cb-kanban-calendar__btn--ghost cb-kanban-calendar__undated-btn"
          [attr.aria-expanded]="showUndated()"
          [attr.aria-controls]="uid + '-undated'"
          (click)="showUndated.set(!showUndated())"
        >
          {{ fmt(t().kanbanNoDate, undated().length) }}
        </button>
      }
    </div>

    @if (showUndated() && undated().length) {
      <ul class="cb-kanban-calendar__undated" [id]="uid + '-undated'">
        @for (u of undated(); track key(u.item)) {
          <li>
            <button
              type="button"
              class="cb-kanban-calendar__undated-item"
              [style.--cb-kanban-color]="u.column.color || null"
              [attr.aria-haspopup]="details() ? 'dialog' : null"
              (click)="openCard(u.item)"
            >
              {{ label(u.item) }}
              <span class="cb-kanban-calendar__undated-column">{{ u.column.title }}</span>
            </button>
          </li>
        }
      </ul>
    }

    <div class="cb-kanban-calendar__grid" [attr.aria-label]="ariaLabel() || monthLabel()" role="group">
      <div class="cb-kanban-calendar__weekdays" aria-hidden="true">
        @for (name of weekdays(); track $index) {
          <span>{{ name }}</span>
        }
      </div>
      @for (week of weeks(); track week.days[0].iso) {
        <div class="cb-kanban-calendar__week" role="group" [attr.aria-label]="week.label" [style.grid-template-rows]="rows(week)">
          @for (d of week.days; track d.iso; let i = $index) {
            <div
              class="cb-kanban-calendar__day"
              [class.cb-kanban-calendar__day--out]="!d.inMonth"
              [class.cb-kanban-calendar__day--today]="d.today"
              [class.cb-kanban-calendar__day--target]="dropDay() === d.iso"
              [attr.data-date]="d.iso"
              [style.grid-column]="i + 1"
            >
              <span class="cb-kanban-calendar__day-num" aria-hidden="true">{{ d.label }}</span>
              @if (addable()) {
                @if (composing() === d.iso) {
                  <input
                    #composer
                    class="cb-kanban-calendar__composer"
                    type="text"
                    [attr.aria-label]="fmt(t().kanbanAddTaskOn, d.full)"
                    [placeholder]="t().kanbanCardTitle"
                    (keydown)="onComposerKeydown($event, d.iso, composer)"
                    (blur)="!composer.value.trim() && closeComposer(d.iso, false)"
                  />
                } @else {
                  <button
                    type="button"
                    class="cb-kanban-calendar__day-add"
                    [attr.data-add]="d.iso"
                    [attr.aria-label]="fmt(t().kanbanAddTaskOn, d.full)"
                    [disabled]="disabled()"
                    (click)="openComposer(d.iso)"
                  >
                    <cb-icon name="plus" [size]="14" aria-hidden="true" />
                    <span aria-hidden="true">{{ t().kanbanAddTask }}</span>
                  </button>
                }
              }
            </div>
          }
          @for (bar of week.bars; track bar.key) {
            <button
              type="button"
              class="cb-kanban-calendar__bar"
              [class.cb-kanban-calendar__bar--before]="bar.continuesBefore"
              [class.cb-kanban-calendar__bar--after]="bar.continuesAfter"
              [class.cb-kanban-calendar__bar--completed]="isCompleted(bar.item)"
              [class.cb-kanban-calendar__bar--dragging]="dragKey() === bar.key"
              [class.cb-kanban-calendar__bar--movable]="canEdit()"
              [style.grid-column]="bar.from + 1 + ' / span ' + bar.span"
              [style.grid-row]="bar.lane + 2"
              [style.--cb-kanban-color]="bar.column.color || null"
              [attr.data-key]="keyAttr(bar.item)"
              [attr.aria-label]="barLabel(bar)"
              [attr.aria-describedby]="canEdit() ? uid + '-help' : null"
              [attr.aria-haspopup]="details() ? 'dialog' : null"
              (pointerdown)="onPointerDown($event, bar)"
              (click)="onBarClick(bar.item)"
              (keydown)="onBarKeydown($event, bar.item)"
            >
              @if (peopleOf(bar.item)[0]; as person) {
                <span class="cb-kanban-calendar__avatar" aria-hidden="true">
                  @if (person.image) {
                    <img [src]="person.image" alt="" />
                  } @else {
                    {{ initialsOf(person.name) }}
                  }
                </span>
              }
              <span class="cb-kanban-calendar__bar-title">{{ label(bar.item) }}</span>
            </button>
          }
        </div>
      }
    </div>
    <p class="cb-kanban-calendar__sr" [id]="uid + '-help'">{{ t().kanbanCalendarInstructions }}</p>
    <div class="cb-kanban-calendar__sr" role="status">{{ announcement() }}</div>
    @if (details()) {
      <cb-kanban-details [view]="this" />
    }
  `,
  styleUrl: './kanban-calendar.component.css',
})
export class CbKanbanCalendar extends CbKanbanView {
  private readonly document = inject(DOCUMENT);
  protected readonly uid = `cb-kanban-calendar-${++nextUid}`;

  /** Mes visible (cualquier día del mes). Bidireccional: cambia con ‹ › y "Hoy". */
  readonly viewDate = model<Date>(new Date());
  /** Primer día de la semana: 0 = domingo, 1 = lunes (por defecto). */
  readonly firstDayOfWeek = input<number>(1);
  /** Columna donde se crean las tareas nuevas (id). Por defecto, la primera. */
  readonly newTaskColumn = input<string | null>(null);

  protected readonly composing = signal<string | null>(null);
  protected readonly showUndated = signal(false);
  /** Mientras se arrastra: la tarea y cuántos días se desplaza. */
  private readonly preview = signal<{ key: unknown; delta: number } | null>(null);
  protected readonly dragKey = computed(() => this.preview()?.key);
  protected readonly dropDay = signal<string | null>(null);
  private drag: Drag | null = null;
  private suppressClick = false;
  private readonly today = startOfDay(new Date());

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.stopListening());
  }

  protected canEdit(): boolean {
    return this.editable() && !this.disabled();
  }

  // --- Calendario ------------------------------------------------------------------
  protected readonly monthLabel = computed(() => {
    const text = new Intl.DateTimeFormat(this.t().intlLocale, { month: 'long', year: 'numeric' }).format(this.viewDate());
    return text.charAt(0).toLocaleUpperCase(this.t().intlLocale) + text.slice(1);
  });

  protected readonly weekdays = computed(() => {
    const format = new Intl.DateTimeFormat(this.t().intlLocale, { weekday: 'short' });
    const start = startOfWeek(this.today, this.firstDayOfWeek());
    return Array.from({ length: 7 }, (_, i) => {
      const name = format.format(addDays(start, i)).replace('.', '');
      return name.charAt(0).toLocaleUpperCase(this.t().intlLocale) + name.slice(1);
    });
  });

  /** Tareas con fechas (inicio ≤ fin), con el desplazamiento del arrastre aplicado. */
  private readonly ranges = computed(() => {
    const preview = this.preview();
    const out: { item: unknown; key: unknown; column: CbKanbanColumn; start: Date; end: Date }[] = [];
    for (const column of this.columns()) {
      for (const item of column.items) {
        let start = toDate(this.field(item, 'startDate'));
        let end = toDate(this.field(item, 'endDate'));
        if (!start && !end) continue;
        start = startOfDay((start ?? end)!);
        end = startOfDay((end ?? start)!);
        if (end < start) [start, end] = [end, start];
        const key = this.key(item);
        if (preview && preview.key === key) {
          start = addDays(start, preview.delta);
          end = addDays(end, preview.delta);
        }
        out.push({ item, key, column, start, end });
      }
    }
    return out;
  });

  protected readonly undated = computed(() =>
    this.columns().flatMap((column) =>
      column.items.filter((item) => !toDate(this.field(item, 'startDate')) && !toDate(this.field(item, 'endDate'))).map((item) => ({ item, column })),
    ),
  );

  protected readonly weeks = computed<CalendarWeek[]>(() => {
    const view = this.viewDate();
    const locale = this.t().intlLocale;
    const first = this.firstDayOfWeek();
    const month = view.getMonth();
    const gridStart = startOfWeek(new Date(view.getFullYear(), month, 1), first);
    const gridEnd = addDays(startOfWeek(new Date(view.getFullYear(), month + 1, 0), first), 6);
    const short = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const ranges = [...this.ranges()].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
    const weeks: CalendarWeek[] = [];

    for (let start = gridStart; start <= gridEnd; start = addDays(start, 7)) {
      const end = addDays(start, 6);
      const days: CalendarDay[] = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(start, i);
        return {
          date,
          iso: toIsoDay(date)!,
          label: date.getDate() === 1 ? short.format(date) : String(date.getDate()),
          full: long.format(date),
          inMonth: date.getMonth() === month,
          today: sameDay(date, this.today),
        };
      });
      // Cada barra va en el primer carril libre de la semana.
      const laneEnds: Date[] = [];
      const bars: CalendarBar[] = [];
      for (const r of ranges) {
        if (r.end < start || r.start > end) continue;
        const from = r.start < start ? start : r.start;
        const to = r.end > end ? end : r.end;
        let lane = laneEnds.findIndex((last) => last < from);
        if (lane < 0) lane = laneEnds.push(to) - 1;
        else laneEnds[lane] = to;
        bars.push({
          item: r.item,
          key: r.key,
          column: r.column,
          from: dayDiff(start, from),
          span: dayDiff(from, to) + 1,
          lane,
          continuesBefore: r.start < start,
          continuesAfter: r.end > end,
        });
      }
      weeks.push({ days, bars, lanes: laneEnds.length, label: cbFormat(this.t().kanbanWeekOf, short.format(start), short.format(end)) });
    }
    return weeks;
  });

  /** Filas de la semana: número del día, un carril por barra y el hueco de "Añadir tarea". */
  protected rows(week: CalendarWeek): string {
    return `2rem ${'1.75rem '.repeat(week.lanes)}minmax(2.25rem, 1fr)`;
  }

  protected barLabel(bar: CalendarBar): string {
    const t = this.t();
    const parts = [this.label(bar.item), this.dateLabel(bar.item)];
    const priority = this.priorityOf(bar.item);
    if (priority) parts.push(`${t.kanbanPriority}: ${priority.label}`);
    const people = this.peopleOf(bar.item);
    if (people.length) parts.push(cbFormat(t.kanbanAssignedTo, this.names(people)));
    parts.push(bar.column.title);
    if (this.isCompleted(bar.item)) parts.push(t.kanbanCompleted);
    else if (this.isOverdue(bar.item)) parts.push(t.kanbanOverdue);
    return parts.join(', ');
  }

  protected shiftMonth(step: number): void {
    const view = this.viewDate();
    this.viewDate.set(new Date(view.getFullYear(), view.getMonth() + step, 1));
  }

  protected goToday(): void {
    this.viewDate.set(new Date());
  }

  // --- Cambiar de día ---------------------------------------------------------------
  /** Desplaza las fechas de la tarea `days` días (mantiene la duración). */
  shiftTask(item: unknown, days: number, focus = false): void {
    if (!days) return;
    const start = toDate(this.field(item, 'startDate'));
    const end = toDate(this.field(item, 'endDate'));
    if (!start && !end) return;
    const patch: Record<string, string> = {};
    if (start) patch['startDate'] = toIsoDay(addDays(start, days))!;
    if (end) patch['endDate'] = toIsoDay(addDays(end, days))!;
    this.updateTask(item, patch);
    const updated = { ...(item as object), ...patch };
    this.announcement.set(cbFormat(this.t().kanbanRescheduled, this.label(item), this.dateLabel(updated)));
    // Si la tarea sale del mes visible, el calendario la sigue.
    const moved = toDate(patch['startDate'] ?? patch['endDate'])!;
    const view = this.viewDate();
    if (moved.getMonth() !== view.getMonth() || moved.getFullYear() !== view.getFullYear()) this.viewDate.set(new Date(moved.getFullYear(), moved.getMonth(), 1));
    if (focus) this.focusItem(this.key(item));
  }

  protected onBarKeydown(event: KeyboardEvent, item: unknown): void {
    if (!event.altKey || !this.canEdit()) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!step) return;
    event.preventDefault();
    this.shiftTask(item, step, true);
  }

  protected onBarClick(item: unknown): void {
    if (this.suppressClick) return;
    this.openCard(item);
  }

  protected onPointerDown(event: PointerEvent, bar: CalendarBar): void {
    if (!this.canEdit() || event.button !== 0) return;
    const origin = this.dateAt(event.clientX, event.clientY);
    if (!origin) return;
    this.drag = { key: bar.key, item: bar.item, origin, x: event.clientX, y: event.clientY, moved: false };
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
    const at = this.dateAt(event.clientX, event.clientY);
    if (!at) return;
    this.dropDay.set(toIsoDay(at));
    this.preview.set({ key: drag.key, delta: dayDiff(drag.origin, at) });
  };

  private readonly onPointerUp = (): void => {
    const drag = this.drag;
    const delta = this.preview()?.delta ?? 0;
    this.endDrag();
    if (!drag?.moved) return;
    // El clic que sigue al soltar no abre el detalle.
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));
    this.shiftTask(drag.item, delta, true);
  };

  private readonly onPointerCancel = (): void => this.endDrag();

  private endDrag(): void {
    this.drag = null;
    this.preview.set(null);
    this.dropDay.set(null);
    this.stopListening();
  }

  private stopListening(): void {
    this.document.removeEventListener('pointermove', this.onPointerMove);
    this.document.removeEventListener('pointerup', this.onPointerUp);
    this.document.removeEventListener('pointercancel', this.onPointerCancel);
  }

  /** Día del calendario bajo el puntero. */
  private dateAt(x: number, y: number): Date | null {
    const elements = typeof this.document.elementsFromPoint === 'function' ? this.document.elementsFromPoint(x, y) : [];
    for (const el of elements) {
      const day = el.closest<HTMLElement>('.cb-kanban-calendar__day[data-date]');
      if (day && this.host.nativeElement.contains(day)) return toDate(day.dataset['date']);
    }
    return null;
  }

  // --- Añadir ------------------------------------------------------------------------
  private targetColumn(): string | undefined {
    const id = this.newTaskColumn();
    return (id && this.columns().some((c) => c.id === id) ? id : this.columns()[0]?.id) ?? undefined;
  }

  /** "Añadir tarea" de la barra: abre el campo en el día de hoy. */
  protected addToday(): void {
    this.goToday();
    this.openComposer(toIsoDay(this.today)!);
  }

  protected openComposer(iso: string): void {
    this.composing.set(iso);
    this.afterRender(() => this.host.nativeElement.querySelector<HTMLInputElement>('.cb-kanban-calendar__composer')?.focus());
  }

  protected closeComposer(iso: string, focus = true): void {
    this.composing.set(null);
    if (focus) this.afterRender(() => this.byData('data-add', iso)?.focus());
  }

  protected onComposerKeydown(event: KeyboardEvent, iso: string, field: HTMLInputElement): void {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      const title = field.value.trim();
      const column = this.targetColumn();
      if (!title || column === undefined) return;
      const col = this.columns().find((c) => c.id === column)!;
      if (this.enforceLimit() && this.isFull(col)) {
        this.announcement.set(cbFormat(this.t().kanbanFull, col.title));
        return;
      }
      this.addCard(column, title, { startDate: iso, endDate: iso });
      // El campo sigue abierto para añadir varias seguidas.
      field.value = '';
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeComposer(iso);
    }
  }

  // --- Foco ------------------------------------------------------------------------
  protected override focusItem(key: unknown): void {
    this.afterRender(() => this.byData('data-key', String(key))?.focus());
  }

  /** Elemento con `name` igual a `value` (sin depender de CSS.escape). */
  private byData(name: 'data-add' | 'data-key', value: string): HTMLElement | undefined {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(`[${name}]`)).find((el) => el.getAttribute(name) === value);
  }
}
