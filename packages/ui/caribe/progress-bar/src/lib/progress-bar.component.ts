import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

@Component({
  selector: 'cb-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-progress-bar', style: 'display: block; width: 100%' },
  template: `
    <div style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%">
      @if (label() || showValue()) {
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem">
          <span>{{ label() }}</span>
          @if (showValue()) {
            <strong>{{ clamped() }}%</strong>
          }
        </div>
      }
      <div
        role="progressbar"
        [attr.aria-valuenow]="clamped()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="label() || 'Progreso'"
        style="width: 100%; height: 0.55rem; border-radius: 999px; background: var(--cb-color-surface-200, #e2e8f0); overflow: hidden"
      >
        <div
          [style.width.%]="clamped()"
          style="height: 100%; background: var(--cb-color-primary-500, #10b981); border-radius: 999px; transition: width 180ms ease"
        ></div>
      </div>
    </div>
  `,
  styleUrl: './progress-bar.component.css',
})
export class CbProgressBar {
  readonly value = input<number>(60);
  readonly label = input<string>('');
  readonly showValue = input<boolean>(true);

  protected readonly clamped = computed(() => Math.max(0, Math.min(100, this.value())));
}
