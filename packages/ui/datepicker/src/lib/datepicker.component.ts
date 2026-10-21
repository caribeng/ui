import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { cbFieldState, type CbRequiredIndicator, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

/** Rango de fechas `[inicio, fin]`; `fin` es `null` mientras se elige. */
export type CbDateRange = readonly [Date, Date | null];

/** Valor que la DatePicker entrega a Angular Forms: una fecha, un rango (`selectionMode="range"`) o `null`. */
export type CbDatepickerValue = Date | CbDateRange | null;

interface DayCell {
  date: Date;
  day: number;
  label: string;
  otherMonth: boolean;
  today: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  disabled: boolean;
  active: boolean;
}

/**
 * Selector de fecha de CaribeNG. Campo de solo lectura que abre un calendario
 * sobre CDK Overlay, con navegación por teclado (patrón WAI-ARIA *date picker
 * dialog*), rango min/max, selección de rangos y hora. Integrado con Angular
 * Forms vía `ControlValueAccessor`.
 *
 * - `selectionMode="single"` (por defecto): `[(value)]` es `Date | null`.
 * - `selectionMode="range"`: `[(range)]` es `[inicio, fin] | null`.
 * - Con Angular Forms, el control recibe la fecha o el rango según el modo.
 * - `showTime`: añade horas y minutos (`hourFormat` 24 o 12).
 *
 * @example
 * ```html
 * <cb-datepicker formControlName="fecha" locale="es-CO" [minDate]="hoy" />
 * <cb-datepicker selectionMode="range" [(range)]="viaje" />
 * <cb-datepicker showTime hourFormat="12" [(value)]="cita" />
 * ```
 */
@Component({
  selector: 'cb-datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
  host: { class: 'cb-datepicker-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbDatepicker),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="cb-datepicker__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span
            [class]="'cb-datepicker__required cb-datepicker__required--' + mark.kind"
            [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'"
          >{{ mark.text }}</span>
        }
      </label>
    }

    <div
      #trigger
      class="cb-datepicker"
      [class]="'cb-datepicker--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <input
        #field
        class="cb-datepicker__field"
        [id]="inputId()"
        type="text"
        readonly
        role="combobox"
        aria-haspopup="dialog"
        [attr.aria-expanded]="open()"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [value]="display()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [required]="fieldState.required()"
        (click)="toggle()"
        (keydown)="onFieldKeydown($event)"
        (blur)="onBlur()"
      />
      <button
        type="button"
        class="cb-datepicker__btn"
        tabindex="-1"
        [attr.aria-label]="t().openCalendar"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        <cb-icon name="calendar" [size]="18" aria-hidden="true" />
      </button>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="false"
      (overlayOutsideClick)="close()"
      (detach)="close()"
    >
      <div
        #panel
        class="cb-datepicker__panel"
        role="dialog"
        aria-modal="false"
        [attr.aria-label]="monthYearLabel()"
        tabindex="-1"
        (keydown)="onPanelKeydown($event)"
      >
        <div class="cb-datepicker__header">
          <button type="button" class="cb-datepicker__nav" [attr.aria-label]="t().previousMonth" (click)="shiftMonth(-1)">
            <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
          </button>
          <span class="cb-datepicker__title" aria-live="polite">{{ monthYearLabel() }}</span>
          <button type="button" class="cb-datepicker__nav" [attr.aria-label]="t().nextMonth" (click)="shiftMonth(1)">
            <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
          </button>
        </div>

        <table class="cb-datepicker__grid" role="grid" [class.cb-datepicker__grid--range]="isRange()" (mouseleave)="hoverDate.set(null)">
          <thead>
            <tr>
              @for (wd of weekdays(); track wd.index) {
                <th class="cb-datepicker__weekday" scope="col" [attr.abbr]="wd.long">{{ wd.short }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (week of weeks(); track week[0].date.getTime()) {
              <tr>
                @for (cell of week; track cell.date.getTime()) {
                  <td
                    class="cb-datepicker__cell"
                    role="gridcell"
                    [class.cb-is-in-range]="cell.inRange"
                    [class.cb-is-range-start]="cell.rangeStart"
                    [class.cb-is-range-end]="cell.rangeEnd"
                    [attr.aria-selected]="cell.selected || cell.inRange"
                  >
                    <!-- aria-disabled (no disabled) para que las flechas puedan pasar por los días no elegibles. -->
                    <button
                      type="button"
                      class="cb-datepicker__day"
                      [class.cb-is-other-month]="cell.otherMonth"
                      [class.cb-is-today]="cell.today"
                      [class.cb-is-selected]="cell.selected"
                      [class.cb-is-active]="cell.active"
                      [class.cb-is-disabled]="cell.disabled"
                      [attr.aria-disabled]="cell.disabled || null"
                      [attr.aria-label]="cell.label"
                      [attr.tabindex]="cell.active ? 0 : -1"
                      [attr.aria-current]="cell.today ? 'date' : null"
                      (click)="selectDate(cell.date)"
                      (mouseenter)="hoverDate.set(cell.date)"
                    >
                      {{ cell.day }}
                    </button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>

        @if (isRange()) {
          <span class="cb-datepicker__sr" aria-live="polite">{{ choosingEnd() ? t().chooseEndDate : '' }}</span>
        }

        @if (showTime() && !isRange()) {
          <div class="cb-datepicker__time" role="group" [attr.aria-label]="timeLabel()">
            <label class="cb-datepicker__time-field">
              <span class="cb-datepicker__sr">{{ t().hours }}</span>
              <input
                type="number"
                class="cb-datepicker__time-input"
                [min]="hourFormat() === '12' ? 1 : 0"
                [max]="hourFormat() === '12' ? 12 : 23"
                [value]="displayHour()"
                (input)="setHour($any($event.target).value)"
              />
            </label>
            <span class="cb-datepicker__time-sep" aria-hidden="true">:</span>
            <label class="cb-datepicker__time-field">
              <span class="cb-datepicker__sr">{{ t().minutes }}</span>
              <input
                type="number"
                class="cb-datepicker__time-input"
                min="0"
                max="59"
                [step]="stepMinute()"
                [value]="pad(currentTime().minutes)"
                (input)="setMinute($any($event.target).value)"
              />
            </label>
            @if (hourFormat() === '12') {
              <button type="button" class="cb-datepicker__period" [attr.aria-label]="t().period" (click)="togglePeriod()">
                {{ currentTime().hours < 12 ? 'AM' : 'PM' }}
              </button>
            }
          </div>
        }

        <div class="cb-datepicker__footer">
          <button type="button" class="cb-datepicker__today" (click)="goToday()">{{ t().today }}</button>
          @if (hasValue()) {
            <button type="button" class="cb-datepicker__clear" (click)="clear()">{{ t().clear }}</button>
          }
        </div>
      </div>
    </ng-template>

    @if (fieldState.invalid() && error()) {
      <p class="cb-datepicker__message cb-datepicker__message--error" [id]="errorId()" role="alert">
        {{ error() }}
      </p>
    } @else if (hint()) {
      <p class="cb-datepicker__message cb-datepicker__message--hint" [id]="hintId()">
        {{ hint() }}
      </p>
    }
  `,
  styleUrl: './datepicker.component.css',
})
export class CbDatepicker implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly injector = inject(Injector);
  /** Fecha seleccionada en modo `single` (two-way opcional fuera de Angular Forms). */
  readonly value = model<Date | null>(null);
  /** Rango seleccionado en modo `range` (two-way opcional fuera de Angular Forms). */
  readonly range = model<CbDateRange | null>(null);

  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  readonly size = input<CbSize>('md');
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  /** Indicador de obligatoriedad de este campo; si se omite usa el global de `provideCaribeNG()`. */
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly inputId = input<string>(`cb-datepicker-${++nextUid}`);

  /** Locale BCP 47 para nombres y formato (por defecto el del navegador). */
  readonly locale = input<string | undefined>(undefined);
  /** Primer día de la semana: 0 = domingo (por defecto), 1 = lunes. */
  readonly firstDayOfWeek = input<number>(0);
  /** Fecha mínima seleccionable. */
  readonly minDate = input<Date | null>(null);
  /** Fecha máxima seleccionable. */
  readonly maxDate = input<Date | null>(null);
  /** `single` (una fecha) o `range` (inicio y fin). */
  readonly selectionMode = input<'single' | 'range'>('single');
  /** Añade horas y minutos (solo con `selectionMode="single"`). */
  readonly showTime = input<boolean, unknown>(false, { transform: toBoolean });
  /** Formato de la hora: `24` (por defecto) o `12` con AM/PM. */
  readonly hourFormat = input<'24' | '12'>('24');
  /** Paso de los minutos (p. ej. 15). */
  readonly stepMinute = input<number>(1);

  protected readonly open = signal(false);
  /** Día bajo el puntero: previsualiza el rango mientras se elige la fecha final. */
  protected readonly hoverDate = signal<Date | null>(null);
  /** Primer día del mes mostrado. */
  private readonly viewDate = signal<Date>(startOfMonth(new Date()));
  /** Día con foco dentro del calendario. */
  private readonly activeDate = signal<Date>(stripTime(new Date()));

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly fieldRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly isRange = computed(() => this.selectionMode() === 'range');

  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly describedBy = computed(() => {
    if (this.fieldState.invalid() && this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  /** La fecha (modo simple) o `null`. */
  private readonly single = computed(() => (this.isRange() ? null : this.value()));
  /** El rango (modo rango) o `null`. */
  private readonly activeRange = computed(() => (this.isRange() ? this.range() : null));
  /** Hay fecha inicial y falta la final. */
  protected readonly choosingEnd = computed(() => !!this.activeRange() && this.activeRange()![1] === null);
  /** Hay algo elegido (para mostrar "Limpiar"). */
  protected readonly hasValue = computed(() => !!this.single() || !!this.activeRange());

  protected readonly display = computed(() => {
    const fmt = new Intl.DateTimeFormat(this.locale(), {
      dateStyle: 'medium',
      ...(this.showTime() && !this.isRange() ? { timeStyle: 'short', hour12: this.hourFormat() === '12' } : {}),
    });
    const range = this.activeRange();
    if (range) return `${fmt.format(range[0])} – ${range[1] ? fmt.format(range[1]) : ''}`.trim();
    const single = this.single();
    return single ? fmt.format(single) : '';
  });

  protected readonly monthYearLabel = computed(() => {
    const label = new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(this.viewDate());
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  protected readonly weekdays = computed(() => {
    const fmt = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
    const first = this.firstDayOfWeek();
    // 2023-01-01 fue domingo: base para recorrer los 7 días.
    const base = new Date(2023, 0, 1);
    return Array.from({ length: 7 }, (_, i) => {
      const dow = (first + i) % 7;
      const d = new Date(base);
      d.setDate(base.getDate() + dow);
      return { index: dow, short: fmt.format(d), long: long.format(d) };
    });
  });

  protected readonly weeks = computed<DayCell[][]>(() => {
    const view = this.viewDate();
    const monthStart = startOfMonth(view);
    const first = this.firstDayOfWeek();
    const offset = (monthStart.getDay() - first + 7) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - offset);

    const fullDate = new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' });
    const today = stripTime(new Date());
    const single = this.single() ? stripTime(this.single()!) : null;
    const range = this.activeRange();
    const start = range ? stripTime(range[0]) : null;
    // Mientras se elige el fin, el rango llega hasta el día bajo el puntero.
    const endSource = range?.[1] ?? (this.choosingEnd() ? this.hoverDate() : null);
    const end = endSource ? stripTime(endSource) : null;
    const [from, to] = start && end && end < start ? [end, start] : [start, end];
    const active = this.activeDate();
    const month = view.getMonth();

    const weeks: DayCell[][] = [];
    const cursor = new Date(gridStart);
    for (let w = 0; w < 6; w++) {
      const row: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        const isStart = !!from && isSameDay(date, from);
        const isEnd = !!to && isSameDay(date, to);
        row.push({
          date,
          day: date.getDate(),
          label: fullDate.format(date),
          otherMonth: date.getMonth() !== month,
          today: isSameDay(date, today),
          selected: (single != null && isSameDay(date, single)) || isStart || (isEnd && !!range?.[1]),
          rangeStart: isStart && !!to,
          rangeEnd: isEnd && !!from,
          inRange: !!from && !!to && date > from && date < to,
          disabled: this.isDisabledDate(date),
          active: isSameDay(date, active),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(row);
    }
    return weeks;
  });

  /** Hora y minutos del valor (o 00:00). */
  protected readonly currentTime = computed(() => {
    const v = this.single();
    return { hours: v?.getHours() ?? 0, minutes: v?.getMinutes() ?? 0 };
  });
  protected readonly displayHour = computed(() => {
    const h = this.currentTime().hours;
    return this.pad(this.hourFormat() === '12' ? h % 12 || 12 : h);
  });
  protected readonly timeLabel = computed(() => `${this.t().hours} / ${this.t().minutes}`);

  constructor() {
    // Al abrir, enfoca el día activo.
    effect(() => {
      if (this.open()) this.focusActiveDay();
    });
  }

  private onChange: (value: CbDatepickerValue) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: CbDatepickerValue): void {
    const v = normalizeValue(value);
    if (Array.isArray(v)) this.range.set(v as CbDateRange);
    else this.value.set(v as Date | null);
    const anchor = (Array.isArray(v) ? v[0] : (v as Date | null)) ?? new Date();
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(stripTime(anchor));
  }
  registerOnChange(fn: (value: CbDatepickerValue) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Apertura --------------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) return;
    this.open() ? this.close() : this.openPanel();
  }

  private openPanel(): void {
    const anchor = this.activeRange()?.[0] ?? this.single() ?? new Date();
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(stripTime(anchor));
    this.open.set(true);
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.hoverDate.set(null);
    this.onTouched();
    queueMicrotask(() => this.fieldRef().nativeElement.focus());
  }

  protected onBlur(): void {
    if (!this.open()) this.onTouched();
  }

  // --- Selección -------------------------------------------------------------
  protected selectDate(date: Date): void {
    if (this.isDisabledDate(date)) return;
    const picked = stripTime(date);
    this.activeDate.set(picked);

    if (this.isRange()) {
      const range = this.activeRange();
      if (!range || range[1]) {
        // Primer clic: fecha inicial; el panel sigue abierto para elegir la final.
        this.commit([picked, null]);
        return;
      }
      const [start] = range;
      this.commit(picked < stripTime(start) ? [picked, start] : [start, picked]);
      this.close();
      return;
    }

    if (this.showTime()) {
      // Con hora, se conserva la hora elegida y el panel sigue abierto.
      const { hours, minutes } = this.currentTime();
      picked.setHours(hours, minutes);
      this.commit(picked);
      return;
    }

    this.commit(picked);
    this.close();
  }

  protected goToday(): void {
    const today = stripTime(new Date());
    this.viewDate.set(startOfMonth(today));
    this.activeDate.set(today);
    this.focusActiveDay();
  }

  protected clear(): void {
    this.commit(null);
    this.close();
  }

  protected shiftMonth(delta: number): void {
    this.viewDate.set(addMonths(this.viewDate(), delta));
  }

  // --- Hora ------------------------------------------------------------------
  protected setHour(raw: string): void {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    let hours: number;
    if (this.hourFormat() === '12') {
      const h12 = clamp(n, 1, 12) % 12;
      hours = this.currentTime().hours < 12 ? h12 : h12 + 12;
    } else {
      hours = clamp(n, 0, 23);
    }
    this.setTime(hours, this.currentTime().minutes);
  }

  protected setMinute(raw: string): void {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) this.setTime(this.currentTime().hours, clamp(n, 0, 59));
  }

  protected togglePeriod(): void {
    const { hours, minutes } = this.currentTime();
    this.setTime((hours + 12) % 24, minutes);
  }

  private setTime(hours: number, minutes: number): void {
    const base = new Date(this.single() ?? this.activeDate());
    base.setHours(hours, minutes, 0, 0);
    this.commit(base);
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // --- Teclado ---------------------------------------------------------------
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    // Solo los días se mueven con las flechas (no los campos de hora ni los botones).
    if (!(event.target as HTMLElement).classList?.contains('cb-datepicker__day')) return;
    const active = this.activeDate();
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft': next = addDays(active, -1); break;
      case 'ArrowRight': next = addDays(active, 1); break;
      case 'ArrowUp': next = addDays(active, -7); break;
      case 'ArrowDown': next = addDays(active, 7); break;
      case 'Home': next = startOfWeek(active, this.firstDayOfWeek()); break;
      case 'End': next = addDays(startOfWeek(active, this.firstDayOfWeek()), 6); break;
      // Re Pág / Av Pág: mismo día del mes anterior o siguiente; con Mayús, del año.
      case 'PageUp': next = sameDayShifted(active, event.shiftKey ? -12 : -1); break;
      case 'PageDown': next = sameDayShifted(active, event.shiftKey ? 12 : 1); break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDate(active);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.activeDate.set(next);
    if (this.choosingEnd()) this.hoverDate.set(next);
    if (next.getMonth() !== this.viewDate().getMonth() || next.getFullYear() !== this.viewDate().getFullYear()) {
      this.viewDate.set(startOfMonth(next));
    }
    this.focusActiveDay();
  }

  /** Enfoca el día activo tras el render: el panel vive en un overlay que se pinta en el ciclo siguiente. */
  private focusActiveDay(): void {
    afterNextRender(
      () => this.panelRef()?.nativeElement.querySelector<HTMLButtonElement>('.cb-datepicker__day.cb-is-active')?.focus(),
      { injector: this.injector },
    );
  }

  // --- Helpers ---------------------------------------------------------------
  /** Guarda en el modelo del modo activo y avisa a Angular Forms. */
  private commit(value: CbDatepickerValue): void {
    if (this.isRange()) this.range.set(value as CbDateRange | null);
    else this.value.set(value as Date | null);
    this.onChange(value);
  }

  private isDisabledDate(date: Date): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    const d = stripTime(date);
    if (min && d < stripTime(min)) return true;
    if (max && d > stripTime(max)) return true;
    return false;
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/** Acepta una fecha, un rango `[inicio, fin]` o `null`; descarta fechas inválidas. */
function normalizeValue(value: unknown): CbDatepickerValue {
  if (Array.isArray(value)) {
    const [start, end] = value;
    return isValidDate(start) ? [start, isValidDate(end) ? end : null] : null;
  }
  return isValidDate(value) ? value : null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return stripTime(r);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
/** Mismo día `n` meses después, ajustado al último día si el mes es más corto (31 ene → 28 feb). */
function sameDayShifted(d: Date, n: number): Date {
  const target = addMonths(d, n);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
}
function startOfWeek(d: Date, firstDay: number): Date {
  const offset = (d.getDay() - firstDay + 7) % 7;
  return addDays(d, -offset);
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
