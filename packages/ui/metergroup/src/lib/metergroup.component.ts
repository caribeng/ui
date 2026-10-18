import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbMeterItem {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

/**
 * MeterGroup de CaribeNG: indicador métrico multisegmento con barra proporcional y leyenda.
 */
@Component({
  selector: 'cb-meter-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-meter-group',
    role: 'meter',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max()',
  },
  template: `
    <div class="cb-meter-group__track">
      @for (item of values(); track item.label; let idx = $index) {
        <span
          class="cb-meter-group__bar"
          [style.width.%]="percent(item.value)"
          [style.background]="item.color || defaultColor(idx)"
        ></span>
      }
    </div>
    <ol class="cb-meter-group__legend">
      @for (item of values(); track item.label; let idx = $index) {
        <li class="cb-meter-group__item">
          <span
            class="cb-meter-group__dot"
            [style.background]="item.color || defaultColor(idx)"
          ></span>
          @if (item.icon) {
            <cb-icon [name]="item.icon" [size]="14" aria-hidden="true" />
          }
          <span class="cb-meter-group__label">{{ item.label }}</span>
          <span class="cb-meter-group__value">({{ item.value }}%)</span>
        </li>
      }
    </ol>
  `,
  styleUrl: './metergroup.component.css',
})
export class CbMeterGroup {
  readonly values = input<CbMeterItem[]>([]);
  readonly max = input<number>(100);

  private readonly palette = [
    'var(--cb-color-primary-500)',
    'var(--cb-color-info-500)',
    'var(--cb-color-warning-500)',
    'var(--cb-color-help-500)',
  ];

  protected percent(val: number): number {
    const m = Math.max(1, this.max());
    return Math.min(100, Math.max(0, (val / m) * 100));
  }

  protected defaultColor(idx: number): string {
    return this.palette[idx % this.palette.length];
  }
}
