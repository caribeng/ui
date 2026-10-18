import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

export interface CbFloatMenuItem {
  id: string;
  label: string;
}

/**
 * Float-menu de Caribe Design: menú flotante en forma de píldora con opciones
 * seleccionables (segmentado horizontal).
 *
 * @example
 * ```html
 * <cb-float-menu [items]="tabs" activeId="home" (select)="go($event)" />
 * ```
 */
@Component({
  selector: 'cb-float-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-float-menu-host' },
  template: `
    <nav class="cb-float-menu" [attr.aria-label]="ariaLabel()">
      @for (item of items(); track item.id) {
        <button
          type="button"
          class="cb-float-menu__item"
          [class.cb-float-menu__item--active]="activeId() === item.id"
          [attr.aria-current]="activeId() === item.id || null"
          (click)="select.emit(item)"
        >
          {{ item.label }}
        </button>
      }
    </nav>
  `,
  styleUrl: './float-menu.component.css',
})
export class CbFloatMenu {
  /** Opciones del menú. */
  readonly items = input<readonly CbFloatMenuItem[]>([]);
  /** Id de la opción activa. */
  readonly activeId = input<string>('');
  /** Etiqueta accesible. */
  readonly ariaLabel = input<string>('Menú flotante');
  /** Emite la opción seleccionada. */
  readonly select = output<CbFloatMenuItem>();
}
