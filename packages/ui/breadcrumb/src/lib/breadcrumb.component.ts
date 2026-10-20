import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

export interface CbBreadcrumbItem {
  label: string;
  /** Si se define, el elemento se renderiza como enlace. */
  url?: string;
  /** Icono (nombre del set de @caribeng/ui/icon) antes del texto. */
  icon?: string;
}

/**
 * Breadcrumb de CaribeNG: rastro de navegación jerárquica.
 *
 * @example
 * ```html
 * <cb-breadcrumb [items]="[
 *   { label: 'Inicio', url: '/', icon: 'house' },
 *   { label: 'Productos', url: '/productos' },
 *   { label: 'Detalle' }
 * ]" />
 * ```
 */
@Component({
  selector: 'cb-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-breadcrumb' },
  template: `
    <nav [attr.aria-label]="t().breadcrumb">
      <ol class="cb-breadcrumb__list">
        @for (item of items(); track $index; let last = $last) {
          <li class="cb-breadcrumb__item">
            @if (item.url && !last) {
              <a class="cb-breadcrumb__link" [href]="item.url" (click)="itemClick.emit(item)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="15" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <span class="cb-breadcrumb__current" [attr.aria-current]="last ? 'page' : null">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="15" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </span>
            }
            @if (!last) {
              <cb-icon class="cb-breadcrumb__sep" [name]="separator()" [size]="14" aria-hidden="true" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.component.css',
})
export class CbBreadcrumb {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly items = input<readonly CbBreadcrumbItem[]>([]);
  /** Icono separador entre elementos. */
  readonly separator = input<string>('chevron-right');

  /** Se emite al hacer clic en un elemento con enlace. */
  readonly itemClick = output<CbBreadcrumbItem>();
}
