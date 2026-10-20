import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Toolbar de CaribeNG: contenedor horizontal accesible (`role="toolbar"`) para
 * agrupar botones, controles y acciones en tres zonas (`[cb-toolbar-start]`,
 * `[cb-toolbar-center]`, `[cb-toolbar-end]`).
 *
 * @example
 * ```html
 * <cb-toolbar ariaLabel="Acciones de documento">
 *   <div cb-toolbar-start><cb-button>Nuevo</cb-button></div>
 *   <div cb-toolbar-center><span>Borrador</span></div>
 *   <div cb-toolbar-end><cb-button variant="outlined">Guardar</cb-button></div>
 * </cb-toolbar>
 * ```
 */
@Component({
  selector: 'cb-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-toolbar',
    role: 'toolbar',
    '[attr.aria-label]': '(ariaLabel() ?? t().toolbar) || null',
  },
  template: `
    <div class="cb-toolbar__group cb-toolbar__start">
      <ng-content select="[cb-toolbar-start]" />
      <ng-content />
    </div>
    <div class="cb-toolbar__group cb-toolbar__center">
      <ng-content select="[cb-toolbar-center]" />
    </div>
    <div class="cb-toolbar__group cb-toolbar__end">
      <ng-content select="[cb-toolbar-end]" />
    </div>
  `,
  styleUrl: './toolbar.component.css',
})
export class CbToolbar {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Etiqueta accesible para el contenedor `role="toolbar"`. */
  readonly ariaLabel = input<string | undefined>(undefined);
}
