import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Circle-loading de Caribe Design: progreso circular determinado o
 * indeterminado (spinner).
 *
 * @example
 * ```html
 * <cb-circle-loading [progress]="65" />
 * <cb-circle-loading [indeterminate]="true" />
 * ```
 */
@Component({
  selector: 'cb-circle-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-circle-loading-host' },
  template: `
    <div
      class="cb-circle-loading"
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : progress()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="(label() ?? t().loading)"
    >
      <svg
        class="cb-circle-loading__svg"
        [class.cb-is-indeterminate]="indeterminate()"
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 48 48"
      >
        <circle
          class="cb-circle-loading__track"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke-width="4"
        />
        <circle
          class="cb-circle-loading__bar"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke-width="4"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          transform="rotate(-90 24 24)"
        />
      </svg>
      @if ((label() ?? t().loading)) {
        <span class="cb-circle-loading__label">{{ (label() ?? t().loading) }}</span>
      }
    </div>
  `,
  styleUrl: './circle-loading.component.css',
})
export class CbCircleLoading {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly progress = input<number>(65);
  readonly size = input<number>(48);
  readonly indeterminate = input<boolean>(false);
  readonly label = input<string | undefined>(undefined);

  protected readonly circumference = 2 * Math.PI * 20;
  protected readonly dashOffset = computed(() => {
    if (this.indeterminate()) return this.circumference * 0.75;
    const clamped = Math.max(0, Math.min(100, this.progress()));
    return this.circumference * (1 - clamped / 100);
  });
}
