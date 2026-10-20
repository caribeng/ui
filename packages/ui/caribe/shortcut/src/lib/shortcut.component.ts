import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * Shortcut de Caribe Design: acceso directo con icono y etiqueta, presentado
 * como una tarjeta pulsable (típico de dashboards y home bancario).
 *
 * @example
 * ```html
 * <cb-shortcut icon="arrow-right" label="Transferir" (action)="go()" />
 * ```
 */
@Component({
  selector: 'cb-shortcut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-shortcut-host' },
  template: `
    <button
      type="button"
      class="cb-shortcut"
      [disabled]="disabled()"
      (click)="!disabled() && action.emit()"
    >
      <span class="cb-shortcut__icon">
        <cb-icon [name]="icon()" [size]="22" aria-hidden="true" />
      </span>
      <span class="cb-shortcut__label">{{ label() }}</span>
    </button>
  `,
  styleUrl: './shortcut.component.css',
})
export class CbShortcut {
  /** Texto del acceso directo. */
  readonly label = input<string>('');
  /** Icono del set núcleo. */
  readonly icon = input<string>('arrow-right');
  /** Deshabilita el acceso. */
  readonly disabled = input<boolean>(false);
  /** Emite al activar el acceso. */
  readonly action = output<void>();
}
