import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

@Component({
  selector: 'cb-circle-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-circle-loading' },
  template: `
    <div
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : progress()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label()"
      style="display: inline-flex; flex-direction: column; align-items: center; gap: 0.4rem"
    >
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--cb-color-surface-200, #e2e8f0)" stroke-width="4" />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--cb-color-primary-500, #10b981)"
          stroke-width="4"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          transform="rotate(-90 24 24)"
        />
      </svg>
      @if (label()) {
        <span style="font-size: 0.75rem; color: var(--cb-color-text-muted, #64748b)">{{ label() }}</span>
      }
    </div>
  `,
  styleUrl: './circle-loading.component.css',
})
export class CbCircleLoadingComponent {
  readonly progress = input<number>(65);
  readonly size = input<number>(48);
  readonly indeterminate = input<boolean>(false);
  readonly label = input<string>('Cargando');

  protected readonly circumference = 2 * Math.PI * 20;
  protected readonly dashOffset = computed(() => {
    if (this.indeterminate()) return this.circumference * 0.65;
    const clamped = Math.max(0, Math.min(100, this.progress()));
    return this.circumference * (1 - clamped / 100);
  });
}
