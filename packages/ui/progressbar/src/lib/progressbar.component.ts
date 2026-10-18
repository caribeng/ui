import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import type { CbSeverity } from '@caribeng/ui';

/**
 * ProgressBar de CaribeNG: barra de progreso determinada o indeterminada.
 *
 * @example
 * ```html
 * <cb-progressbar [value]="60" />
 * <cb-progressbar [value]="null" />  <!-- indeterminada -->
 * ```
 */
@Component({
  selector: 'cb-progressbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-progressbar',
    '[class]': "'cb-progressbar cb-progressbar--' + severity() + ' cb-progressbar--' + size()",
    '[class.cb-progressbar--indeterminate]': 'indeterminate()',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clamped()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  template: `
    <div class="cb-progressbar__track">
      <div class="cb-progressbar__fill" [style.width.%]="indeterminate() ? null : clamped()"></div>
    </div>
    @if (showValue() && !indeterminate()) {
      <span class="cb-progressbar__value">{{ clamped() }}%</span>
    }
  `,
  styleUrl: './progressbar.component.css',
})
export class CbProgressBar {
  /** Valor 0–100. `null` activa el modo indeterminado. */
  readonly value = input<number | null>(0);
  /** Muestra el porcentaje a la derecha. */
  readonly showValue = input<boolean, unknown>(false, { transform: toBoolean });
  readonly severity = input<CbSeverity>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly ariaLabel = input<string>('');

  protected readonly indeterminate = computed(() => this.value() == null);
  protected readonly clamped = computed(() =>
    Math.min(100, Math.max(0, Math.round(this.value() ?? 0))),
  );
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
