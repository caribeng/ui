import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import type { CbSeverity } from '@caribeng/ui';
import { CbToastService } from './toast.service';

export type CbToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

const ICONS: Record<string, string> = {
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
  danger: '✕',
  help: '?',
  primary: '●',
  secondary: '●',
  contrast: '●',
};

/**
 * Contenedor de notificaciones de CaribeNG. Colócalo una vez en la app y
 * dispara mensajes con `CbToastService`.
 *
 * @example
 * ```html
 * <cb-toast position="top-right" />
 * ```
 */
@Component({
  selector: 'cb-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div
      class="cb-toast-wrap"
      [class]="'cb-toast-wrap--' + position()"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      @for (toast of service.toasts(); track toast.id) {
        <div class="cb-toast" [class]="'cb-toast--' + toast.severity" role="alert">
          <span class="cb-toast__icon" aria-hidden="true">{{ iconFor(toast.severity) }}</span>
          <div class="cb-toast__content">
            <p class="cb-toast__summary">{{ toast.summary }}</p>
            @if (toast.detail) {
              <p class="cb-toast__detail">{{ toast.detail }}</p>
            }
          </div>
          @if (toast.closable) {
            <button
              type="button"
              class="cb-toast__close"
              aria-label="Cerrar"
              (click)="service.remove(toast.id)"
            >
              ✕
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.css',
})
export class CbToastComponent {
  protected readonly service = inject(CbToastService);
  readonly position = input<CbToastPosition>('top-right');

  protected iconFor(severity: CbSeverity): string {
    return ICONS[severity] ?? '●';
  }
}
