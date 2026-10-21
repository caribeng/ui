import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { cbOverlayFocus, injectCbTranslation } from '@caribeng/ui';

let nextId = 0;

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
        <div
          class="cb-fab-menu__list"
          role="menu"
          [id]="menuId"
          [attr.aria-label]="(triggerLabel() ?? t().quickActions)"
          (keydown)="onMenuKeydown($event)"
        >
          @for (item of items(); track item.id) {
            <button
              type="button"
              class="cb-fab-menu__item"
              role="menuitem"
              tabindex="-1"
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
        aria-haspopup="menu"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? menuId : null"
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

  protected readonly menuId = `cb-fab-menu-${++nextId}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Al abrir, el foco va a la primera acción; al cerrar, vuelve al botón flotante.
    cbOverlayFocus({ open: this.open, initialFocus: () => this.menuItems()[0] });
  }

  private menuItems(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-fab-menu__item'));
  }

  /** Patrón *menu*: flechas (circular), Inicio, Fin, y Escape / Tab cierran. */
  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems();
    const cur = items.indexOf(event.target as HTMLElement);
    const last = items.length - 1;
    const target =
      event.key === 'ArrowDown' ? (cur < last ? cur + 1 : 0)
      : event.key === 'ArrowUp' ? (cur > 0 ? cur - 1 : last)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : -1;
    if (target >= 0) {
      event.preventDefault();
      items[target]?.focus();
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      this.open.set(false);
    }
  }

  selectItem(item: CbFabMenuItem): void {
    this.itemSelected.emit(item);
    this.open.set(false);
  }
}
