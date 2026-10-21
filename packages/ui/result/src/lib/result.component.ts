import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export type CbResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500';

const ICONS: Record<CbResultStatus, string> = {
  success: 'circle-check',
  error: 'circle-x',
  warning: 'triangle-alert',
  info: 'info',
  '404': 'search',
  '403': 'lock',
  '500': 'circle-alert',
};

/**
 * Result de CaribeNG: pantalla de resultado (operación exitosa, error,
 * aviso) o de error HTTP (404, 403, 500) con título, subtítulo, contenido extra
 * y acciones proyectadas.
 *
 * @example
 * ```html
 * <cb-result status="success" title="Transferencia enviada" subtitle="Comprobante #48213">
 *   <cb-button>Volver al inicio</cb-button>
 * </cb-result>
 * ```
 */
@Component({
  selector: 'cb-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-result', '[class]': "'cb-result cb-result--' + statusClass()" },
  template: `
    @if (isHttp()) {
      <span class="cb-result__code" aria-hidden="true">{{ status() }}</span>
    } @else {
      <span class="cb-result__icon" aria-hidden="true">
        <cb-icon [name]="icon() ?? defaultIcon()" [size]="40" />
      </span>
    }
    <div class="cb-result__title" role="heading" [attr.aria-level]="headingLevel()">{{ title() }}</div>
    @if (subtitle()) {
      <p class="cb-result__subtitle">{{ subtitle() }}</p>
    }
    <div class="cb-result__content"><ng-content /></div>
  `,
  styleUrl: './result.component.css',
})
export class CbResult {
  /** Tipo de resultado: define el icono y el color. */
  readonly status = input<CbResultStatus>('info');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  /** Icono propio (en lugar del del estado). */
  readonly icon = input<string | undefined>(undefined);
  /** Nivel del encabezado del título (por defecto 2). */
  readonly headingLevel = input<number>(2);

  protected readonly isHttp = computed(() => /^\d{3}$/.test(this.status()));
  protected readonly defaultIcon = computed(() => ICONS[this.status()]);
  /** Los errores HTTP usan el color neutro; los demás, el de su estado. */
  protected readonly statusClass = computed(() => (this.isHttp() ? 'http' : this.status()));
}
