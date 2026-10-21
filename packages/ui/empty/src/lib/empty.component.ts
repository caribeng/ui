import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * Empty de CaribeNG: estado vacío con icono o imagen, mensaje y acciones
 * opcionales (proyectadas). Úsalo cuando una lista, búsqueda o tabla no tiene
 * datos.
 *
 * @example
 * ```html
 * <cb-empty title="Aún no tienes movimientos" description="Cuando hagas tu primera compra aparecerá aquí.">
 *   <cb-button size="sm">Hacer una transferencia</cb-button>
 * </cb-empty>
 * ```
 */
@Component({
  selector: 'cb-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-empty', '[class.cb-empty--sm]': "size() === 'sm'" },
  template: `
    @if (image()) {
      <img class="cb-empty__image" [src]="image()" alt="" />
    } @else {
      <span class="cb-empty__icon" aria-hidden="true">
        <cb-icon [name]="icon()" [size]="size() === 'sm' ? 22 : 32" />
      </span>
    }
    <p class="cb-empty__title">{{ title() ?? t().noData }}</p>
    @if (description()) {
      <p class="cb-empty__description">{{ description() }}</p>
    }
    <div class="cb-empty__actions"><ng-content /></div>
  `,
  styleUrl: './empty.component.css',
})
export class CbEmpty {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Mensaje principal. Por defecto, "Sin datos" del idioma activo. */
  readonly title = input<string | undefined>(undefined);
  /** Texto de apoyo opcional. */
  readonly description = input<string>('');
  /** Icono (se ignora si hay `image`). */
  readonly icon = input<string>('folder');
  /** Ilustración opcional (decorativa). */
  readonly image = input<string>('');
  /** `sm` para tablas, listas y paneles pequeños. */
  readonly size = input<'sm' | 'md'>('md');
}
