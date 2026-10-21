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
import { cbFieldState, cbFormat, type CbRequiredIndicator, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { dateNames, formatDate, localeDateFormat, parseDate } from './date-format';

let nextUid = 0;

/** Rango de fechas `[inicio, fin]`; `fin` es `null` mientras se elige. */
export type CbDateRange = readonly [Date, Date | null];

/** Valor que la DatePicker entrega a Angular Forms: una fecha, un rango (`selectionMode="range"`) o `null`. */
export type CbDatepickerValue = Date | CbDateRange | null;

/** Qué se elige: un día, un mes (día 1) o un año (1 de enero). */
export type CbDatepickerView = 'date' | 'month' | 'year';

/** Atajos predefinidos (con textos traducidos): rangos relativos a hoy. */
export type CbDatePresetKey =
  | 'today'
  | 'yesterday'
  | 'last7Days'
  | 'last30Days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear';

/** Atajo propio: un texto y una fecha o un rango (o una función que los calcula al abrir). */
export interface CbDatePreset {
  label: string;
  value: Date | CbDateRange | (() => Date | CbDateRange);
}

interface DayCell {
  date: Date;
  day: number;
  label: string;
  otherMonth: boolean;
  /** Día de otro mes en un calendario de varios meses: la celda queda vacía. */
  hidden: boolean;
  today: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  disabled: boolean;
  active: boolean;
}

/** Celda de la vista de meses o de años. */
interface UnitCell {
  date: Date;
  text: string;
  label: string;
  /** Año fuera de la década mostrada (primero y último de la cuadrícula). */
  outside: boolean;
  current: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  disabled: boolean;
  active: boolean;
}

type TimeTarget = 'single' | 'start' | 'end';

/**
 * Selector de fecha de CaribeNG. Abre un calendario sobre CDK Overlay, con
 * navegación por teclado (patrón WAI-ARIA *date picker dialog*), rango
 * min/max, selección de rangos, hora y vistas de mes y año. Integrado con
 * Angular Forms vía `ControlValueAccessor`.
 *
 * - `selectionMode="single"` (por defecto): `[(value)]` es `Date | null`.
 * - `selectionMode="range"`: `[(range)]` es `[inicio, fin] | null`; muestra dos meses (`numberOfMonths`).
 * - `view="month"` / `view="year"`: se elige un mes (día 1) o un año (1 de enero).
 * - `showTime`: añade horas y minutos (`hourFormat` 24 o 12), también en rangos.
 * - `dateFormat`: formato con la sintaxis de PrimeNG (`dd/mm/yy`, `d 'de' MM`…); `editable` permite escribir la fecha.
 *
 * @example
 * ```html
 * <cb-datepicker formControlName="fecha" locale="es-CO" [minDate]="hoy" />
 * <cb-datepicker selectionMode="range" [(range)]="viaje" />
 * <cb-datepicker showTime hourFormat="12" [(value)]="cita" />
 * <cb-datepicker view="month" dateFormat="mm/yy" [(value)]="vencimiento" />
 * <cb-datepicker editable dateFormat="dd/mm/yy" [(value)]="nacimiento" />
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
      [class.cb-is-invalid]="fieldInvalid()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <input
        #field
        class="cb-datepicker__field"
        [id]="inputId()"
        type="text"
        [readOnly]="!editable()"
        role="combobox"
        aria-haspopup="dialog"
        [attr.aria-expanded]="open()"
        [attr.aria-invalid]="fieldInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [attr.autocomplete]="editable() ? 'off' : null"
        [value]="fieldText()"
        [placeholder]="placeholder() || (editable() ? formatHint() : '')"
        [disabled]="isDisabled()"
        [required]="fieldState.required()"
        (click)="onFieldClick()"
        (input)="draft.set($any($event.target).value)"
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
        [class.cb-datepicker__panel--multi]="panelView() === 'date' && monthCount() > 1"
        [class.cb-datepicker__panel--presets]="presetItems().length > 0"
        role="dialog"
        aria-modal="false"
        [attr.aria-label]="panelLabel()"
        tabindex="-1"
        (keydown)="onPanelKeydown($event)"
      >
        @if (presetItems().length) {
          <div class="cb-datepicker__presets" role="group" [attr.aria-label]="t().datePresets">
            @for (item of presetItems(); track $index) {
              <button
                type="button"
                class="cb-datepicker__preset"
                [class.cb-is-selected]="item.selected"
                [attr.aria-pressed]="item.selected"
                [disabled]="item.disabled"
                (click)="applyPreset(item.value)"
              >
                {{ item.label }}
              </button>
            }
          </div>
        }
        <div class="cb-datepicker__main">
        @switch (panelView()) {
          @case ('date') {
            <div class="cb-datepicker__months">
              @for (m of months(); track m.date.getTime(); let first = $first, last = $last) {
                <div class="cb-datepicker__month">
                  <div class="cb-datepicker__header">
                    @if (first) {
                      <button type="button" class="cb-datepicker__nav" [attr.aria-label]="t().previousMonth" (click)="shiftMonth(-1)">
                        <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
                      </button>
                    } @else {
                      <span class="cb-datepicker__nav-spacer"></span>
                    }
                    <button
                      type="button"
                      class="cb-datepicker__title"
                      [attr.aria-label]="m.title + '. ' + t().chooseMonth"
                      (click)="showMonths(m.date)"
                    >{{ m.title }}</button>
                    @if (last) {
                      <button type="button" class="cb-datepicker__nav" [attr.aria-label]="t().nextMonth" (click)="shiftMonth(1)">
                        <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
                      </button>
                    } @else {
                      <span class="cb-datepicker__nav-spacer"></span>
                    }
                  </div>

                  <table
                    class="cb-datepicker__grid"
                    role="grid"
                    [attr.aria-label]="m.title"
                    [class.cb-datepicker__grid--range]="isRange()"
                    (mouseleave)="hoverDate.set(null)"
                  >
                    <thead>
                      <tr>
                        @for (wd of weekdays(); track wd.index) {
                          <th class="cb-datepicker__weekday" scope="col" [attr.abbr]="wd.long">{{ wd.short }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (week of m.weeks; track week[0].date.getTime()) {
                        <tr>
                          @for (cell of week; track cell.date.getTime()) {
                            @if (cell.hidden) {
                              <td class="cb-datepicker__cell" role="gridcell"></td>
                            } @else {
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
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
          @default {
            <div class="cb-datepicker__header">
              <button
                type="button"
                class="cb-datepicker__nav"
                [attr.aria-label]="panelView() === 'month' ? t().previousYear : t().previousDecade"
                (click)="shiftPage(-1)"
              >
                <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
              </button>
              @if (panelView() === 'month') {
                <button type="button" class="cb-datepicker__title" [attr.aria-label]="unitTitle() + '. ' + t().chooseYear" (click)="showYears()">
                  {{ unitTitle() }}
                </button>
              } @else {
                <span class="cb-datepicker__title cb-datepicker__title--static">{{ unitTitle() }}</span>
              }
              <button
                type="button"
                class="cb-datepicker__nav"
                [attr.aria-label]="panelView() === 'month' ? t().nextYear : t().nextDecade"
                (click)="shiftPage(1)"
              >
                <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
              </button>
            </div>
            <div class="cb-datepicker__units" role="grid" [attr.aria-label]="unitTitle()" (mouseleave)="hoverDate.set(null)">
              @for (row of unitRows(); track $index) {
                <div class="cb-datepicker__unit-row" role="row">
                  @for (cell of row; track cell.date.getTime()) {
                    <div
                      class="cb-datepicker__cell cb-datepicker__unit-cell"
                      role="gridcell"
                      [class.cb-is-in-range]="cell.inRange"
                      [class.cb-is-range-start]="cell.rangeStart"
                      [class.cb-is-range-end]="cell.rangeEnd"
                      [attr.aria-selected]="cell.selected || cell.inRange"
                    >
                      <button
                        type="button"
                        class="cb-datepicker__unit"
                        [class.cb-is-other-month]="cell.outside"
                        [class.cb-is-today]="cell.current"
                        [class.cb-is-selected]="cell.selected"
                        [class.cb-is-active]="cell.active"
                        [class.cb-is-disabled]="cell.disabled"
                        [attr.aria-disabled]="cell.disabled || null"
                        [attr.aria-label]="cell.label"
                        [attr.aria-current]="cell.current ? (panelView() === 'month' ? 'date' : 'true') : null"
                        [attr.tabindex]="cell.active ? 0 : -1"
                        (click)="selectUnit(cell.date)"
                        (mouseenter)="hoverDate.set(cell.date)"
                      >
                        {{ cell.text }}
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }

        @if (isRange()) {
          <span class="cb-datepicker__sr" aria-live="polite">{{ choosingEnd() ? t().chooseEndDate : '' }}</span>
        }

        @for (row of timeRows(); track row.target) {
          <div class="cb-datepicker__time" role="group" [attr.aria-label]="row.label">
            @if (row.caption) {
              <span class="cb-datepicker__time-caption" aria-hidden="true">{{ row.caption }}</span>
            }
            <label class="cb-datepicker__time-field">
              <span class="cb-datepicker__sr">{{ t().hours }}</span>
              <input
                type="number"
                class="cb-datepicker__time-input"
                [min]="hourFormat() === '12' ? 1 : 0"
                [max]="hourFormat() === '12' ? 12 : 23"
                [value]="displayHour(row.target)"
                [disabled]="!row.enabled"
                (input)="setHour(row.target, $any($event.target).value)"
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
                [value]="pad(timeOf(row.target).minutes)"
                [disabled]="!row.enabled"
                (input)="setMinute(row.target, $any($event.target).value)"
              />
            </label>
            @if (hourFormat() === '12') {
              <button
                type="button"
                class="cb-datepicker__period"
                [attr.aria-label]="t().period"
                [disabled]="!row.enabled"
                (click)="togglePeriod(row.target)"
              >
                {{ timeOf(row.target).hours < 12 ? 'AM' : 'PM' }}
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
      </div>
    </ng-template>

    @if (typedInvalid()) {
      <p class="cb-datepicker__message cb-datepicker__message--error" [id]="errorId()" role="alert">
        {{ invalidMessage() }}
      </p>
    } @else if (fieldState.invalid() && error()) {
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
  /** Cómo se marca un campo obligatorio u opcional; por defecto el global de `provideCaribeNG`. */
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  protected readonly t = injectCbTranslation();
  private readonly injector = inject(Injector);
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly inputId = input<string>(`cb-datepicker-${++nextUid}`);
  /** Locale BCP 47 para nombres y formato (por defecto el del navegador). */
  readonly locale = input<string | undefined>(undefined);
  /** Primer día de la semana: 0 = domingo, 1 = lunes. */
  readonly firstDayOfWeek = input<number>(0);
  /** Fecha mínima elegible (incluida). */
  readonly minDate = input<Date | null>(null);
  /** Fecha máxima elegible (incluida). */
  readonly maxDate = input<Date | null>(null);
  /** `single` (una fecha) o `range` (inicio y fin). */
  readonly selectionMode = input<'single' | 'range'>('single');
  /** Qué se elige: un día (`date`), un mes (`month`, día 1) o un año (`year`, 1 de enero). */
  readonly view = input<CbDatepickerView>('date');
  /** Meses visibles a la vez (vista de días). Por defecto 2 en rangos y 1 en fecha simple. */
  readonly numberOfMonths = input<number | undefined>(undefined);
  /** Añade horas y minutos (en rangos, del inicio y del fin). Solo con `view="date"`. */
  readonly showTime = input<boolean, unknown>(false, { transform: toBoolean });
  /** Formato de la hora: 24 h o 12 h (AM/PM). */
  readonly hourFormat = input<'24' | '12'>('24');
  /** Paso de los minutos (p. ej. 15). */
  readonly stepMinute = input<number>(1);
  /**
   * Formato de la fecha con la sintaxis de PrimeNG: `d`, `dd`, `o`, `oo`, `D`, `DD`,
   * `m`, `mm`, `M`, `MM`, `y`, `yy`, `@`, `!` y `'texto'`. Sin él, el campo usa el
   * formato largo del `locale` (o el numérico si es `editable`).
   */
  readonly dateFormat = input<string | undefined>(undefined);
  /** Permite escribir la fecha en el campo con `dateFormat` (Enter o al salir del campo la aplica). */
  readonly editable = input<boolean, unknown>(false, { transform: toBoolean });
  /**
   * Atajos junto al calendario: claves predefinidas (`'last7Days'`, `'thisMonth'`…)
   * u objetos `{ label, value }`. En fecha simple, un atajo de rango elige su inicio.
   */
  readonly presets = input<readonly (CbDatePreset | CbDatePresetKey)[]>([]);

  protected readonly open = signal(false);
  /** Día (o mes, o año) bajo el puntero: previsualiza el rango mientras se elige el final. */
  protected readonly hoverDate = signal<Date | null>(null);
  /** Primer mes mostrado (vista de días) o fecha de referencia del año / la década. */
  private readonly viewDate = signal<Date>(startOfMonth(new Date()));
  /** Día, mes o año con foco dentro del calendario. */
  private readonly activeDate = signal<Date>(stripTime(new Date()));
  /** Vista del panel: puede pasar a meses o años para navegar aunque se elija un día. */
  protected readonly panelView = signal<CbDatepickerView>('date');
  /** Texto escrito en el campo (`editable`) que aún no se ha aplicado. */
  protected readonly draft = signal<string | null>(null);
  /** El texto escrito no es una fecha válida (o elegible). */
  protected readonly typedInvalid = signal(false);
  /** Día del mes que se conserva al navegar por meses y años para volver a los días. */
  private navDay = 1;

  private readonly fieldRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly isRange = computed(() => this.selectionMode() === 'range');
  /** La hora solo tiene sentido al elegir días. */
  private readonly withTime = computed(() => this.showTime() && this.view() === 'date');
  protected readonly monthCount = computed(() => clamp(this.numberOfMonths() ?? (this.isRange() ? 2 : 1), 1, 4));
  protected readonly fieldInvalid = computed(() => this.fieldState.invalid() || this.typedInvalid());

  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly describedBy = computed(() => {
    if (this.typedInvalid() || (this.fieldState.invalid() && this.error())) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  ];

  /** La fecha (modo simple) o `null`. */
  private readonly single = computed(() => (this.isRange() ? null : this.value()));
  /** El rango (modo rango) o `null`. */
  private readonly activeRange = computed(() => (this.isRange() ? this.range() : null));
  /** Hay fecha inicial y falta la final. */
  protected readonly choosingEnd = computed(() => !!this.activeRange() && this.activeRange()![1] === null);
  /** Hay algo elegido (para mostrar "Limpiar"). */
  protected readonly hasValue = computed(() => !!this.single() || !!this.activeRange());

  // --- Formato ------------------------------------------------------------------------
  private readonly names = computed(() => dateNames(this.locale()));
  /** Formato con el que se escribe y se lee el campo (si hay `dateFormat` o es editable). */
  private readonly pattern = computed(
    () => this.dateFormat() ?? (this.editable() ? localeDateFormat(this.locale(), this.view()) : null),
  );
  /** Ayuda del formato para el placeholder y el error (`dd/mm/yyyy`, con la hora si la hay). */
  protected readonly formatHint = computed(() => {
    const pattern = this.pattern();
    if (!pattern) return '';
    const date = pattern.replace(/yy/g, 'yyyy').replace(/(^|[^y])y(?!y)/g, '$1yy').replace(/'/g, '');
    return this.withTime() ? `${date} ${this.hourFormat() === '12' ? 'hh:mm AM' : 'HH:mm'}` : date;
  });
  protected readonly invalidMessage = computed(() => cbFormat(this.t().invalidDate, this.formatHint()));

  private formatOne(date: Date): string {
    const pattern = this.pattern();
    let text: string;
    if (pattern) {
      text = formatDate(date, pattern, this.names());
    } else {
      const options: Intl.DateTimeFormatOptions =
        this.view() === 'year' ? { year: 'numeric' } : this.view() === 'month' ? { month: 'long', year: 'numeric' } : { dateStyle: 'medium' };
      text = new Intl.DateTimeFormat(this.locale(), options).format(date);
    }
    return this.withTime() ? `${text} ${this.timeText(date)}` : text;
  }

  private timeText(date: Date): string {
    const h = date.getHours();
    const m = this.pad(date.getMinutes());
    return this.hourFormat() === '12' ? `${this.pad(h % 12 || 12)}:${m} ${h < 12 ? 'AM' : 'PM'}` : `${this.pad(h)}:${m}`;
  }

  protected readonly display = computed(() => {
    const range = this.activeRange();
    if (range) return `${this.formatOne(range[0])} – ${range[1] ? this.formatOne(range[1]) : ''}`.trim();
    const single = this.single();
    return single ? this.formatOne(single) : '';
  });
  protected readonly fieldText = computed(() => this.draft() ?? this.display());

  // --- Vista de días -------------------------------------------------------------------
  private monthTitle(date: Date): string {
    const label = new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  protected readonly panelLabel = computed(() => (this.panelView() === 'date' ? this.monthTitle(this.viewDate()) : this.unitTitle()));

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

  /** Inicio y fin del rango (o del rango en curso hasta el puntero), ordenados y en la unidad `unit`. */
  private rangeBounds(unit: CbDatepickerView): [Date | null, Date | null, boolean] {
    const range = this.activeRange();
    if (!range) return [null, null, false];
    const start = startOf(range[0], unit);
    // Mientras se elige el fin, el rango llega hasta el elemento bajo el puntero.
    const endSource = range[1] ?? (this.choosingEnd() ? this.hoverDate() : null);
    const end = endSource ? startOf(endSource, unit) : null;
    const [from, to] = start && end && end < start ? [end, start] : [start, end];
    return [from, to, !!range[1]];
  }

  protected readonly months = computed(() => {
    const count = this.monthCount();
    const fullDate = new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' });
    const today = stripTime(new Date());
    const single = this.single() ? stripTime(this.single()!) : null;
    const [from, to, complete] = this.rangeBounds('date');
    const active = this.activeDate();
    const first = this.firstDayOfWeek();

    return Array.from({ length: count }, (_, i) => {
      const monthStart = addMonths(this.viewDate(), i);
      const offset = (monthStart.getDay() - first + 7) % 7;
      const cursor = new Date(monthStart);
      cursor.setDate(monthStart.getDate() - offset);
      const month = monthStart.getMonth();
      const weeks: DayCell[][] = [];
      for (let w = 0; w < 6; w++) {
        const row: DayCell[] = [];
        for (let d = 0; d < 7; d++) {
          const date = new Date(cursor);
          const otherMonth = date.getMonth() !== month;
          const hidden = count > 1 && otherMonth;
          const isStart = !!from && isSameDay(date, from);
          const isEnd = !!to && isSameDay(date, to);
          row.push({
            date,
            day: date.getDate(),
            label: fullDate.format(date),
            otherMonth,
            hidden,
            today: isSameDay(date, today),
            selected: (single != null && isSameDay(date, single)) || isStart || (isEnd && complete),
            rangeStart: isStart && !!to,
            rangeEnd: isEnd && !!from,
            inRange: !!from && !!to && date > from && date < to,
            disabled: this.isDisabledIn(date, 'date'),
            // Con varios meses, el foco va al día dentro de su mes (no a la copia de otro mes).
            active: !hidden && isSameDay(date, active) && (count === 1 || !otherMonth),
          });
          cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(row);
      }
      return { date: monthStart, title: this.monthTitle(monthStart), weeks };
    });
  });

  // --- Vistas de meses y años ----------------------------------------------------------------
  /** Título de la vista de meses (el año) o de años (la década). */
  protected readonly unitTitle = computed(() => {
    const year = this.viewDate().getFullYear();
    if (this.panelView() === 'month') return String(year);
    const start = year - (year % 10);
    return `${start} – ${start + 9}`;
  });

  protected readonly unitRows = computed<UnitCell[][]>(() => {
    const view = this.panelView();
    const year = this.viewDate().getFullYear();
    const active = this.activeDate();
    const now = new Date();
    const unit = view === 'month' ? 'month' : 'year';
    const single = this.single();
    const [from, to, complete] = this.rangeBounds(unit);
    const names = this.names();
    const dates =
      view === 'month'
        ? Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
        : Array.from({ length: 12 }, (_, i) => new Date(year - (year % 10) - 1 + i, 0, 1));
    const cells = dates.map<UnitCell>((date, i) => {
      const same = (a: Date | null | undefined) => !!a && sameUnit(a, date, unit);
      const isStart = same(from);
      const isEnd = same(to);
      return {
        date,
        text: view === 'month' ? names.monthShort[i] : String(date.getFullYear()),
        label: view === 'month' ? `${names.monthLong[i]} ${year}` : String(date.getFullYear()),
        outside: view === 'year' && (i === 0 || i === 11),
        current: same(now),
        selected: same(single) || isStart || (isEnd && complete),
        rangeStart: isStart && !!to,
        rangeEnd: isEnd && !!from,
        inRange: !!from && !!to && date > from && date < to,
        disabled: this.isDisabledIn(date, unit),
        active: sameUnit(active, date, unit),
      };
    });
    return [0, 1, 2, 3].map((r) => cells.slice(r * 3, r * 3 + 3));
  });

  // --- Atajos -------------------------------------------------------------------------
  protected readonly presetItems = computed(() => {
    const unit = this.view();
    const current = this.isRange() ? this.activeRange() : this.single();
    return this.presets().map((preset) => {
      const label = typeof preset === 'string' ? this.presetLabel(preset) : preset.label;
      const raw = typeof preset === 'string' ? presetRange(preset) : typeof preset.value === 'function' ? preset.value() : preset.value;
      const value = this.presetValue(raw);
      const [start, end] = Array.isArray(value) ? value : [value, value];
      const selected = Array.isArray(value)
        ? Array.isArray(current) && !!current[1] && sameUnit(current[0], value[0], unit) && sameUnit(current[1], value[1]!, unit)
        : current instanceof Date && sameUnit(current, value as Date, unit);
      const disabled = this.isDisabledIn(start, unit) || (!!end && this.isDisabledIn(end, unit));
      return { label, value, selected, disabled };
    });
  });

  private presetLabel(key: CbDatePresetKey): string {
    const t = this.t();
    const labels: Record<CbDatePresetKey, string> = {
      today: t.today,
      yesterday: t.presetYesterday,
      last7Days: t.presetLast7Days,
      last30Days: t.presetLast30Days,
      thisMonth: t.presetThisMonth,
      lastMonth: t.presetLastMonth,
      thisYear: t.presetThisYear,
      lastYear: t.presetLastYear,
    };
    return labels[key];
  }

  /** Ajusta el atajo al modo (fecha o rango), a la unidad de `view` y, con hora, al día completo. */
  private presetValue(raw: Date | CbDateRange): Date | CbDateRange {
    const unit = this.view();
    if (!this.isRange()) return startOf(Array.isArray(raw) ? raw[0] : (raw as Date), unit);
    const [a, b] = Array.isArray(raw) ? [raw[0], raw[1] ?? raw[0]] : [raw as Date, raw as Date];
    const start = startOf(a, unit);
    const end = startOf(b, unit);
    if (this.withTime()) end.setHours(23, 59);
    return [start, end];
  }

  /** Aplica un atajo y cierra (con hora, el panel sigue abierto para ajustarla). */
  protected applyPreset(value: Date | CbDateRange): void {
    this.commit(Array.isArray(value) ? ([value[0], value[1]] as CbDateRange) : new Date(value as Date));
    const anchor = Array.isArray(value) ? value[0] : (value as Date);
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(startOf(anchor, this.view()));
    this.panelView.set(this.view());
    if (!this.withTime()) this.close();
  }

  // --- Hora --------------------------------------------------------------------------
  protected readonly timeRows = computed(() => {
    if (!this.withTime()) return [];
    if (!this.isRange()) return [{ target: 'single' as TimeTarget, label: `${this.t().hours} / ${this.t().minutes}`, caption: '', enabled: true }];
    const range = this.activeRange();
    return [
      { target: 'start' as TimeTarget, label: this.t().startTime, caption: this.t().startTime, enabled: !!range },
      { target: 'end' as TimeTarget, label: this.t().endTime, caption: this.t().endTime, enabled: !!range?.[1] },
    ];
  });

  private dateOf(target: TimeTarget): Date | null {
    if (target === 'single') return this.single();
    const range = this.activeRange();
    return (target === 'start' ? range?.[0] : range?.[1]) ?? null;
  }

  /** Hora y minutos de la fecha (o 00:00). */
  protected timeOf(target: TimeTarget): { hours: number; minutes: number } {
    const d = this.dateOf(target);
    return { hours: d?.getHours() ?? 0, minutes: d?.getMinutes() ?? 0 };
  }

  protected displayHour(target: TimeTarget): string {
    const h = this.timeOf(target).hours;
    return this.pad(this.hourFormat() === '12' ? h % 12 || 12 : h);
  }

  constructor() {
    // Al abrir o cambiar de vista, enfoca el elemento activo.
    effect(() => {
      this.panelView();
      if (this.open()) this.focusActive();
    });
  }

  private onChange: (value: CbDatepickerValue) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: CbDatepickerValue): void {
    const v = normalizeValue(value);
    if (Array.isArray(v)) this.range.set(v as CbDateRange);
    else this.value.set(v as Date | null);
    this.draft.set(null);
    this.typedInvalid.set(false);
    const anchor = (Array.isArray(v) ? v[0] : (v as Date | null)) ?? new Date();
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(startOf(anchor, this.view()));
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

  protected onFieldClick(): void {
    // Si se puede escribir, el clic coloca el cursor; el calendario se abre con el botón o Alt + ↓.
    if (!this.editable()) this.toggle();
  }

  private openPanel(): void {
    const anchor = this.activeRange()?.[0] ?? this.single() ?? new Date();
    this.panelView.set(this.view());
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(startOf(anchor, this.view()));
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
    if (this.editable()) this.applyDraft();
    if (!this.open()) this.onTouched();
  }

  // --- Selección -------------------------------------------------------------
  /** Elige un valor en la unidad de `view` (día, mes o año), en modo simple o rango. */
  private pick(date: Date): void {
    const unit = this.view();
    if (this.isDisabledIn(date, unit)) return;
    const picked = startOf(date, unit);
    this.activeDate.set(picked);

    if (this.isRange()) {
      const range = this.activeRange();
      if (!range || range[1]) {
        // Primer clic: inicio (con la hora que tuviera); el panel sigue abierto para elegir el fin.
        if (this.withTime() && range) picked.setHours(range[0].getHours(), range[0].getMinutes());
        this.commit([picked, null]);
        return;
      }
      const [start] = range;
      if (this.withTime()) {
        const end = range[1] as Date | null;
        picked.setHours(end?.getHours() ?? 0, end?.getMinutes() ?? 0);
      }
      this.commit(picked < startOf(start, unit) ? [picked, start] : [start, picked]);
      // Con hora el panel sigue abierto para ajustarla.
      if (!this.withTime()) this.close();
      return;
    }

    if (this.withTime()) {
      // Con hora, se conserva la hora elegida y el panel sigue abierto.
      const { hours, minutes } = this.timeOf('single');
      picked.setHours(hours, minutes);
      this.commit(picked);
      return;
    }

    this.commit(picked);
    this.close();
  }

  protected selectDate(date: Date): void {
    this.pick(date);
  }

  /** Clic en un mes o un año: lo elige (si es la unidad de `view`) o baja a la vista siguiente. */
  protected selectUnit(date: Date): void {
    const view = this.panelView();
    if (view === this.view()) {
      this.pick(date);
      return;
    }
    if (view === 'year') {
      // Navegación: del año a sus meses.
      this.viewDate.set(new Date(date.getFullYear(), this.viewDate().getMonth(), 1));
      this.activeDate.set(new Date(date.getFullYear(), this.activeDate().getMonth(), 1));
      this.panelView.set('month');
      return;
    }
    // Navegación: del mes a sus días (mismo día del mes, ajustado al último si no existe).
    const day = this.navDay;
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    this.viewDate.set(startOfMonth(date));
    this.activeDate.set(new Date(date.getFullYear(), date.getMonth(), Math.min(day, last)));
    this.panelView.set('date');
  }

  /** Del título de un mes a la vista de meses de su año. */
  protected showMonths(month: Date): void {
    this.navDay = this.activeDate().getDate();
    this.viewDate.set(startOfMonth(month));
    this.activeDate.set(startOfMonth(this.isSameMonthShown(this.activeDate()) ? this.activeDate() : month));
    this.panelView.set('month');
  }

  protected showYears(): void {
    this.activeDate.set(new Date(this.activeDate().getFullYear(), 0, 1));
    this.panelView.set('year');
  }

  private isSameMonthShown(date: Date): boolean {
    const first = this.viewDate();
    const last = addMonths(first, this.monthCount() - 1);
    return date >= first && date < addMonths(last, 1);
  }

  protected goToday(): void {
    const today = startOf(new Date(), this.panelView());
    this.viewDate.set(startOfMonth(today));
    this.activeDate.set(today);
    this.focusActive();
  }

  protected clear(): void {
    this.commit(null);
    this.close();
  }

  protected shiftMonth(delta: number): void {
    this.viewDate.set(addMonths(this.viewDate(), delta));
  }

  /** Año anterior / siguiente (vista de meses) o década (vista de años). */
  protected shiftPage(delta: number): void {
    const years = this.panelView() === 'month' ? delta : delta * 10;
    this.viewDate.set(addMonths(this.viewDate(), years * 12));
  }

  // --- Hora ------------------------------------------------------------------
  protected setHour(target: TimeTarget, raw: string): void {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    let hours: number;
    if (this.hourFormat() === '12') {
      const h12 = clamp(n, 1, 12) % 12;
      hours = this.timeOf(target).hours < 12 ? h12 : h12 + 12;
    } else {
      hours = clamp(n, 0, 23);
    }
    this.setTime(target, hours, this.timeOf(target).minutes);
  }

  protected setMinute(target: TimeTarget, raw: string): void {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) this.setTime(target, this.timeOf(target).hours, clamp(n, 0, 59));
  }

  protected togglePeriod(target: TimeTarget): void {
    const { hours, minutes } = this.timeOf(target);
    this.setTime(target, (hours + 12) % 24, minutes);
  }

  private setTime(target: TimeTarget, hours: number, minutes: number): void {
    if (target === 'single') {
      const base = new Date(this.single() ?? this.activeDate());
      base.setHours(hours, minutes, 0, 0);
      this.commit(base);
      return;
    }
    const range = this.activeRange();
    if (!range) return;
    const [start, end] = range;
    if (target === 'start') {
      const next = new Date(start);
      next.setHours(hours, minutes, 0, 0);
      this.commit([next, end]);
    } else if (end) {
      const next = new Date(end);
      next.setHours(hours, minutes, 0, 0);
      this.commit([start, next]);
    }
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // --- Campo editable ---------------------------------------------------------
  /** Aplica lo escrito: fecha válida y elegible → valor; vacío → `null`; si no, marca el error. */
  private applyDraft(): void {
    const text = this.draft();
    if (text === null) return;
    if (!text.trim()) {
      this.draft.set(null);
      this.typedInvalid.set(false);
      if (this.hasValue()) this.commit(null);
      return;
    }
    let parsed: CbDatepickerValue = null;
    if (this.isRange()) {
      const parts = text.split(/\s+[–-]\s+/);
      const start = this.parseOne(parts[0] ?? '');
      const end = parts[1] ? this.parseOne(parts[1]) : null;
      if (start && (parts.length === 1 || end)) parsed = end && end < start ? [end, start] : [start, end];
    } else {
      parsed = this.parseOne(text);
    }
    if (!parsed) {
      this.typedInvalid.set(true);
      return;
    }
    this.typedInvalid.set(false);
    this.draft.set(null);
    this.commit(parsed);
    const anchor = Array.isArray(parsed) ? parsed[0] : parsed;
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(startOf(anchor, this.view()));
  }

  /** Lee una fecha (y la hora, si `showTime`) con el formato del campo. */
  private parseOne(text: string): Date | null {
    const pattern = this.pattern();
    if (!pattern) return null;
    let datePart = text.trim();
    let hours = 0;
    let minutes = 0;
    if (this.withTime()) {
      const time = /\s+(\d{1,2}):(\d{2})(?:\s*([AaPp])\.?\s?[Mm]\.?)?$/.exec(datePart);
      if (time) {
        datePart = datePart.slice(0, time.index);
        hours = Number(time[1]);
        minutes = Number(time[2]);
        if (time[3]) {
          if (hours < 1 || hours > 12) return null;
          hours = (hours % 12) + (time[3].toLowerCase() === 'p' ? 12 : 0);
        }
        if (hours > 23 || minutes > 59) return null;
      }
    }
    const date = parseDate(datePart, pattern, this.names());
    if (!date) return null;
    const value = startOf(date, this.view());
    if (this.isDisabledIn(value, this.view())) return null;
    value.setHours(hours, minutes);
    return value;
  }

  // --- Teclado ---------------------------------------------------------------
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (this.editable()) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.applyDraft();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.applyDraft();
        this.openPanel();
      } else if (event.key === 'Escape' && this.draft() !== null) {
        event.preventDefault();
        this.draft.set(null);
        this.typedInvalid.set(false);
      }
      return;
    }
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      // En la vista de meses o años abierta para navegar, Escape vuelve a la vista anterior.
      const view = this.panelView();
      if (view !== this.view()) {
        this.panelView.set(view === 'year' && this.view() === 'date' ? 'month' : this.view());
        return;
      }
      this.close();
      return;
    }
    const target = event.target as HTMLElement;
    if (target.classList?.contains('cb-datepicker__unit')) {
      this.onUnitKeydown(event);
      return;
    }
    // Solo los días se mueven con las flechas (no los campos de hora ni los botones).
    if (!target.classList?.contains('cb-datepicker__day')) return;
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
    // Si el día queda fuera de los meses visibles, se desplaza la vista lo justo.
    const first = this.viewDate();
    const last = addMonths(first, this.monthCount() - 1);
    if (next < first) this.viewDate.set(startOfMonth(next));
    else if (next >= addMonths(last, 1)) this.viewDate.set(addMonths(startOfMonth(next), -(this.monthCount() - 1)));
    this.focusActive();
  }

  /** Flechas en la cuadrícula de meses o años (3 columnas). */
  private onUnitKeydown(event: KeyboardEvent): void {
    const view = this.panelView();
    const active = this.activeDate();
    const step = (n: number) => (view === 'month' ? addMonths(active, n) : new Date(active.getFullYear() + n, 0, 1));
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft': next = step(-1); break;
      case 'ArrowRight': next = step(1); break;
      case 'ArrowUp': next = step(-3); break;
      case 'ArrowDown': next = step(3); break;
      case 'PageUp': next = step(view === 'month' ? -12 : -10); break;
      case 'PageDown': next = step(view === 'month' ? 12 : 10); break;
      case 'Home': next = view === 'month' ? new Date(active.getFullYear(), 0, 1) : new Date(active.getFullYear() - (active.getFullYear() % 10), 0, 1); break;
      case 'End': next = view === 'month' ? new Date(active.getFullYear(), 11, 1) : new Date(active.getFullYear() - (active.getFullYear() % 10) + 9, 0, 1); break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectUnit(active);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.activeDate.set(next);
    if (this.choosingEnd()) this.hoverDate.set(next);
    const shown = this.viewDate().getFullYear();
    const visible = view === 'month' ? next.getFullYear() === shown : Math.floor(next.getFullYear() / 10) === Math.floor(shown / 10);
    if (!visible) this.viewDate.set(new Date(next.getFullYear(), view === 'month' ? 0 : this.viewDate().getMonth(), 1));
    this.focusActive();
  }

  /** Enfoca el elemento activo tras el render: el panel vive en un overlay que se pinta en el ciclo siguiente. */
  private focusActive(): void {
    afterNextRender(
      () =>
        this.panelRef()
          ?.nativeElement.querySelector<HTMLButtonElement>('.cb-datepicker__day.cb-is-active, .cb-datepicker__unit.cb-is-active')
          ?.focus(),
      { injector: this.injector },
    );
  }

  // --- Helpers ---------------------------------------------------------------
  /** Guarda en el modelo del modo activo y avisa a Angular Forms. */
  private commit(value: CbDatepickerValue): void {
    this.draft.set(null);
    this.typedInvalid.set(false);
    if (this.isRange()) this.range.set(value as CbDateRange | null);
    else this.value.set(value as Date | null);
    this.onChange(value);
  }

  /** El día, mes o año queda entero fuera de [minDate, maxDate]. */
  private isDisabledIn(date: Date, unit: CbDatepickerView): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    const start = startOf(date, unit);
    const end = unit === 'date' ? start : unit === 'month' ? addDays(addMonths(start, 1), -1) : new Date(start.getFullYear(), 11, 31);
    if (min && end < stripTime(min)) return true;
    if (max && start > stripTime(max)) return true;
    return false;
  }
}

