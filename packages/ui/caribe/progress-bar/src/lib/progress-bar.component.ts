import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/**
 * Progress-bar de Caribe Design: barra de progreso determinada (0–100) con
 * etiqueta y valor opcionales.
 *
 * @example
 * ```html
 * <cb-progress-bar [value]="40" label="Carga" />
 * ```
 */
@Component({
  selector: 'cb-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-progress-bar-host' },
  template: `
    <div class="cb-progress-bar">
      @if (label() || showValue()) {
        <div class="cb-progress-bar__head">
          <span class="cb-progress-bar__label">{{ label() }}</span>
          @if (showValue()) {
            <strong class="cb-progress-bar__value">{{ clamped() }}%</strong>
          }
        </div>
      }
      <div
        class="cb-progress-bar__track"
        role="progressbar"
        [attr.aria-valuenow]="clamped()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="label() || 'Progreso'"
      >
        <div class="cb-progress-bar__fill" [style.width.%]="clamped()"></div>
      </div>
    </div>
  `,
  styleUrl: './progress-bar.component.css',
})
export class CbProgressBar {
  /** Valor actual (0–100). */
  readonly value = input<number>(60);
  /** Etiqueta mostrada sobre la barra. */
  readonly label = input<string>('');
  /** Muestra el porcentaje numérico. */
  readonly showValue = input<boolean>(true);

  protected readonly clamped = computed(() =>
    Math.max(0, Math.min(100, Math.round(this.value()))),
  );
}
