import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Calendar de Caribe Design: cuadrícula mensual con selección de día.
 *
 * @example
 * ```html
 * <cb-calendar monthLabel="Octubre 2026" [totalDays]="31" [(selectedDay)]="dia" />
 * ```
 */
@Component({
  selector: 'cb-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-calendar-host' },
  template: `
    <div class="cb-calendar">
      <header class="cb-calendar__head">
        <strong class="cb-calendar__month">{{ monthLabel() }}</strong>
      </header>
      <div class="cb-calendar__weekdays" aria-hidden="true">
        @for (w of weekdays(); track $index) {
          <span class="cb-calendar__weekday">{{ w }}</span>
        }
      </div>
      <div class="cb-calendar__grid" role="group" [attr.aria-label]="monthLabel() || null">
        @for (d of days(); track d) {
          <button
            type="button"
            class="cb-calendar__day"
            [class.cb-is-selected]="selectedDay() === d"
            [attr.aria-pressed]="selectedDay() === d"
            (click)="selectDay(d)"
          >
            {{ d }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './calendar.component.css',
})
export class CbCalendar {
  readonly monthLabel = input<string>('');
  readonly totalDays = input<number>(31);
  readonly selectedDay = model<number>(17);

  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Iniciales de lunes a domingo en el idioma activo. */
  protected readonly weekdays = computed(() => this.t().weekdaysMin.split(','));

  protected readonly days = computed(() =>
    Array.from(
      { length: Math.max(28, Math.min(31, this.totalDays())) },
      (_, i) => i + 1,
    ),
  );

  selectDay(day: number): void {
    this.selectedDay.set(day);
  }
}
