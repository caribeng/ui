import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';
import type { CbSeverity } from '@caribeng/ui';

/**
 * Avatar de CaribeNG: imagen, iniciales o icono en círculo/cuadrado.
 *
 * @example
 * ```html
 * <cb-avatar image="/u/ana.jpg" />
 * <cb-avatar label="AP" severity="info" />
 * <cb-avatar icon="user" shape="square" />
 * ```
 */
@Component({
  selector: 'cb-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: {
    class: 'cb-avatar',
    '[class]': "'cb-avatar cb-avatar--' + shape() + ' cb-avatar--' + severity()",
    '[style.width.px]': 'px()',
    '[style.height.px]': 'px()',
    '[style.font-size.px]': 'px() * 0.4',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.role]': 'ariaLabel() ? "img" : null',
  },
  template: `
    @if (image()) {
      <img class="cb-avatar__img" [src]="image()" [alt]="ariaLabel()" />
    } @else if (icon()) {
      <cb-icon [name]="icon()" [size]="px() * 0.5" aria-hidden="true" />
    } @else {
      <span class="cb-avatar__label">{{ label() }}</span>
    }
  `,
  styleUrl: './avatar.component.css',
})
export class CbAvatarComponent {
  /** URL de la imagen. */
  readonly image = input<string>('');
  /** Iniciales o texto corto (si no hay imagen ni icono). */
  readonly label = input<string>('');
  /** Icono (nombre del set de @caribeng/ui/icon). */
  readonly icon = input<string>('');
  /** Tamaño: `sm` (28) · `md` (40) · `lg` (56) · `xl` (80) o un número en px. */
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | number>('md');
  /** Forma. */
  readonly shape = input<'circle' | 'square'>('circle');
  /** Color de fondo cuando se muestran iniciales/icono. */
  readonly severity = input<CbSeverity>('secondary');
  /** Nombre accesible. */
  readonly ariaLabel = input<string>('');

  protected readonly px = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? s : ({ sm: 28, md: 40, lg: 56, xl: 80 }[s] ?? 40);
  });
}
