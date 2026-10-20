import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Modal de Caribe Design: diálogo centrado con backdrop, cabecera, contenido y
 * acciones de confirmación/cancelación.
 *
 * @example
 * ```html
 * <cb-modal title="Confirmar" [(visible)]="open" (confirm)="ok()">…</cb-modal>
 * ```
 */
@Component({
  selector: 'cb-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton],
  template: `
    @if (visible()) {
      <div class="cb-modal__backdrop" (click)="close()">
        <div
          class="cb-modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()"
        >
          <header class="cb-modal__head">
            <h2 class="cb-modal__title">{{ title() }}</h2>
            <button
              type="button"
              class="cb-modal__close"
              [attr.aria-label]="t().close"
              (click)="close()"
            >
              ×
            </button>
          </header>
          <div class="cb-modal__body"><ng-content /></div>
          <footer class="cb-modal__foot">
            <cb-button variant="text" severity="secondary" (click)="close()">
              {{ t().cancel }}
            </cb-button>
            <cb-button (click)="confirm.emit()">{{ (confirmLabel() ?? t().accept) }}</cb-button>
          </footer>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.css',
})
export class CbModal {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly title = input('');
  readonly confirmLabel = input<string | undefined>(undefined);
  readonly visible = model(false);
  readonly confirm = output<void>();
  readonly closed = output<void>();

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
