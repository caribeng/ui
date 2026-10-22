import { Directive, computed, inject, input } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CB_APP_SHELL } from './sidebar.types';

/**
 * Convierte cualquier botón en el control del sidebar de `cb-app-shell`: en
 * móvil abre o cierra el panel; en escritorio contrae o expande. Gestiona
 * `aria-controls`, `aria-expanded` y un nombre accesible por defecto.
 *
 * @example
 * ```html
 * <button type="button" cbSidebarToggle><cb-icon name="menu" aria-hidden="true" /></button>
 * ```
 */
@Directive({
  selector: '[cbSidebarToggle]',
  host: {
    '(click)': 'shell?.toggle()',
    '[attr.aria-controls]': 'shell?.sidebarId ?? null',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-label]': 'label()',
  },
})
export class CbSidebarToggle {
  protected readonly t = injectCbTranslation();
  protected readonly shell = inject(CB_APP_SHELL, { optional: true });

  /** Nombre accesible. Por defecto, "Abrir menú" (móvil) o "Contraer/Expandir menú lateral". */
  readonly cbSidebarToggle = input<string>('');

  protected readonly expanded = computed(() => {
    const shell = this.shell;
    if (!shell) return null;
    return shell.mobile() ? shell.sidebarOpen() : !shell.collapsed();
  });

  protected readonly label = computed(() => {
    const custom = this.cbSidebarToggle();
    if (custom) return custom;
    const shell = this.shell;
    if (!shell) return null;
    if (shell.mobile()) return this.t().openMenu;
    return shell.collapsed() ? this.t().expandSidebar : this.t().collapseSidebar;
  });
}
