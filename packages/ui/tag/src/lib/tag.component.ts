import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';
import type { CbSeverity } from '@caribeng/ui';

/**
 * Tag (etiqueta) de CaribeNG para categorizar o marcar estado.
 *
 * @example
 * ```html
 * <cb-tag value="Nuevo" severity="success" icon="check" />
 * ```
 */
@Component({
  selector: 'cb-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: {
    class: 'cb-tag',
    '[class]': "'cb-tag cb-tag--' + severity()",
    '[class.cb-tag--rounded]': 'rounded()',
  },
  template: `
    @if (icon()) {
      <cb-icon [name]="icon()" [size]="14" aria-hidden="true" />
    }
    @if (value()) {
      <span class="cb-tag__label">{{ value() }}</span>
    }
    <ng-content />
  `,
  styleUrl: './tag.component.css',
})
export class CbTagComponent {
  readonly value = input<string>('');
  readonly severity = input<CbSeverity>('primary');
  /** Icono (nombre del set de @caribeng/ui/icon) antes del texto. */
  readonly icon = input<string>('');
  /** Esquinas totalmente redondeadas (pill). */
  readonly rounded = input<boolean, unknown>(false, { transform: toBoolean });
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
