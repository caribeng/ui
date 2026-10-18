import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
} from '@angular/core';

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
        @for (w of weekdays; track w) {
          <span class="cb-calendar__weekday">{{ w }}</span>
        }
      </div>
      <div class="cb-calendar__grid" role="grid">
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
  readonly monthLabel = input<string>('Octubre 2026');
  readonly totalDays = input<number>(31);
  readonly selectedDay = model<number>(17);

  protected readonly weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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
