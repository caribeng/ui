import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import type { CbSeverity, CbSize } from '@caribeng/ui';

/**
 * Badge de CaribeNG: indicador compacto de conteo o estado.
 *
 * @example
 * ```html
 * <cb-badge [value]="8" severity="danger" />
 * <cb-badge dot severity="success" />
 * ```
 */
@Component({
  selector: 'cb-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-badge',
    '[class]': "'cb-badge cb-badge--' + severity() + ' cb-badge--' + size()",
    '[class.cb-badge--dot]': 'dot()',
  },
  template: `@if (!dot()) {{{ value() }}}`,
  styleUrl: './badge.component.css',
})
export class CbBadgeComponent {
  /** Contenido (conteo o texto breve). */
  readonly value = input<string | number>('');
  /** Severidad semántica (color). */
  readonly severity = input<CbSeverity>('primary');
  /** Tamaño. */
  readonly size = input<CbSize>('md');
  /** Muestra solo un punto (sin texto). */
  readonly dot = input<boolean, unknown>(false, { transform: toBoolean });
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
