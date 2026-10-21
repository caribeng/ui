import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Voucher de Caribe Design: comprobante de operación con filas clave/valor y
 * una acción para compartir.
 *
 * @example
 * ```html
 * <cb-voucher title="Comprobante" [rows]="detalle" (copy)="share()" />
 * ```
 */
@Component({
  selector: 'cb-voucher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <article class="cb-voucher">
      <header class="cb-voucher__head">
        <span class="cb-voucher__check" aria-hidden="true">✓</span>
        <h2 class="cb-voucher__title">{{ (title() ?? t().receipt) }}</h2>
      </header>
      <div class="cb-voucher__intro"><ng-content /></div>
      <dl class="cb-voucher__list">
        @for (row of rows(); track $index) {
          <div class="cb-voucher__row">
            <dt class="cb-voucher__label">{{ row.label }}</dt>
            <dd class="cb-voucher__value">{{ row.value }}</dd>
          </div>
        }
      </dl>
      <div class="cb-voucher__foot">
        <button type="button" class="cb-voucher__action" (click)="copy.emit()">
          {{ (actionLabel() ?? t().share) }}
        </button>
      </div>
    </article>
  `,
  styleUrl: './voucher.component.css',
})
export class CbVoucher {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly title = input<string | undefined>(undefined);
  readonly rows = input<readonly { label: string; value: string }[]>([]);
  readonly actionLabel = input<string | undefined>(undefined);
  readonly copy = output<void>();
}
