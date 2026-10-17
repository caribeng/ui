import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import type { CbSeverity, CbSize } from '@caribeng/ui';
import { CbIconComponent } from '@caribeng/ui/icon';

export type CbButtonVariant = 'solid' | 'outlined' | 'text';
export type CbButtonType = 'button' | 'submit' | 'reset';

/**
 * Botón de CaribeNG.
 *
 * Renderiza un `<button>` nativo accesible y expone variantes, severidades y
 * estados (`disabled`, `loading`). El evento `click` nativo se propaga al host,
 * por lo que se usa con `(click)` como un botón normal.
 *
 * @example
 * ```html
 * <cb-button severity="primary" (click)="guardar()">Guardar</cb-button>
 * <cb-button variant="outlined" severity="danger" [loading]="borrando()">Borrar</cb-button>
 * ```
 */
@Component({
  selector: 'cb-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: {
    class: 'cb-button-host',
    '[class.cb-button-host--block]': 'fullWidth()',
  },
  template: `
    <button
      class="cb-button"
      [class]="variantClasses()"
      [class.cb-is-loading]="loading()"
      [class.cb-is-disabled]="disabled()"
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <cb-icon class="cb-button__spinner" name="loader" spin [size]="16" aria-hidden="true" />
      }
      <span class="cb-button__content">
        <ng-content />
      </span>
    </button>
  `,
  styleUrl: './button.component.css',
})
export class CbButtonComponent {
  /** Severidad semántica (color). */
  readonly severity = input<CbSeverity>('primary');
  /** Variante visual. */
  readonly variant = input<CbButtonVariant>('solid');
  /** Tamaño del botón. */
  readonly size = input<CbSize>('md');
  /** Deshabilita el botón. */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Muestra un spinner y bloquea la interacción. */
  readonly loading = input<boolean, unknown>(false, { transform: toBoolean });
  /** Ocupa todo el ancho disponible. */
  readonly fullWidth = input<boolean, unknown>(false, { transform: toBoolean });
  /** Tipo nativo del botón. */
  readonly type = input<CbButtonType>('button');

  private static readonly CHROMATIC = new Set<CbSeverity>([
    'primary',
    'success',
    'info',
    'warning',
    'danger',
    'help',
  ]);

  protected readonly variantClasses = computed(() => {
    const severity = this.severity();
    const classes = [
      `cb-button--${severity}`,
      `cb-button--${this.variant()}`,
      `cb-button--${this.size()}`,
    ];
    if (CbButtonComponent.CHROMATIC.has(severity)) {
      classes.push('cb-button--chromatic');
    }
    return classes;
  });
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