/** Rango de un atajo predefinido, relativo a hoy. */
function presetRange(key: CbDatePresetKey): CbDateRange {
  const today = stripTime(new Date());
  const y = today.getFullYear();
  const m = today.getMonth();
  switch (key) {
    case 'today':
      return [today, today];
    case 'yesterday':
      return [addDays(today, -1), addDays(today, -1)];
    case 'last7Days':
      return [addDays(today, -6), today];
    case 'last30Days':
      return [addDays(today, -29), today];
    case 'thisMonth':
      return [new Date(y, m, 1), new Date(y, m + 1, 0)];
    case 'lastMonth':
      return [new Date(y, m - 1, 1), new Date(y, m, 0)];
    case 'thisYear':
      return [new Date(y, 0, 1), new Date(y, 11, 31)];
    case 'lastYear':
      return [new Date(y - 1, 0, 1), new Date(y - 1, 11, 31)];
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
/** Inicio del día, del mes o del año. */
function startOf(d: Date, unit: CbDatepickerView): Date {
  return unit === 'year' ? new Date(d.getFullYear(), 0, 1) : unit === 'month' ? startOfMonth(d) : stripTime(d);
}
function sameUnit(a: Date, b: Date, unit: CbDatepickerView): boolean {
  return startOf(a, unit).getTime() === startOf(b, unit).getTime();
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
