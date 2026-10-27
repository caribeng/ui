import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Status: chip de estado con punto de color y etiqueta.
 *
 * @example
 * ```html
 * <cb-status status="success" text="Activo" />
 * ```
 */
@Component({
  selector: 'cb-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <span class="cb-status cb-status--{{ status() }}" role="status">
      <span class="cb-status__dot" aria-hidden="true"></span>
      <ng-content>{{ text() }}</ng-content>
    </span>
  `,
  styleUrl: './status.component.css',
})
export class CbStatus {
  readonly text = input('');
  readonly status = input<'success' | 'warning' | 'error' | 'info'>('info');
}
