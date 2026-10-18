import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';

@Component({
  selector: 'cb-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-calendar' },
  template: `
    <div class="cb-caribe-box" style="flex-direction: column; align-items: stretch; min-width: 250px; padding: 0.85rem">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem">
        <strong style="font-size: 0.875rem">{{ monthLabel() }}</strong>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; text-align: center">
        @for (d of days(); track d) {
          <button
            type="button"
            (click)="selectDay(d)"
            [attr.aria-pressed]="selectedDay() === d"
            [style.background]="selectedDay() === d ? 'var(--cb-color-primary-500, #10b981)' : 'transparent'"
            [style.color]="selectedDay() === d ? '#ffffff' : 'inherit'"
            style="border: none; border-radius: 0.375rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.8rem"
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

  protected readonly days = computed(() =>
    Array.from({ length: Math.max(28, Math.min(31, this.totalDays())) }, (_, i) => i + 1)
  );

  selectDay(day: number): void {
    this.selectedDay.set(day);
  }
}
