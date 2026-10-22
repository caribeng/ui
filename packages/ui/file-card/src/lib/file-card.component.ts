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
 * Tarjeta de categoría/almacenamiento de CaribeNG: icono con tinte, título y
 * subtítulo a la izquierda; dos valores alineados a la derecha. Útil para
 * resúmenes de media, almacenamiento o métricas de categoría.
 *
 * Como `cb-folder-card`: con `actions` muestra un botón ⋮ con un menú
 * (`actionSelect`) y con `clickable` toda la tarjeta emite `open`.
 *
 * @example
 * ```html
 * <cb-file-card icon="image" color="#10b981" title="Imágenes"
 *   subtitle="17% usado" value="245 archivos" valueSub="26.4 GB"
 *   clickable (open)="verImagenes()" />
 * ```
 */
@Component({
  selector: 'cb-file-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbMenu],
  host: {
    class: 'cb-file-card',
    '[class.cb-file-card--clickable]': 'clickable()',
  },
  template: `
    <div class="cb-file-card__left">
      <span class="cb-file-card__icon" [style.background]="tintBg()" [style.color]="color() || null">
        <cb-icon [name]="icon()" [size]="20" aria-hidden="true" />
      </span>
      <div class="cb-file-card__text">
        @if (clickable()) {
          <button type="button" class="cb-file-card__title cb-file-card__open" (click)="open.emit($event)">{{ title() }}</button>
        } @else {
          <span class="cb-file-card__title">{{ title() }}</span>
        }
        @if (subtitle()) {
          <span class="cb-file-card__subtitle">{{ subtitle() }}</span>
        }
      </div>
    </div>
    <div class="cb-file-card__end">
      <div class="cb-file-card__values">
        <span class="cb-file-card__value">{{ value() }}</span>
        @if (valueSub()) {
          <span class="cb-file-card__value-sub">{{ valueSub() }}</span>
        }
      </div>
      @if (actions().length) {
        <button
          #trigger
          type="button"
          class="cb-file-card__menu-button"
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
    </div>
  `,
  styleUrl: './file-card.component.css',
})
export class CbFileCard {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly menu = viewChild<CbMenu>('menu');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  /** Nombre del icono (del set de CaribeNG). */
  readonly icon = input<string>('file');
  /** Color del icono (CSS). El fondo del recuadro se deriva con transparencia. */
  readonly color = input<string>('');
  /** Título principal. */
  readonly title = input<string>('');
  /** Subtítulo (p. ej. "17% usado"). */
  readonly subtitle = input<string>('');
  /** Valor principal a la derecha (p. ej. "245 archivos"). */
  readonly value = input<string>('');
  /** Valor secundario a la derecha (p. ej. "26.4 GB"). */
  readonly valueSub = input<string>('');
  /** Acciones del menú ⋮. Sin acciones no se muestra el botón. */
  readonly actions = input<readonly CbMenuItem[]>([]);
  /** Nombre del botón ⋮ y del menú. Por defecto, "Más acciones: {título}" del idioma activo. */
  readonly actionsAriaLabel = input<string | undefined>(undefined);
  /** Toda la tarjeta es pulsable y emite `open` (clic, Enter o Espacio). */
  readonly clickable = input(false, { transform: booleanAttribute });

  /** Acción elegida en el menú ⋮. */
  readonly actionSelect = output<CbMenuItem>();
  /** Se pulsó la tarjeta (solo con `clickable`). */
  readonly open = output<MouseEvent>();

  protected readonly menuOpen = signal(false);
  protected readonly menuLabel = computed(() => {
    const custom = this.actionsAriaLabel();
    if (custom) return custom;
    const title = this.title();
    return title ? `${this.t().moreActions}: ${title}` : this.t().moreActions;
  });

  /** Fondo tintado derivado del color (cualquier color CSS: hex, rgb(), var(--…)). */
  protected tintBg(): string | null {
    const c = this.color();
    return c ? `color-mix(in srgb, ${c} 12%, transparent)` : null;
  }

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
