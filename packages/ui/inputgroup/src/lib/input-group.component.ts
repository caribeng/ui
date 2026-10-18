import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Agrupa un control con addons (texto/icono) o botones, uniéndolos visualmente.
 *
 * @example
 * ```html
 * <cb-input-group>
 *   <cb-input-group-addon><cb-icon name="user" /></cb-input-group-addon>
 *   <cb-input placeholder="Usuario" />
 *   <cb-button>Buscar</cb-button>
 * </cb-input-group>
 * ```
 */
@Component({
  selector: 'cb-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sin encapsulación: aplana el border-radius de los controles proyectados
  // (cb-input, cb-button, addons), que viven en otra encapsulación.
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cb-input-group' },
  template: `<ng-content />`,
  styleUrl: './input-group.component.css',
})
export class CbInputGroup {}

/**
 * Addon (texto o icono) para un `<cb-input-group>`.
 */
@Component({
  selector: 'cb-input-group-addon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-input-group-addon',
    '[class.cb-input-group-addon--button]': 'button()',
  },
  template: `<ng-content />`,
  styleUrl: './input-group-addon.component.css',
})
export class CbInputGroupAddon {
  /** Estilo de addon "botón" (sin fondo de relleno). */
  readonly button = input<boolean, unknown>(false, { transform: toBoolean });
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
