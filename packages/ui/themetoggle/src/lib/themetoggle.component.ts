import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input } from '@angular/core';
import { CbThemeService, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * Botón de cambio de tema claro / oscuro sobre `CbThemeService` (con
 * `provideCaribeNG({ persistTheme: true })` recuerda la elección).
 *
 * Su nombre accesible describe la acción ("Cambiar a tema oscuro"), por eso
 * no usa `aria-pressed`.
 *
 * @example
 * ```html
 * <cb-theme-toggle />
 * <cb-theme-toggle showLabel size="sm" />
 * ```
 */
@Component({
  selector: 'cb-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton, CbIcon],
  host: { class: 'cb-theme-toggle' },
  template: `
    <cb-button
      variant="text"
      severity="secondary"
      [size]="size()"
      [ariaLabel]="showLabel() ? undefined : label()"
      (click)="theme.toggle()"
    >
      <cb-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" aria-hidden="true" />
      @if (showLabel()) {
        {{ label() }}
      }
    </cb-button>
  `,
})
export class CbThemeToggle {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly theme = inject(CbThemeService);

  readonly size = input<CbSize>('md');
  /** Muestra el texto además del icono. */
  readonly showLabel = input(false, { transform: booleanAttribute });

  /** Acción que hará el botón: cambiar al tema contrario al actual. */
  protected readonly label = computed(() => (this.theme.isDark() ? this.t().switchToLight : this.t().switchToDark));
}
