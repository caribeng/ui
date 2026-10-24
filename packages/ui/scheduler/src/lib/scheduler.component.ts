import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import {
  addDays,
  addMinutes,
  dayDiff,
  eventsOfDay,
  isMultiDay,
  layoutDay,
  minutesOf,
  monthGrid,
  resizeEvent,
  resolveEvent,
  sameDay,
  shiftEvent,
  startOfDay,
  startOfWeek,
  type CbSchedulerChange,
  type CbSchedulerEvent,
  type CbSchedulerSlot,
  type CbSchedulerView,
  type ResolvedEvent,
} from './scheduler-model';

/** Alto de una hora en las vistas de semana y día (px), igual que en el CSS. */
const HOUR = 48;
/** Eventos que caben en una celda del mes antes de "+N más". */
const MONTH_LIMIT = 3;

interface Drag {
  readonly mode: 'move' | 'resize' | 'select';
  readonly id: string | null;
  readonly x: number;
  readonly y: number;
  /** Día y minuto donde empezó. */
  readonly day: Date;
  readonly minute: number;
  /** Arrastre en el mes o en la franja de día completo (solo cambian los días). */
  readonly dayOnly: boolean;
  moved: boolean;
}

interface Preview {
  readonly id: string | null;
  readonly days: number;
  readonly minutes: number;
  /** Hueco seleccionado (al arrastrar sobre una franja vacía). */
  readonly select: { day: Date; from: number; to: number } | null;
}

let nextUid = 0;

/**
 * Calendario de eventos de CaribeNG: vistas de mes, semana, día y agenda.
 *
 * - En semana y día, los eventos con hora se colocan en su franja (los que se
 *   solapan, uno al lado del otro) y los de día completo en la franja superior;
 *   una línea marca la hora actual.
 * - Arrastra un evento para moverlo y su borde inferior para cambiar la duración;
 *   arrastra sobre una franja vacía (o haz clic) para elegir un hueco
 *   (`slotSelect`). En el mes, los eventos se arrastran de un día a otro.
 * - Con el teclado cada evento es un botón: flechas lo mueven (un día, o la
 *   duración de una franja), Mayús + flechas arriba / abajo cambian la duración y
 *   Enter lo abre; cada día tiene un botón para crear un evento.
 *
 * @example
 * ```html
 * <cb-scheduler [(events)]="eventos" [(view)]="vista" (slotSelect)="crear($event)" (eventOpen)="abrir($event)" />
 * ```
 */
