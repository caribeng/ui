import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

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
              aria-label="Cerrar"
              (click)="close()"
            >
              ×
            </button>
          </header>
          <div class="cb-modal__body"><ng-content /></div>
          <footer class="cb-modal__foot">
            <button type="button" class="cb-modal__btn" (click)="close()">
              Cancelar
            </button>
            <button
              type="button"
              class="cb-modal__btn cb-modal__btn--primary"
              (click)="confirm.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.css',
})
export class CbModal {
  readonly title = input('');
  readonly confirmLabel = input('Aceptar');
  readonly visible = model(false);
  readonly confirm = output<void>();
  readonly closed = output<void>();

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
