import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Tarjeta de carpeta de CaribeNG: icono de carpeta, nombre y una fila con
 * número de archivos y tamaño. Proyecta acciones (menú) por `[cb-folder-actions]`.
 *
 * @example
 * ```html
 * <cb-folder-card name="Imágenes" files="345" size="26.4 GB">
 *   <button cb-folder-actions aria-label="Opciones">⋮</button>
 * </cb-folder-card>
 * ```
 */
@Component({
  selector: 'cb-folder-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-folder-card' },
  template: `
    <div class="cb-folder-card__top">
      <cb-icon name="folder" [size]="30" class="cb-folder-card__icon" [style.color]="color() || null" aria-hidden="true" />
      <span class="cb-folder-card__actions">
        <ng-content select="[cb-folder-actions]" />
      </span>
    </div>
    <div class="cb-folder-card__name">{{ name() }}</div>
    <div class="cb-folder-card__meta">
      <span>{{ files() }} {{ (filesLabel() ?? t().files) }}</span>
      @if (size()) {
        <span>{{ size() }}</span>
      }
    </div>
  `,
  styleUrl: './folder-card.component.css',
})
export class CbFolderCard {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Nombre de la carpeta. */
  readonly name = input<string>('');
  /** Número de archivos (texto o número). */
  readonly files = input<string | number>('');
  /** Etiqueta tras el número de archivos. */
  readonly filesLabel = input<string | undefined>(undefined);
  /** Tamaño mostrado a la derecha. */
  readonly size = input<string>('');
  /** Color del icono de carpeta. */
  readonly color = input<string>('#f5b301');
}
