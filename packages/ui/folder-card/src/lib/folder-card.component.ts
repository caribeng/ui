import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Tarjeta de carpeta de CaribeNG: icono de carpeta, nombre y una fila con
 * número de archivos y tamaño.
 *
 * Con `actions` muestra un botón ⋮ que abre un menú (`cb-menu`) con esas
 * acciones y emite `actionSelect`. Con `clickable`, toda la tarjeta abre la
 * carpeta (`open`) sin interferir con el botón del menú. Sigue aceptando un
 * trigger propio proyectado por `[cb-folder-actions]`.
 *
 * @example
 * ```html
 * <cb-folder-card name="Imágenes" files="345" size="26.4 GB" clickable
 *   [actions]="acciones" (actionSelect)="onAccion($event)" (open)="abrir()" />
 * ```
 */
@Component({
  selector: 'cb-folder-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbMenu],
  host: {
    class: 'cb-folder-card',
    '[class.cb-folder-card--clickable]': 'clickable()',
  },
  template: `
    <div class="cb-folder-card__top">
      <cb-icon name="folder" [size]="30" class="cb-folder-card__icon" [style.color]="color() || null" aria-hidden="true" />
      <span class="cb-folder-card__actions">
        <ng-content select="[cb-folder-actions]" />
        @if (actions().length) {
          <button
            #trigger
            type="button"
            class="cb-folder-card__menu-button"
            [attr.aria-label]="menuLabel()"
            aria-haspopup="menu"
            [attr.aria-expanded]="menuOpen()"
            (click)="toggleMenu()"
            (keydown.arrowdown)="openFromKeyboard($event)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          <cb-menu
            #menu
            [items]="actions()"
            [ariaLabel]="menuLabel()"
            (itemSelect)="actionSelect.emit($event)"
            (hidden)="menuOpen.set(false)"
          />
        }
      </span>
    </div>
    @if (clickable()) {
      <button type="button" class="cb-folder-card__name cb-folder-card__open" (click)="open.emit($event)">{{ name() }}</button>
    } @else {
      <div class="cb-folder-card__name">{{ name() }}</div>
    }
    <div class="cb-folder-card__meta">
      @if (files() !== '') {
        <span>{{ files() }} {{ (filesLabel() ?? t().files) }}</span>
      }
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
  private readonly menu = viewChild<CbMenu>('menu');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

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
  /** Acciones del menú ⋮ (abrir, renombrar, eliminar…). Sin acciones no se muestra el botón. */
  readonly actions = input<readonly CbMenuItem[]>([]);
  /** Nombre del botón ⋮ y del menú. Por defecto, "Más acciones: {nombre}" del idioma activo. */
  readonly actionsAriaLabel = input<string | undefined>(undefined);
  /** Toda la tarjeta es pulsable y emite `open` (clic, Enter o Espacio). */
  readonly clickable = input(false, { transform: booleanAttribute });

  /** Acción elegida en el menú ⋮. */
  readonly actionSelect = output<CbMenuItem>();
  /** Se pidió abrir la carpeta (solo con `clickable`). */
  readonly open = output<MouseEvent>();

  protected readonly menuOpen = signal(false);
  protected readonly menuLabel = computed(() => {
    const custom = this.actionsAriaLabel();
    if (custom) return custom;
    const name = this.name();
    return name ? `${this.t().moreActions}: ${name}` : this.t().moreActions;
  });

  /** Abre o cierra el menú de acciones anclado al botón ⋮. */
  toggleMenu(): void {
    const menu = this.menu();
    const trigger = this.trigger()?.nativeElement;
    if (!menu || !trigger) return;
    if (menu.isOpen) {
      menu.hide();
      return;
    }
    menu.show(trigger);
    this.menuOpen.set(true);
  }

  protected openFromKeyboard(event: Event): void {
    event.preventDefault();
    if (!this.menu()?.isOpen) this.toggleMenu();
  }
}
