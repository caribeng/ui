import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

export interface CbFabMenuItem {
  id: string;
  label: string;
}

/**
 * Fab-menu de Caribe Design: botón de acción flotante que despliega una lista
 * de acciones rápidas.
 *
 * @example
 * ```html
 * <cb-fab-menu [items]="acciones" (itemSelected)="run($event)" />
 * ```
 */
@Component({
  selector: 'cb-fab-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-fab-menu-host' },
  template: `
    <div class="cb-fab-menu">
      @if (open()) {
        <div class="cb-fab-menu__list" role="menu">
          @for (item of items(); track item.id) {
            <button
              type="button"
              class="cb-fab-menu__item"
              role="menuitem"
              (click)="selectItem(item)"
            >
              {{ item.label }}
            </button>
          }
        </div>
      }
      <button
        type="button"
        class="cb-fab-menu__trigger"
        [class.cb-is-open]="open()"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="(triggerLabel() ?? t().quickActions)"
        (click)="open.set(!open())"
      >
        <span aria-hidden="true">{{ open() ? '×' : '+' }}</span>
      </button>
    </div>
  `,
  styleUrl: './fab-menu.component.css',
})
export class CbFabMenu {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Etiqueta accesible del botón flotante. */
  readonly triggerLabel = input<string | undefined>(undefined);
  /** Acciones del menú. */
  readonly items = input<readonly CbFabMenuItem[]>([]);
  /** Estado desplegado (two-way). */
  readonly open = model<boolean>(false);
  /** Emite la acción seleccionada. */
  readonly itemSelected = output<CbFabMenuItem>();

  selectItem(item: CbFabMenuItem): void {
    this.itemSelected.emit(item);
    this.open.set(false);
  }
}
