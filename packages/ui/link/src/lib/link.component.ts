import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Enlace. Renderiza un ancla accesible con estilos de marca,
 * soporte de enlaces externos y estado deshabilitado.
 *
 * @example
 * ```html
 * <cb-link href="/ayuda">Centro de ayuda</cb-link>
 * <cb-link href="https://..." [external]="true">Ver más</cb-link>
 * ```
 */
@Component({
  selector: 'cb-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-link-host' },
  template: `
    <a
      class="cb-link"
      [class.cb-is-disabled]="disabled()"
      [attr.href]="disabled() ? null : href()"
      [attr.target]="external() ? '_blank' : null"
      [attr.rel]="external() ? 'noopener noreferrer' : null"
      [attr.tabindex]="disabled() ? -1 : 0"
      [attr.aria-disabled]="disabled() || null"
      role="link"
    >
      <span class="cb-link__label">{{ label() }}<ng-content /></span>
      @if (external()) {
        <span class="cb-link__external" aria-hidden="true">↗</span>
        <span class="cb-link__sr">{{ t().opensInNewTab }}</span>
      }
    </a>
  `,
  styleUrl: './link.component.css',
})
export class CbLink {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Destino del enlace. */
  readonly href = input<string>('#');
  /** Texto del enlace (alternativa a proyectar contenido). */
  readonly label = input<string>('');
  /** Abre en una pestaña nueva y añade indicador visual. */
  readonly external = input<boolean>(false);
  /** Deshabilita la navegación y atenúa el enlace. */
  readonly disabled = input<boolean>(false);
}
