import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { type CbSeverity, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbButton, type CbButtonVariant } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';

/**
 * SplitButton de CaribeNG: una acción principal y un menú con acciones
 * secundarias ("Guardar ▾"). La flecha abre el menú (también con Flecha abajo)
 * y anuncia `aria-haspopup="menu"` / `aria-expanded`.
 *
 * @example
 * ```html
 * <cb-split-button label="Guardar" icon="check" [items]="masOpciones"
 *                  (primaryClick)="guardar()" (itemSelect)="onOpcion($event)" />
 * ```
 */
@Component({
  selector: 'cb-split-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sin encapsulación: une visualmente los dos cb-button (esquinas) con selectores de clase propios.
  encapsulation: ViewEncapsulation.None,
  imports: [CbButton, CbIcon, CbMenu],
  host: {
    class: 'cb-split-button',
    role: 'group',
    '[attr.aria-label]': 'label() || null',
    '[class.cb-split-button--outlined]': "variant() === 'outlined'",
  },
  template: `
    <cb-button
      class="cb-split-button__main"
      [severity]="severity()"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="primaryClick.emit($event)"
    >
      @if (icon()) {
        <cb-icon [name]="icon()!" [size]="16" aria-hidden="true" />
      }
      {{ label() }}<ng-content />
    </cb-button>
    <cb-button
      class="cb-split-button__toggle"
      [severity]="severity()"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [ariaLabel]="menuAriaLabel() ?? t().moreActions"
      ariaHaspopup="menu"
      [ariaExpanded]="open()"
      (click)="toggleMenu()"
      (keydown.arrowdown)="openFromKeyboard($event)"
    >
      <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
    </cb-button>
    <cb-menu
      #menu
      [items]="items()"
      [ariaLabel]="menuAriaLabel() ?? t().moreActions"
      (itemSelect)="itemSelect.emit($event)"
      (hidden)="open.set(false)"
    />
  `,
  styleUrl: './splitbutton.component.css',
})
export class CbSplitButton {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menu = viewChild.required<CbMenu>('menu');

  /** Texto de la acción principal (también nombra el grupo). */
  readonly label = input<string>('');
  /** Icono de la acción principal. */
  readonly icon = input<string | undefined>(undefined);
  /** Acciones secundarias del menú. */
  readonly items = input<readonly CbMenuItem[]>([]);
  readonly severity = input<CbSeverity>('primary');
  readonly variant = input<CbButtonVariant>('solid');
  readonly size = input<CbSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** Nombre del botón de la flecha y del menú. Por defecto, "Más acciones" del idioma activo. */
  readonly menuAriaLabel = input<string | undefined>(undefined);

  /** Clic en la acción principal. */
  readonly primaryClick = output<MouseEvent>();
  /** Acción secundaria elegida en el menú. */
  readonly itemSelect = output<CbMenuItem>();

  protected readonly open = signal(false);

  /** Abre o cierra el menú anclado (y devuelve el foco) al botón real de la flecha. */
  toggleMenu(): void {
    const menu = this.menu();
    if (menu.isOpen) {
      menu.hide();
      return;
    }
    const trigger = this.host.nativeElement.querySelector<HTMLElement>('.cb-split-button__toggle button');
    if (!trigger) return;
    menu.show(trigger);
    this.open.set(true);
  }

  protected openFromKeyboard(event: Event): void {
    event.preventDefault();
    if (!this.menu().isOpen) this.toggleMenu();
  }
}
