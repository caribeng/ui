import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Divider de CaribeNG: separador horizontal o vertical, con etiqueta opcional.
 *
 * @example
 * ```html
 * <cb-divider />
 * <cb-divider align="center">o</cb-divider>
 * <cb-divider orientation="vertical" />
 * ```
 */
@Component({
  selector: 'cb-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'separator',
    '[class]':
      "'cb-divider cb-divider--' + orientation() + ' cb-divider--' + align() + ' cb-divider--' + type()",
    '[attr.aria-orientation]': 'orientation()',
  },
  template: `<span class="cb-divider__inner"><ng-content /></span>`,
  styleUrl: './divider.component.css',
})
export class CbDivider {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Posición de la etiqueta (solo horizontal). */
  readonly align = input<'start' | 'center' | 'end'>('center');
  /** Estilo de la línea. */
  readonly type = input<'solid' | 'dashed' | 'dotted'>('solid');
}
