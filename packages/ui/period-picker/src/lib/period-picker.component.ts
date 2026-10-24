import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { cbFieldState, cbFormat, injectCbTranslation, type CbRequiredIndicator, type CbSize } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import {
  fiscalYear,
  fiscalYearOf,
  monthPeriod,
  presetPeriod,
  quarterPeriod,
  touchesClosed,
  type CbPeriod,
  type CbPeriodKind,
  type CbPeriodPreset,
} from './period-model';

type Mode = Exclude<CbPeriodKind, 'range'>;

interface Cell {
  readonly period: CbPeriod;
  readonly text: string;
  readonly label: string;
  readonly closed: boolean;
  readonly disabled: boolean;
}

/** Columnas de la cuadrícula (meses, trimestres y años van de 4 en 4). */
const COLS = 4;

let nextUid = 0;

/**
 * Selector de periodo contable de CaribeNG: mes, trimestre o año (fiscal), con
 * atajos («Mes anterior», «Año a la fecha»…) y periodos cerrados marcados.
 *
 * - `fiscalYearStart` mueve el inicio del año fiscal (trimestres y años incluidos).
 * - `closed` marca meses cerrados con un candado; con `disableClosed` no se eligen
 *   (útil al contabilizar), sin él se pueden consultar (útil en informes).
 * - Funciona con Angular Forms o con `[(value)]`; el valor es un `CbPeriod` con
 *   `from`, `to`, `kind` y `key`.
 *
 * @example
 * ```html
 * <cb-period-picker label="Periodo" [(value)]="periodo" [closed]="cerrados" />
 * ```
 */
@Component({
  selector: 'cb-period-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
  host: { class: 'cb-period-picker-host' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CbPeriodPicker), multi: true }],
  template: `
    @if (label()) {
      <label class="cb-pp__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span [class]="'cb-pp__required cb-pp__required--' + mark.kind" [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'">{{ mark.text }}</span>
        }
      </label>
    }
    <button
      #trigger
      type="button"
      class="cb-pp"
      [class]="'cb-pp--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [id]="inputId()"
      [disabled]="isDisabled()"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <cb-icon class="cb-pp__icon" name="calendar" [size]="16" aria-hidden="true" />
      <span class="cb-pp__text" [class.cb-pp__text--empty]="!value()">{{ value() ? labelOf(value()!) : (placeholder() ?? t().periodPickerPlaceholder) }}</span>
      @if (value() && isClosed(value()!)) {
        <cb-icon class="cb-pp__lock" name="lock" [size]="14" aria-hidden="true" />
        <span class="cb-pp__sr">{{ t().periodClosed }}</span>
      }
      <cb-icon class="cb-pp__caret" name="chevron-down" [size]="16" aria-hidden="true" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="onOutsideClick($event)"
      (detach)="close(false)"
    >
      <div class="cb-pp__panel" role="dialog" [attr.aria-label]="label() || t().periodPickerPlaceholder" (keydown.escape)="close(true)">
        @if (presets().length) {
          <div class="cb-pp__presets" role="group" [attr.aria-label]="t().periodPresets">
            @for (p of presets(); track p) {
              <button type="button" class="cb-pp__preset" [class.cb-is-active]="isPresetActive(p)" [disabled]="presetDisabled(p)" (click)="choosePreset(p)">{{ presetLabel(p) }}</button>
            }
          </div>
        }
        <div class="cb-pp__main">
          @if (modes().length > 1) {
            <div class="cb-pp__modes" role="group" [attr.aria-label]="t().periodKind">
              @for (m of modes(); track m) {
                <button type="button" class="cb-pp__mode" [attr.aria-pressed]="mode() === m" (click)="setMode(m)">{{ modeLabel(m) }}</button>
              }
            </div>
          }
          <div class="cb-pp__nav">
            <button type="button" class="cb-pp__step" [attr.aria-label]="mode() === 'year' ? t().periodPrevYears : t().periodPrevYear" (click)="step(-1)">
              <cb-icon name="chevron-left" [size]="16" aria-hidden="true" />
            </button>
            <span class="cb-pp__title" aria-live="polite">{{ navTitle() }}</span>
            <button type="button" class="cb-pp__step" [attr.aria-label]="mode() === 'year' ? t().periodNextYears : t().periodNextYear" (click)="step(1)">
              <cb-icon name="chevron-right" [size]="16" aria-hidden="true" />
            </button>
          </div>
          <div class="cb-pp__grid" [class.cb-pp__grid--quarters]="mode() === 'quarter'" role="group" [attr.aria-label]="navTitle()" (keydown)="onGridKeydown($event)">
            @for (cell of cells(); track cell.period.key; let i = $index) {
              <button
                type="button"
                class="cb-pp__cell"
                [attr.data-index]="i"
                [class.cb-is-selected]="cell.period.key === value()?.key"
                [class.cb-is-current]="isCurrent(cell.period)"
                [class.cb-pp__cell--closed]="cell.closed"
                [attr.tabindex]="i === focusIndex() ? 0 : -1"
                [attr.aria-pressed]="cell.period.key === value()?.key"
                [attr.aria-disabled]="cell.disabled || null"
                [attr.aria-label]="cell.label"
                (click)="choose(cell)"
              >
                {{ cell.text }}
                @if (cell.closed) {
                  <cb-icon class="cb-pp__cell-lock" name="lock" [size]="11" aria-hidden="true" />
                }
              </button>
            }
          </div>
        </div>
      </div>
    </ng-template>

    @if (fieldState.invalid() && error()) {
      <p class="cb-pp__message cb-pp__message--error" [id]="inputId() + '-error'" role="alert">{{ error() }}</p>
    } @else if (hint()) {
      <p class="cb-pp__message" [id]="inputId() + '-hint'">{{ hint() }}</p>
    }
  `,
  styleUrl: './period-picker.component.css',
})
export class CbPeriodPicker implements ControlValueAccessor {
  protected readonly t = injectCbTranslation();
  private readonly injector = inject(Injector);
  private readonly uid = `cb-period-picker-${++nextUid}`;

