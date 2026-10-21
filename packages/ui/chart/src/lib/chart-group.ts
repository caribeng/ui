import { ChangeDetectionStrategy, Component, Injectable, input, signal } from '@angular/core';
import type { CbChartWindow } from './chart-model';

/** Estado compartido por las gráficas de un `<cb-chart-group>`. */
@Injectable()
export class CbChartGroupState {
  /** Valor de X activo (cursor) en cualquiera de las gráficas. */
  readonly key = signal<number | null>(null);
  /** Ventana visible común del eje X (zoom y desplazamiento). */
  readonly window = signal<CbChartWindow | null>(null);
}

/**
 * Agrupa gráficas del modo composable que comparten el eje X: el cursor, el
 * tooltip y el zoom se sincronizan (p. ej. precio, volumen y spread).
 *
 * @example
 * ```html
 * <cb-chart-group ariaLabel="PRIM/USD">
 *   <cb-chart [data]="velas" zoom [height]="260"><cb-chart-candlestick x="ts" /></cb-chart>
 *   <cb-chart [data]="velas" zoom [height]="100"><cb-chart-bar x="ts" y="volumen" /></cb-chart>
 * </cb-chart-group>
 * ```
 */
@Component({
  selector: 'cb-chart-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CbChartGroupState],
  host: {
    class: 'cb-chart-group',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: grid;
      gap: var(--cb-space-2, 0.5rem);
      width: 100%;
    }
  `,
})
export class CbChartGroup {
  /** Nombre accesible del conjunto. */
  readonly ariaLabel = input<string | undefined>(undefined);
}
