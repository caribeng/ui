import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import type { CbSize } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

interface DayCell {
  date: Date;
  day: number;
  otherMonth: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  active: boolean;
}

/**
 * Selector de fecha de CaribeNG. Campo de solo lectura que abre un calendario
 * sobre CDK Overlay, con navegación por teclado y rango min/max. Integrado con
 * Angular Forms vía `ControlValueAccessor`. El modelo es `Date | null`.
 *
 * @example
 * ```html
 * <cb-datepicker formControlName="fecha" locale="es-CO"
 *                [minDate]="hoy" placeholder="Elige una fecha" />
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
        @if (required()) {
          <span class="cb-datepicker__required" aria-hidden="true">*</span>
        }
      </label>
    }

    <div
      #trigger
      class="cb-datepicker"
      [class]="'cb-datepicker--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="invalid()"
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
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [value]="display()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [required]="required()"
        (click)="toggle()"
        (keydown)="onFieldKeydown($event)"
        (blur)="onBlur()"
      />
      <button
        type="button"
        class="cb-datepicker__btn"
        tabindex="-1"
        aria-label="Abrir calendario"
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
          <button
            type="button"
            class="cb-datepicker__nav"
            aria-label="Mes anterior"
            (click)="shiftMonth(-1)"
          >
            <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
          </button>
          <span class="cb-datepicker__title" aria-live="polite">{{ monthYearLabel() }}</span>
          <button
            type="button"
            class="cb-datepicker__nav"
            aria-label="Mes siguiente"
            (click)="shiftMonth(1)"
          >
            <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
          </button>
        </div>

        <table class="cb-datepicker__grid" role="grid">
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
                  <td class="cb-datepicker__cell" role="gridcell">
                    <button
                      type="button"
                      class="cb-datepicker__day"
                      [class.cb-is-other-month]="cell.otherMonth"
                      [class.cb-is-today]="cell.today"
                      [class.cb-is-selected]="cell.selected"
                      [class.cb-is-active]="cell.active"
                      [disabled]="cell.disabled"
                      [attr.tabindex]="cell.active ? 0 : -1"
                      [attr.aria-selected]="cell.selected"
                      [attr.aria-current]="cell.today ? 'date' : null"
                      (click)="selectDate(cell.date)"
                    >
                      {{ cell.day }}
                    </button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>

        <div class="cb-datepicker__footer">
          <button type="button" class="cb-datepicker__today" (click)="goToday()">Hoy</button>
          @if (value()) {
            <button type="button" class="cb-datepicker__clear" (click)="clear()">Limpiar</button>
          }
        </div>
      </div>
    </ng-template>

    @if (invalid() && error()) {
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
  /** Fecha seleccionada (two-way opcional fuera de Angular Forms). */
  readonly value = model<Date | null>(null);

  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  readonly size = input<CbSize>('md');
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
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

  protected readonly open = signal(false);
  /** Primer día del mes mostrado. */
  private readonly viewDate = signal<Date>(startOfMonth(new Date()));
  /** Día con foco dentro del calendario. */
  private readonly activeDate = signal<Date>(stripTime(new Date()));

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly fieldRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly describedBy = computed(() => {
    if (this.invalid() && this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  protected readonly display = computed(() => {
    const v = this.value();
    if (!v) return '';
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'medium' }).format(v);
  });

  protected readonly monthYearLabel = computed(() => {
    const label = new Intl.DateTimeFormat(this.locale(), {
      month: 'long',
      year: 'numeric',
    }).format(this.viewDate());
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

    const today = stripTime(new Date());
    const selected = this.value() ? stripTime(this.value() as Date) : null;
    const active = this.activeDate();
    const month = view.getMonth();

    const weeks: DayCell[][] = [];
    const cursor = new Date(gridStart);
    for (let w = 0; w < 6; w++) {
      const row: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        row.push({
          date,
          day: date.getDate(),
          otherMonth: date.getMonth() !== month,
          today: isSameDay(date, today),
          selected: selected != null && isSameDay(date, selected),
          disabled: this.isDisabledDate(date),
          active: isSameDay(date, active),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(row);
    }
    return weeks;
  });

  constructor() {
    // Al abrir, sincroniza vista y día activo con la selección (o hoy) y enfoca.
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.focusActiveDay());
      }
    });
  }

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: Date | null): void {
    const d = value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
    this.value.set(d);
    const anchor = d ?? new Date();
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(stripTime(anchor));
  }
  registerOnChange(fn: (value: Date | null) => void): void {
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
    const anchor = this.value() ?? new Date();
    this.viewDate.set(startOfMonth(anchor));
    this.activeDate.set(stripTime(anchor));
    this.open.set(true);
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
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
    this.value.set(picked);
    this.onChange(picked);
    this.close();
  }

  protected goToday(): void {
    const today = stripTime(new Date());
    this.viewDate.set(startOfMonth(today));
    this.activeDate.set(today);
    this.focusActiveDay();
  }

  protected clear(): void {
    this.value.set(null);
    this.onChange(null);
    this.close();
  }

  protected shiftMonth(delta: number): void {
    this.viewDate.set(addMonths(this.viewDate(), delta));
  }

  // --- Teclado ---------------------------------------------------------------
  protected onFieldKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft': next = addDays(this.activeDate(), -1); break;
      case 'ArrowRight': next = addDays(this.activeDate(), 1); break;
      case 'ArrowUp': next = addDays(this.activeDate(), -7); break;
      case 'ArrowDown': next = addDays(this.activeDate(), 7); break;
      case 'Home': next = startOfWeek(this.activeDate(), this.firstDayOfWeek()); break;
      case 'End': next = addDays(startOfWeek(this.activeDate(), this.firstDayOfWeek()), 6); break;
      case 'PageUp': next = addMonths(this.activeDate(), -1); break;
      case 'PageDown': next = addMonths(this.activeDate(), 1); break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDate(this.activeDate());
        return;
      case 'Escape':
        event.preventDefault();
        this.close();
        return;
      default:
        return;
    }
    event.preventDefault();
    this.activeDate.set(next);
    if (next.getMonth() !== this.viewDate().getMonth() || next.getFullYear() !== this.viewDate().getFullYear()) {
      this.viewDate.set(startOfMonth(next));
    }
    this.focusActiveDay();
  }

  private focusActiveDay(): void {
    queueMicrotask(() => {
      const el = this.panelRef()?.nativeElement.querySelector<HTMLButtonElement>(
        '.cb-datepicker__day.cb-is-active',
      );
      el?.focus();
    });
  }

  // --- Helpers ---------------------------------------------------------------
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
function startOfWeek(d: Date, firstDay: number): Date {
  const offset = (d.getDay() - firstDay + 7) % 7;
  return addDays(d, -offset);
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
