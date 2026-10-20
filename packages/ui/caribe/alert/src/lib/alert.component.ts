import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Alert de Caribe Design: banner de notificación con severidad, título,
 * contenido proyectado y cierre opcional.
 *
 * @example
 * ```html
 * <cb-alert severity="success" title="Listo">Operación completada.</cb-alert>
 * ```
 */
@Component({
  selector: 'cb-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @if (visible()) {
      <section class="cb-alert cb-alert--{{ severity() }}" role="alert">
        <span class="cb-alert__icon" aria-hidden="true">{{ glyph() }}</span>
        <div class="cb-alert__content">
          @if (title()) {
            <strong class="cb-alert__title">{{ title() }}</strong>
          }
          <div class="cb-alert__body"><ng-content /></div>
        </div>
        @if (closable()) {
          <button
            type="button"
            class="cb-alert__close"
            [attr.aria-label]="t().close"
            (click)="close()"
          >
            ×
          </button>
        }
      </section>
    }
  `,
  styleUrl: './alert.component.css',
})
export class CbAlert {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly title = input('');
  readonly severity = input<'success' | 'warning' | 'error' | 'info'>('info');
  readonly closable = input(true);
  readonly visible = model(true);
  readonly closed = output<void>();

  protected glyph(): string {
    switch (this.severity()) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'error':
        return '×';
      default:
        return 'i';
    }
  }

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
