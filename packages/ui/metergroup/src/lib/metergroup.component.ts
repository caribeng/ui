import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
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
    '[attr.aria-valuenow]': 'total()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  template: `
    <div class="cb-meter-group__track">
      @for (item of values(); track $index; let idx = $index) {
        <span
          class="cb-meter-group__bar"
          [style.width.%]="percent(item.value)"
          [style.background]="item.color || defaultColor(idx)"
        ></span>
      }
    </div>
    <ol class="cb-meter-group__legend" aria-hidden="true">
      @for (item of values(); track $index; let idx = $index) {
        <li class="cb-meter-group__item">
          <span
            class="cb-meter-group__dot"
            [style.background]="item.color || defaultColor(idx)"
          ></span>
          @if (item.icon) {
            <cb-icon [name]="item.icon" [size]="14" aria-hidden="true" />
          }
          <span class="cb-meter-group__label">{{ item.label }}</span>
          <span class="cb-meter-group__value">({{ format(item.value) }}%)</span>
        </li>
      }
    </ol>
  `,
  styleUrl: './metergroup.component.css',
})
export class CbMeterGroup {
  readonly values = input<CbMeterItem[]>([]);
  readonly max = input<number>(100);
  /** Nombre accesible del medidor (p. ej. "Almacenamiento"). */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Suma de los valores (valor actual del `role="meter"`). */
  protected readonly total = computed(() => this.values().reduce((sum, v) => sum + v.value, 0));
  /** Desglose legible para el lector de pantalla ("Apps 16 %, Fotos 8 %"). */
  protected readonly valueText = computed(() =>
    this.values()
      .map((v) => `${v.label} ${this.format(v.value)}%`)
      .join(', '),
  );

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

  /** Porcentaje respecto a `max`, redondeado a un decimal. */
  protected format(val: number): number {
    return Math.round(this.percent(val) * 10) / 10;
  }

  protected defaultColor(idx: number): string {
    return this.palette[idx % this.palette.length];
  }
}