@Component({
  selector: 'cb-scheduler',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-scheduler', '[class.cb-scheduler--readonly]': '!editable()' },
  template: `
    <div class="cb-sched__toolbar">
      <div class="cb-sched__nav">
        <button type="button" class="cb-sched__icon-btn" [attr.aria-label]="t().schedulerPrevious" (click)="step(-1)">
          <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
        </button>
        <button type="button" class="cb-sched__btn" (click)="goToday()">{{ t().today }}</button>
        <button type="button" class="cb-sched__icon-btn" [attr.aria-label]="t().schedulerNext" (click)="step(1)">
          <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
        </button>
        <h2 class="cb-sched__title" aria-live="polite">{{ title() }}</h2>
      </div>
      <div class="cb-sched__views" role="group" [attr.aria-label]="t().schedulerViews">
        @for (v of views(); track v) {
          <button type="button" class="cb-sched__view" [attr.aria-pressed]="view() === v" (click)="view.set(v)">{{ viewLabel(v) }}</button>
        }
      </div>
    </div>

    <div class="cb-sched__body" [style.height]="height()" (pointermove)="onPointerMove($event)" (pointerup)="onPointerUp()" (pointercancel)="cancelDrag()">
      @switch (view()) {
        @case ('month') {
          <div class="cb-sched__month" role="grid" [attr.aria-label]="title()">
            <div class="cb-sched__month-head" role="row">
              @for (name of weekdayNames(); track $index) {
                <span class="cb-sched__weekday" role="columnheader">{{ name }}</span>
              }
            </div>
            @for (week of weeks(); track $index) {
              <div class="cb-sched__week" role="row">
                @for (d of week; track d.getTime()) {
                  <div
                    class="cb-sched__cell"
                    role="gridcell"
                    [attr.data-date]="d.getTime()"
                    data-day-only="true"
                    [class.cb-sched__cell--outside]="d.getMonth() !== date().getMonth()"
                    [class.cb-sched__cell--today]="isToday(d)"
                    [class.cb-sched__cell--drop]="dropDay()?.getTime() === d.getTime()"
                    (dblclick)="selectDay(d)"
                  >
                    <div class="cb-sched__cell-head">
                      <button type="button" class="cb-sched__day-num" [attr.aria-label]="fmt(t().schedulerOpenDay, longDay(d))" (click)="openDay(d)">{{ d.getDate() }}</button>
                      @if (editable()) {
                        <button type="button" class="cb-sched__add" [attr.aria-label]="fmt(t().schedulerNewEvent, longDay(d))" (click)="selectDay(d)">
                          <cb-icon name="plus" [size]="13" aria-hidden="true" />
                        </button>
                      }
                    </div>
                    @for (e of dayEvents(d).slice(0, limitFor(d)); track e.event.id) {
                      <button
                        type="button"
                        class="cb-sched__chip"
                        [class.cb-sched__chip--block]="e.allDay || isMulti(e)"
                        [class.cb-is-dragging]="preview()?.id === e.event.id"
                        [style.--cb-sched-color]="e.event.color || null"
                        [attr.data-event-id]="e.event.id"
                        [attr.aria-label]="eventLabel(e)"
                        [attr.aria-describedby]="editable() ? uid + '-help' : null"
                        (pointerdown)="onEventPointerDown($event, e, 'move', d, true)"
                        (click)="onEventClick(e)"
                        (keydown)="onEventKeydown($event, e, true)"
                      >
                        @if (!e.allDay && !isMulti(e)) {
                          <span class="cb-sched__dot" aria-hidden="true"></span>
                          <span class="cb-sched__chip-time" aria-hidden="true">{{ time(e.start) }}</span>
                        }
                        <span class="cb-sched__chip-title" aria-hidden="true">{{ e.event.title }}</span>
                      </button>
                    }
                    @if (dayEvents(d).length > limitFor(d)) {
                      <button type="button" class="cb-sched__more" [attr.aria-label]="fmt(t().schedulerMoreLabel, dayEvents(d).length - limitFor(d), longDay(d))" (click)="openDay(d)">
                        {{ fmt(t().schedulerMore, dayEvents(d).length - limitFor(d)) }}
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
        @case ('agenda') {
          <div class="cb-sched__agenda">
            @for (group of agenda(); track group.day.getTime()) {
              <section class="cb-sched__agenda-day" [attr.aria-label]="longDay(group.day)">
                <h3 class="cb-sched__agenda-date" [class.cb-sched__agenda-date--today]="isToday(group.day)">
                  <span class="cb-sched__agenda-num">{{ group.day.getDate() }}</span>
                  <span>{{ agendaDay(group.day) }}</span>
                </h3>
                <ul class="cb-sched__agenda-list">
                  @for (e of group.events; track e.event.id) {
                    <li>
                      <button type="button" class="cb-sched__agenda-item" [style.--cb-sched-color]="e.event.color || null" [attr.aria-label]="eventLabel(e)" (click)="eventOpen.emit(e.event)">
                        <span class="cb-sched__dot" aria-hidden="true"></span>
                        <span class="cb-sched__agenda-time" aria-hidden="true">{{ e.allDay ? t().schedulerAllDay : time(e.start) + ' – ' + time(e.end) }}</span>
                        <span class="cb-sched__agenda-title" aria-hidden="true">{{ e.event.title }}</span>
                        @if (e.event.location) {
                          <span class="cb-sched__agenda-loc" aria-hidden="true">{{ e.event.location }}</span>
                        }
                      </button>
                    </li>
                  }
                </ul>
              </section>
            } @empty {
              <p class="cb-sched__empty">{{ t().schedulerNoEvents }}</p>
            }
          </div>
        }
        @default {
          <div #scroll class="cb-sched__time" [style.--cb-sched-days]="days().length">
            <div class="cb-sched__sticky">
            <div class="cb-sched__time-head">
              <span class="cb-sched__gutter" aria-hidden="true"></span>
              @for (d of days(); track d.getTime()) {
                <div class="cb-sched__col-head" [class.cb-sched__col-head--today]="isToday(d)">
                  <button type="button" class="cb-sched__col-day" [attr.aria-label]="fmt(t().schedulerOpenDay, longDay(d))" (click)="openDay(d)">
                    <span class="cb-sched__col-weekday">{{ weekday(d) }}</span>
                    <span class="cb-sched__col-num">{{ d.getDate() }}</span>
                  </button>
                  @if (editable()) {
                    <button type="button" class="cb-sched__add" [attr.aria-label]="fmt(t().schedulerNewEvent, longDay(d))" (click)="selectTime(d, scrollHour() * 60)">
                      <cb-icon name="plus" [size]="13" aria-hidden="true" />
                    </button>
                  }
                </div>
              }
            </div>
            <div class="cb-sched__allday">
              <span class="cb-sched__gutter cb-sched__gutter--label">{{ t().schedulerAllDay }}</span>
              @for (d of days(); track d.getTime()) {
                <div class="cb-sched__allday-cell" [attr.data-date]="d.getTime()" data-day-only="true" [class.cb-sched__cell--drop]="dropDay()?.getTime() === d.getTime()" (dblclick)="selectDay(d)">
                  @for (e of allDayEvents(d); track e.event.id) {
                    <button
                      type="button"
                      class="cb-sched__chip cb-sched__chip--block"
                      [class.cb-is-dragging]="preview()?.id === e.event.id"
                      [style.--cb-sched-color]="e.event.color || null"
                      [attr.data-event-id]="e.event.id"
                      [attr.aria-label]="eventLabel(e)"
                      [attr.aria-describedby]="editable() ? uid + '-help' : null"
                      (pointerdown)="onEventPointerDown($event, e, 'move', d, true)"
                      (click)="onEventClick(e)"
                      (keydown)="onEventKeydown($event, e, true)"
                    >
                      <span class="cb-sched__chip-title" aria-hidden="true">{{ e.event.title }}</span>
                    </button>
                  }
                </div>
              }
            </div>
            </div>
              <div class="cb-sched__hours" [style.height.px]="24 * hour">
                <div class="cb-sched__gutter cb-sched__gutter--hours" aria-hidden="true">
                  @for (h of hours; track h) {
                    <span class="cb-sched__hour-label" [style.top.px]="h * hour">{{ h ? hourLabel(h) : '' }}</span>
                  }
                </div>
                @for (d of days(); track d.getTime()) {
                  <div class="cb-sched__col" [attr.data-date]="d.getTime()" [class.cb-sched__col--today]="isToday(d)" (pointerdown)="onColumnPointerDown($event, d)">
                    @for (h of hours; track h) {
                      <span class="cb-sched__line" [style.top.px]="h * hour" aria-hidden="true"></span>
                    }
                    @if (isToday(d)) {
                      <span class="cb-sched__now" [style.top.px]="nowTop()" aria-hidden="true"></span>
                    }
                    @if (selection(); as s) {
                      @if (s.day.getTime() === d.getTime()) {
                        <span class="cb-sched__selection" [style.top.px]="s.from * ppm" [style.height.px]="(s.to - s.from) * ppm" aria-hidden="true">
                          {{ time(minuteDate(d, s.from)) }} – {{ time(minuteDate(d, s.to)) }}
                        </span>
                      }
                    }
                    @for (p of placed(d); track p.e.event.id) {
                      <button
                        type="button"
                        class="cb-sched__event"
                        [class.cb-is-dragging]="preview()?.id === p.e.event.id"
                        [class.cb-sched__event--short]="p.to - p.from < 45"
                        [style.--cb-sched-color]="p.e.event.color || null"
                        [style.top.px]="p.from * ppm"
                        [style.height.px]="Math.max(18, (p.to - p.from) * ppm - 2)"
                        [style.left]="'calc(' + (p.column / p.columns) * 100 + '% + 2px)'"
                        [style.width]="'calc(' + 100 / p.columns + '% - 4px)'"
                        [attr.data-event-id]="p.e.event.id"
                        [attr.aria-label]="eventLabel(p.e)"
                        [attr.aria-describedby]="editable() ? uid + '-help' : null"
                        (pointerdown)="onEventPointerDown($event, p.e, 'move', d, false)"
                        (click)="onEventClick(p.e)"
                        (keydown)="onEventKeydown($event, p.e, false)"
                      >
                        <span class="cb-sched__event-title" aria-hidden="true">{{ p.e.event.title }}</span>
                        <span class="cb-sched__event-time" aria-hidden="true">{{ time(p.e.start) }} – {{ time(p.e.end) }}</span>
                        @if (p.e.event.location && p.to - p.from >= 60) {
                          <span class="cb-sched__event-loc" aria-hidden="true">{{ p.e.event.location }}</span>
                        }
                        @if (editable() && !isMulti(p.e)) {
                          <span class="cb-sched__resize" data-resize="true" aria-hidden="true" (pointerdown)="onEventPointerDown($event, p.e, 'resize', d, false)"></span>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
          </div>
        }
      }
    </div>
    <p class="cb-sched__sr" [id]="uid + '-help'">{{ t().schedulerInstructions }}</p>
    <div class="cb-sched__sr" role="status">{{ announcement() }}</div>
  `,
  styleUrl: './scheduler.component.css',
})
export class CbScheduler {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly Math = Math;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly uid = `cb-scheduler-${++nextUid}`;
  protected readonly hour = HOUR;
  protected readonly ppm = HOUR / 60;
  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);

  /** Eventos (bidireccional: se actualiza al moverlos o cambiar su duración). */
  readonly events = model<readonly CbSchedulerEvent[]>([]);
  readonly view = model<CbSchedulerView>('week');
  /** Día de referencia de la vista (el mes, la semana o el día que se muestra). */
  readonly date = model<Date>(startOfDay(new Date()));
  /** Vistas disponibles y su orden. */
  readonly views = input<readonly CbSchedulerView[]>(['month', 'week', 'day', 'agenda']);
  /** Primer día de la semana (0 = domingo, 1 = lunes). */
  readonly firstDayOfWeek = input(1, { transform: numberAttribute });
  /** Minutos de cada franja: paso al arrastrar y con el teclado. */
  readonly slotMinutes = input(30, { transform: numberAttribute });
  /** Hora a la que se desplaza la vista de semana o día al abrirse. */
  readonly scrollHour = input(8, { transform: numberAttribute });
  /** Días que muestra la agenda desde el día de referencia. */
  readonly agendaDays = input(14, { transform: numberAttribute });
  /** Permite mover, cambiar la duración y elegir huecos. */
  readonly editable = input(true, { transform: booleanAttribute });
  /** Alto del área del calendario. */
  readonly height = input<string>('36rem');

  /** Un evento cambió de fecha u hora. */
  readonly eventChange = output<CbSchedulerChange>();
  /** Clic o Enter sobre un evento. */
  readonly eventOpen = output<CbSchedulerEvent>();
  /** Se eligió un hueco (arrastrando o con clic en una franja, doble clic o el botón + de un día). */
  readonly slotSelect = output<CbSchedulerSlot>();

  protected readonly preview = signal<Preview | null>(null);
  protected readonly announcement = signal('');
  private readonly now = signal(new Date());
  private drag: Drag | null = null;
  /** Tras arrastrar un evento no se emite el clic que lo sigue. */
  private suppressClick = false;
  private readonly scrollRef = viewChild<ElementRef<HTMLElement>>('scroll');

  constructor() {
    // Semana y día se abren en la hora de trabajo (no a medianoche).
    effect(() => {
      const view = this.view();
      if (view !== 'week' && view !== 'day') return;
      untracked(() =>
        afterNextRender(
          () => {
            const el = this.scrollRef()?.nativeElement;
            if (!el) return;
            el.scrollTop = Math.max(0, this.scrollHour() * HOUR - 8);
            // Si la semana se desplaza de lado (contenedor estrecho), se abre en el día de hoy.
            const today = el.querySelector<HTMLElement>('.cb-sched__col--today');
            const gutter = el.querySelector<HTMLElement>('.cb-sched__gutter')?.offsetWidth ?? 0;
            if (today && el.scrollWidth > el.clientWidth) el.scrollLeft = Math.max(0, today.offsetLeft - gutter);
          },
          { injector: this.injector },
        ),
      );
    });
    // La línea de la hora actual avanza cada minuto (fuera de la zona: no deja la app "inestable").
    const timer = inject(NgZone).runOutsideAngular(() => setInterval(() => this.now.set(new Date()), 60_000));
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  private readonly resolved = computed(() =>
    this.events()
      .map(resolveEvent)
      .filter((e): e is ResolvedEvent => !!e),
  );

  /** Eventos con la vista previa del arrastre aplicada. */
  private readonly shown = computed(() => {
    const p = this.preview();
    if (!p?.id) return this.resolved();
    return this.events()
      .map((e) => {
        if (e.id !== p.id) return e;
        const drag = this.drag;
        return drag?.mode === 'resize' ? resizeEvent(e, p.minutes, this.slotMinutes()) : shiftEvent(e, p.days, p.minutes);
      })
      .map(resolveEvent)
      .filter((e): e is ResolvedEvent => !!e);
  });

  /** Días de la vista de semana o día. */
  protected readonly days = computed(() => {
    const d = startOfDay(this.date());
    if (this.view() === 'day') return [d];
    const first = startOfWeek(d, this.firstDayOfWeek());
    return Array.from({ length: 7 }, (_, i) => addDays(first, i));
  });

  protected readonly weeks = computed(() => monthGrid(this.date(), this.firstDayOfWeek()));

  protected readonly weekdayNames = computed(() => {
    const format = new Intl.DateTimeFormat(this.t().intlLocale, { weekday: 'short' });
    const first = startOfWeek(new Date(2030, 0, 7), this.firstDayOfWeek());
    return Array.from({ length: 7 }, (_, i) => format.format(addDays(first, i)));
  });

  protected readonly agenda = computed(() => {
    const start = startOfDay(this.date());
    const out: { day: Date; events: ResolvedEvent[] }[] = [];
    for (let i = 0; i < this.agendaDays(); i++) {
      const day = addDays(start, i);
      const events = eventsOfDay(this.resolved(), day);
      if (events.length) out.push({ day, events });
    }
    return out;
  });

  protected readonly title = computed(() => {
    const locale = this.t().intlLocale;
    const d = this.date();
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    switch (this.view()) {
      case 'month':
        return cap(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d));
      case 'day':
        return cap(new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d));
      case 'agenda': {
        const end = addDays(startOfDay(d), this.agendaDays() - 1);
        return this.rangeText(startOfDay(d), end);
      }
      default: {
        const days = this.days();
        return this.rangeText(days[0], days[days.length - 1]);
      }
    }
  });

  private rangeText(from: Date, to: Date): string {
    const locale = this.t().intlLocale;
    const f = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    return (f as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string }).formatRange?.(from, to) ?? `${f.format(from)} – ${f.format(to)}`;
  }

  protected readonly nowTop = computed(() => minutesOf(this.now()) * this.ppm);

  /** Hueco seleccionado al arrastrar sobre una franja. */
  protected readonly selection = computed(() => this.preview()?.select ?? null);

  /** Día bajo el puntero al arrastrar en el mes o en la franja de día completo. */
  protected readonly dropDay = computed(() => {
    const p = this.preview();
    const drag = this.drag;
    if (!p?.id || !drag?.dayOnly) return null;
    return addDays(drag.day, p.days);
  });

  // --- Textos ---------------------------------------------------------------------------
  protected viewLabel(v: CbSchedulerView): string {
    const t = this.t();
    return { month: t.schedulerMonth, week: t.schedulerWeek, day: t.schedulerDay, agenda: t.schedulerAgenda }[v];
  }

  protected time(d: Date): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { hour: '2-digit', minute: '2-digit' }).format(d);
  }

  protected hourLabel(h: number): string {
    return this.time(new Date(2030, 0, 1, h));
  }

  protected weekday(d: Date): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { weekday: 'short' }).format(d);
  }

  /** Cabecera de un día de la agenda (el número va aparte): "Viernes, octubre". */
  protected agendaDay(d: Date): string {
    const locale = this.t().intlLocale;
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d);
    const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${month}`;
  }

  protected longDay(d: Date): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  }

  protected eventLabel(e: ResolvedEvent): string {
    const t = this.t();
    const when = e.allDay
      ? sameDay(e.start, e.end)
        ? `${this.longDay(e.start)}, ${t.schedulerAllDay.toLowerCase()}`
        : `${this.longDay(e.start)} – ${this.longDay(e.end)}`
      : isMultiDay(e)
        ? `${this.longDay(e.start)} ${this.time(e.start)} – ${this.longDay(e.end)} ${this.time(e.end)}`
        : `${this.longDay(e.start)}, ${this.time(e.start)} – ${this.time(e.end)}`;
    return [e.event.title, when, e.event.location].filter(Boolean).join(', ');
  }

  protected isToday(d: Date): boolean {
    return sameDay(d, this.now());
  }

  protected isMulti(e: ResolvedEvent): boolean {
    return isMultiDay(e);
  }

  protected minuteDate(day: Date, minute: number): Date {
    return addMinutes(startOfDay(day), minute);
  }

  // --- Eventos por día ---------------------------------------------------------------------
  protected dayEvents(d: Date): ResolvedEvent[] {
    return eventsOfDay(this.shown(), d);
  }

  /** En el mes, si sobra uno se muestra (no "+1 más"). */
  protected limitFor(d: Date): number {
    return this.dayEvents(d).length === MONTH_LIMIT + 1 ? MONTH_LIMIT + 1 : MONTH_LIMIT;
  }

  protected allDayEvents(d: Date): ResolvedEvent[] {
    return eventsOfDay(this.shown(), d).filter((e) => e.allDay);
  }

  protected placed(d: Date) {
    return layoutDay(this.shown(), d);
  }

  // --- Navegación ------------------------------------------------------------------------
  /** Periodo anterior (−1) o siguiente (1). */
  step(direction: 1 | -1): void {
    const d = this.date();
    switch (this.view()) {
      case 'month':
        this.date.set(new Date(d.getFullYear(), d.getMonth() + direction, 1));
        break;
      case 'day':
        this.date.set(addDays(d, direction));
        break;
      case 'agenda':
        this.date.set(addDays(d, direction * this.agendaDays()));
        break;
      default:
        this.date.set(addDays(d, direction * 7));
    }
  }

  goToday(): void {
    this.date.set(startOfDay(new Date()));
  }

  /** Abre la vista de día de una fecha. */
  openDay(d: Date): void {
    this.date.set(startOfDay(d));
    if (this.views().includes('day')) this.view.set('day');
  }

  // --- Huecos -----------------------------------------------------------------------------
  protected selectDay(d: Date): void {
    if (!this.editable()) return;
    const start = startOfDay(d);
    this.slotSelect.emit({ start, end: start, allDay: true });
  }

  protected selectTime(d: Date, minute: number): void {
    if (!this.editable()) return;
    const start = this.minuteDate(d, minute);
    this.slotSelect.emit({ start, end: addMinutes(start, Math.max(this.slotMinutes(), 30)), allDay: false });
  }

  // --- Arrastre ----------------------------------------------------------------------------
  /** Día (y minuto, en las columnas de hora) bajo el puntero. */
  private pointAt(x: number, y: number): { day: Date; minute: number | null; dayOnly: boolean } | null {
    const doc = this.host.nativeElement.ownerDocument;
    const stack = doc.elementsFromPoint?.(x, y) ?? [];
    for (const el of stack) {
      const target = (el as HTMLElement).closest?.<HTMLElement>('[data-date]');
      if (!target || !this.host.nativeElement.contains(target)) continue;
      const day = new Date(Number(target.dataset['date']));
      if (target.dataset['dayOnly']) return { day, minute: null, dayOnly: true };
      const rect = target.getBoundingClientRect();
      const minute = Math.max(0, Math.min(24 * 60, (y - rect.top) / this.ppm));
      return { day, minute, dayOnly: false };
    }
    return null;
  }

  private snap(minute: number): number {
    const slot = this.slotMinutes();
    return Math.round(minute / slot) * slot;
  }

  protected onEventPointerDown(event: PointerEvent, e: ResolvedEvent, mode: 'move' | 'resize', day: Date, dayOnly: boolean): void {
    if (!this.editable() || event.button !== 0) return;
    event.stopPropagation();
    const point = this.pointAt(event.clientX, event.clientY);
    this.drag = { mode, id: e.event.id, x: event.clientX, y: event.clientY, day, minute: point?.minute ?? minutesOf(e.start), dayOnly, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onColumnPointerDown(event: PointerEvent, d: Date): void {
    if (!this.editable() || event.button !== 0 || (event.target as HTMLElement).closest('.cb-sched__event')) return;
    const point = this.pointAt(event.clientX, event.clientY);
    const minute = this.snap(Math.floor((point?.minute ?? 0) / this.slotMinutes()) * this.slotMinutes());
    this.drag = { mode: 'select', id: null, x: event.clientX, y: event.clientY, day: d, minute, dayOnly: false, moved: false };
    this.preview.set({ id: null, days: 0, minutes: 0, select: { day: d, from: minute, to: minute + this.slotMinutes() } });
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag) return;
    if (!drag.moved && Math.abs(event.clientX - drag.x) < 4 && Math.abs(event.clientY - drag.y) < 4) return;
    drag.moved = true;
    const point = this.pointAt(event.clientX, event.clientY);
    if (drag.mode === 'select') {
      if (!point || point.minute === null) return;
      const a = drag.minute;
      const b = this.snap(point.minute);
      const from = Math.min(a, b);
      const to = Math.max(a + this.slotMinutes(), b);
      this.preview.set({ id: null, days: 0, minutes: 0, select: { day: drag.day, from, to } });
      return;
    }
    if (!point) return;
    const days = drag.mode === 'resize' ? 0 : dayDiff(drag.day, point.day);
    const minutes = drag.dayOnly || point.minute === null ? 0 : this.snap(point.minute - drag.minute);
    this.preview.set({ id: drag.id, days, minutes, select: null });
  }

  protected onPointerUp(): void {
    const drag = this.drag;
    const preview = this.preview();
    this.drag = null;
    this.preview.set(null);
    if (!drag) return;
    if (drag.mode === 'select') {
      const s = preview?.select;
      if (s) this.selectRange(s.day, s.from, s.to);
      return;
    }
    if (!drag.moved || !preview?.id) return;
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false));
    if (drag.mode === 'resize') this.apply(drag.id!, (e) => resizeEvent(e, preview.minutes, this.slotMinutes()));
    else this.apply(drag.id!, (e) => shiftEvent(e, preview.days, preview.minutes));
  }

  private selectRange(day: Date, from: number, to: number): void {
    const start = this.minuteDate(day, from);
    this.slotSelect.emit({ start, end: this.minuteDate(day, to), allDay: false });
  }

  protected cancelDrag(): void {
    this.drag = null;
    this.preview.set(null);
  }

  protected onEventClick(e: ResolvedEvent): void {
    if (this.suppressClick) return;
    this.eventOpen.emit(e.event);
  }

  // --- Cambios -------------------------------------------------------------------------------
  private apply(id: string, change: (e: CbSchedulerEvent) => CbSchedulerEvent): void {
    const events = this.events();
    const previous = events.find((e) => e.id === id);
    if (!previous) return;
    const next = change(previous);
    if (next.start === previous.start && next.end === previous.end) return;
    this.events.set(events.map((e) => (e.id === id ? next : e)));
    this.eventChange.emit({ event: next, previous });
    const r = resolveEvent(next);
    if (r) this.announcement.set(cbFormat(this.t().schedulerMoved, this.eventLabel(r)));
  }

  protected onEventKeydown(event: KeyboardEvent, e: ResolvedEvent, dayOnly: boolean): void {
    if (!this.editable() || event.altKey || event.ctrlKey || event.metaKey) return;
    const id = e.event.id;
    const slot = this.slotMinutes();
    let handled = true;
    if (event.shiftKey && !dayOnly && !e.allDay && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      this.apply(id, (ev) => resizeEvent(ev, event.key === 'ArrowDown' ? slot : -slot, slot));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      this.apply(id, (ev) => shiftEvent(ev, event.key === 'ArrowRight' ? 1 : -1, 0));
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const down = event.key === 'ArrowDown';
      if (dayOnly || e.allDay) this.apply(id, (ev) => shiftEvent(ev, down ? 7 : -7, 0));
      else this.apply(id, (ev) => shiftEvent(ev, 0, down ? slot : -slot));
    } else handled = false;
    if (!handled) return;
    event.preventDefault();
    // La vista se repinta: el foco vuelve al evento (que puede haber cambiado de día).
    afterNextRender(
      () => {
        const el = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[data-event-id]')).find((b) => b.dataset['eventId'] === id);
        el?.focus();
        if (!el) {
          const moved = this.resolved().find((r) => r.event.id === id);
          if (moved && this.view() !== 'month') this.date.set(startOfDay(moved.start));
        }
      },
      { injector: this.injector },
    );
  }
}
