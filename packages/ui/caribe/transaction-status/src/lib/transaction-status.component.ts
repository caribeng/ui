import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Transaction-status de Caribe Design: indicador del resultado de una
 * transacción (éxito, advertencia, error, info).
 *
 * @example
 * ```html
 * <cb-transaction-status status="success" label="Transacción completada" />
 * ```
 */
@Component({
  selector: 'cb-transaction-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="cb-txn cb-txn--{{ status() }}" role="status">
      <span class="cb-txn__icon" aria-hidden="true">{{ glyph() }}</span>
      <span class="cb-txn__label">{{ label() }}</span>
    </div>
  `,
  styleUrl: './transaction-status.component.css',
})
export class CbTransactionStatus {
  readonly status = input<'success' | 'warning' | 'error' | 'info'>('success');
  readonly label = input('');

  protected glyph(): string {
    switch (this.status()) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'error':
        return '×';
      default:
        return 'i';
    }
  }
}
