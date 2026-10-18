import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * Icon-button de Caribe Design: botón circular con un único icono. Útil para
 * acciones compactas en barras y cabeceras.
 *
 * @example
 * ```html
 * <cb-icon-button icon="plus" ariaLabel="Agregar" (pressed)="add()" />
 * ```
 */
@Component({
  selector: 'cb-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-icon-button-host' },
  template: `
    <button
      type="button"
      class="cb-icon-button"
      [class.cb-icon-button--ghost]="variant() === 'ghost'"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || icon()"
      (click)="!disabled() && pressed.emit($event)"
    >
      <cb-icon [name]="icon()" [size]="18" aria-hidden="true" />
    </button>
  `,
  styleUrl: './icon-button.component.css',
})
export class CbIconButton {
  /** Nombre del icono del set núcleo. */
  readonly icon = input<string>('plus');
  /** Etiqueta accesible del botón. */
  readonly ariaLabel = input<string>('Acción');
  /** Variante visual. */
  readonly variant = input<'solid' | 'ghost'>('solid');
  /** Deshabilita la acción. */
  readonly disabled = input<boolean>(false);
  /** Emite el evento de click. */
  readonly pressed = output<MouseEvent>();
}
