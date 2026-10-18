import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

/**
 * Inline-alert de Caribe Design: aviso compacto en línea para formularios y
 * tarjetas, con severidad y cierre opcional.
 *
 * @example
 * ```html
 * <cb-inline-alert status="error" title="Revisa">Monto inválido.</cb-inline-alert>
 * ```
 */
@Component({
  selector: 'cb-inline-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @if (visible()) {
      <div class="cb-inline-alert cb-inline-alert--{{ status() }}" role="status">
        <span class="cb-inline-alert__icon" aria-hidden="true">{{ glyph() }}</span>
        <div class="cb-inline-alert__content">
          @if (title()) {
            <strong class="cb-inline-alert__title">{{ title() }}</strong>
          }
          <span class="cb-inline-alert__body"><ng-content /></span>
        </div>
        @if (closable()) {
          <button
            type="button"
            class="cb-inline-alert__close"
            aria-label="Cerrar"
            (click)="close()"
          >
            ×
          </button>
        }
      </div>
    }
  `,
  styleUrl: './inline-alert.component.css',
})
export class CbInlineAlert {
  readonly title = input('');
  readonly status = input<'success' | 'warning' | 'error' | 'info'>('info');
  readonly closable = input(true);
  readonly visible = model(true);
  readonly closed = output<void>();

  protected glyph(): string {
    switch (this.status()) {
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
