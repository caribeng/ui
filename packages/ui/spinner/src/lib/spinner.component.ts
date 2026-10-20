import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { injectCbTranslation, type CbSeverity } from '@caribeng/ui';

/**
 * Spinner de CaribeNG: indicador de carga circular.
 *
 * @example
 * ```html
 * <cb-spinner />
 * <cb-spinner [size]="48" severity="primary" ariaLabel="Cargando" />
 * ```
 */
@Component({
  selector: 'cb-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-spinner',
    '[class]': "'cb-spinner cb-spinner--' + severity()",
    role: 'status',
    '[attr.aria-label]': 'ariaLabel() || t().loading',
  },
  template: `
    <svg
      class="cb-spinner__svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 50 50"
      aria-hidden="true"
    >
      <circle class="cb-spinner__track" cx="25" cy="25" r="20" fill="none" [attr.stroke-width]="strokeWidth()" />
      <circle class="cb-spinner__arc" cx="25" cy="25" r="20" fill="none" [attr.stroke-width]="strokeWidth()" />
    </svg>
  `,
  styleUrl: './spinner.component.css',
})
export class CbSpinner {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Tamaño en píxeles. */
  readonly size = input<number>(32);
  /** Grosor del trazo. */
  readonly strokeWidth = input<number>(4);
  readonly severity = input<CbSeverity>('primary');
  readonly ariaLabel = input<string>('');
}