  readonly value = model<CbPeriod | null>(null);
  /** Vista de la cuadrícula: mes, trimestre o año. */
  readonly mode = model<Mode>('month');
  /** Vistas disponibles y su orden. */
  readonly modes = input<readonly Mode[]>(['month', 'quarter', 'year']);
  /** Atajos del panel (lista vacía para quitarlos). */
  readonly presets = input<readonly CbPeriodPreset[]>(['thisMonth', 'lastMonth', 'thisQuarter', 'lastQuarter', 'yearToDate', 'thisYear', 'lastYear']);
  /** Mes en que empieza el año fiscal (1 = enero). */
  readonly fiscalYearStart = input<number>(1);
  /** Meses cerrados (`AAAA-MM`): se marcan con un candado. */
  readonly closed = input<readonly string[]>([]);
  /** No deja elegir periodos que incluyan meses cerrados. */
  readonly disableClosed = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Primer y último día que se pueden elegir. */
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /** «Hoy» para los atajos y el periodo actual (por defecto, la fecha del sistema). */
  readonly today = input<Date>(new Date());
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<CbSize>('md');
  readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inputId = input<string>(`cb-period-picker-input-${nextUid}`);

  readonly periodChange = output<CbPeriod | null>();

  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  ];

  protected readonly open = signal(false);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  private readonly startMonth = computed(() => Math.min(12, Math.max(1, this.fiscalYearStart())) - 1);
  private readonly closedSet = computed(() => new Set(this.closed()));
  /** Año (o primer año de la docena, en la vista de años) que muestra la cuadrícula. */
  protected readonly year = linkedSignal(() => {
    const ref = this.value()?.from ?? this.today();
    return this.mode() === 'month' ? ref.getFullYear() : fiscalYearOf(ref, this.startMonth());
  });
  private readonly decadeStart = computed(() => this.year() - (((this.year() % 12) + 12) % 12));

  protected readonly cells = computed<Cell[]>(() => {
    const t = this.t();
    const locale = t.intlLocale;
    const y = this.year();
    const sm = this.startMonth();
    const mk = (period: CbPeriod, text: string): Cell => {
      const closed = touchesClosed(period, this.closedSet());
      const outside = (!!this.min() && period.to < this.day(this.min()!)) || (!!this.max() && period.from > this.day(this.max()!));
      const label = this.labelOf(period) + (closed ? `, ${t.periodClosed}` : '');
      return { period, text, label, closed, disabled: outside || (closed && this.disableClosed()) };
    };
    switch (this.mode()) {
      case 'month': {
        const fmt = new Intl.DateTimeFormat(locale, { month: 'short' });
        return Array.from({ length: 12 }, (_, m) => mk(monthPeriod(y, m), fmt.format(new Date(y, m, 1)).replace('.', '')));
      }
      case 'quarter':
        return [1, 2, 3, 4].map((q) => mk(quarterPeriod(y, q, sm), cbFormat(t.periodQuarterShort, q)));
      case 'year': {
        const start = this.decadeStart();
        return Array.from({ length: 12 }, (_, i) => mk(fiscalYear(start + i, sm), String(start + i)));
      }
    }
  });

  /** Celda con el foco (la elegida, la del periodo actual o la primera). */
  protected readonly focusIndex = linkedSignal(() => {
    const cells = this.cells();
    const selected = cells.findIndex((c) => c.period.key === this.value()?.key);
    if (selected >= 0) return selected;
    const current = cells.findIndex((c) => this.isCurrent(c.period));
    return current >= 0 ? current : 0;
  });

  protected readonly navTitle = computed(() => {
    if (this.mode() === 'year') return `${this.decadeStart()} – ${this.decadeStart() + 11}`;
    if (this.mode() === 'quarter' && this.startMonth() !== 0) return cbFormat(this.t().periodFiscalYear, this.year());
    return String(this.year());
  });

  protected readonly describedBy = computed(() => {
    if (this.fieldState.invalid() && this.error()) return `${this.inputId()}-error`;
    return this.hint() ? `${this.inputId()}-hint` : null;
  });

  private onChange: (value: CbPeriod | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor ----------------------------------------------------------------
  writeValue(value: CbPeriod | null): void {
    this.value.set(value ?? null);
    if (value && value.kind !== 'range' && this.modes().includes(value.kind)) this.mode.set(value.kind);
  }
  registerOnChange(fn: (value: CbPeriod | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  // --- Textos ------------------------------------------------------------------------------
  /** Nombre de un periodo: «Octubre de 2026», «T3 2026», «2026», «1 ene – 23 oct 2026». */
  labelOf(period: CbPeriod): string {
    const t = this.t();
    const locale = t.intlLocale;
    const cap = (s: string) => s.charAt(0).toLocaleUpperCase(locale) + s.slice(1);
    switch (period.kind) {
      case 'month':
        return cap(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(period.from));
      case 'quarter': {
        const [y, q] = period.key.split('-Q');
        return cbFormat(this.startMonth() ? t.periodFiscalQuarter : t.periodQuarter, q, y);
      }
      case 'year':
        return this.startMonth() ? cbFormat(t.periodFiscalYear, period.key) : period.key;
      case 'range': {
        const f = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
        return `${f.format(period.from)} – ${f.format(period.to)}`.replace(/\./g, '');
      }
    }
  }

  protected modeLabel(mode: Mode): string {
    const t = this.t();
    return mode === 'month' ? t.periodMonth : mode === 'quarter' ? t.periodQuarterTab : t.periodYear;
  }

  protected presetLabel(preset: CbPeriodPreset): string {
    const t = this.t();
    const labels: Record<CbPeriodPreset, string> = {
      thisMonth: t.periodThisMonth,
      lastMonth: t.periodLastMonth,
      thisQuarter: t.periodThisQuarter,
      lastQuarter: t.periodLastQuarter,
      yearToDate: t.periodYearToDate,
      thisYear: t.periodThisYear,
      lastYear: t.periodLastYear,
    };
    return labels[preset];
  }

  protected isClosed(period: CbPeriod): boolean {
    return touchesClosed(period, this.closedSet());
  }

  protected isCurrent(period: CbPeriod): boolean {
    const today = this.day(this.today());
    return period.from <= today && today <= period.to;
  }

  protected isPresetActive(preset: CbPeriodPreset): boolean {
    return presetPeriod(preset, this.day(this.today()), this.startMonth()).key === this.value()?.key;
  }

  protected presetDisabled(preset: CbPeriodPreset): boolean {
    return this.disableClosed() && this.isClosed(presetPeriod(preset, this.day(this.today()), this.startMonth()));
  }

  // --- Interacción -------------------------------------------------------------------------
  protected toggle(): void {
    if (this.open()) this.close(false);
    else this.openPanel();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !this.open()) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onOutsideClick(event: MouseEvent): void {
    if (!this.trigger().nativeElement.contains(event.target as Node)) this.close(false);
  }

  protected setMode(mode: Mode): void {
    this.mode.set(mode);
    this.focusCell();
  }

  protected step(delta: number): void {
    this.year.update((y) => y + delta * (this.mode() === 'year' ? 12 : 1));
  }

  protected choose(cell: Cell): void {
    if (cell.disabled) return;
    this.setValue(cell.period);
    this.close(true);
  }

  protected choosePreset(preset: CbPeriodPreset): void {
    this.setValue(presetPeriod(preset, this.day(this.today()), this.startMonth()));
    this.close(true);
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const cells = this.cells();
    const i = this.focusIndex();
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        next = i + 1;
        break;
      case 'ArrowLeft':
        next = i - 1;
        break;
      case 'ArrowDown':
        next = i + COLS;
        break;
      case 'ArrowUp':
        next = i - COLS;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = cells.length - 1;
        break;
      case 'PageUp':
      case 'PageDown':
        event.preventDefault();
        this.step(event.key === 'PageUp' ? -1 : 1);
        this.focusIndex.set(i);
        this.focusCell();
        return;
      default:
        return;
    }
    event.preventDefault();
    // Al salir de la cuadrícula por un lado, pasa al año (o docena) vecino.
    if (next < 0 || next >= cells.length) {
      const dir = next < 0 ? -1 : 1;
      this.step(dir);
      this.focusIndex.set((next + cells.length) % cells.length);
    } else this.focusIndex.set(next);
    this.focusCell();
  }

  private openPanel(): void {
    if (this.isDisabled()) return;
    this.open.set(true);
    this.focusCell();
  }

  /** Cierra el panel (y devuelve el foco al botón si se cerró desde dentro). */
  close(refocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
    if (refocus) this.trigger().nativeElement.focus();
  }

  private focusCell(): void {
    afterNextRender(
      () => {
        const panel = this.trigger().nativeElement.ownerDocument.querySelector<HTMLElement>(`.cb-pp__panel [data-index="${this.focusIndex()}"]`);
        panel?.focus();
      },
      { injector: this.injector },
    );
  }

  private setValue(period: CbPeriod | null): void {
    this.value.set(period);
    this.onChange(period);
    this.periodChange.emit(period);
  }

  private day(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
