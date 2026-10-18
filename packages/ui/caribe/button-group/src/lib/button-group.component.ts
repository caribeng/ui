import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Button-group de Caribe Design: contenedor que agrupa acciones relacionadas
 * en una superficie segmentada, en horizontal o vertical.
 *
 * @example
 * ```html
 * <cb-button-group ariaLabel="Vistas">
 *   <button>Día</button><button>Semana</button><button>Mes</button>
 * </cb-button-group>
 * ```
 */
@Component({
  selector: 'cb-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-button-group-host',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.cb-button-group-host--vertical]': "orientation() === 'vertical'",
  },
  template: `
    <div
      class="cb-button-group"
      [class.cb-button-group--vertical]="orientation() === 'vertical'"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './button-group.component.css',
})
export class CbButtonGroup {
  /** Dirección del grupo. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Etiqueta accesible del grupo. */
  readonly ariaLabel = input<string>('Grupo de acciones');
}
