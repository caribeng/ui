import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, model, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';

let nextUid = 0;

/**
 * Diálogo de confirmación (`role="alertdialog"`) con trampa de foco, cierre con
 * Escape (equivale a cancelar) y restauración del foco al cerrarse. Al abrirse,
 * el foco va al botón de cancelar (la opción segura).
 *
 * @example
 * ```html
 * <cb-confirm-dialog
 *   [(visible)]="confirmar"
 *   header="Eliminar cuenta"
 *   message="Esta acción no se puede deshacer."
 *   acceptSeverity="danger"
 *   (accepted)="eliminar()"
 * />
 * ```
 */
@Component({
  selector: 'cb-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule, CbButton],
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (visible()) {
      <div class="cb-confirm-dialog__mask" (click)="reject()">
        <section
          class="cb-confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          cdkTrapFocus
          cdkTrapFocusAutoCapture
          (click)="$event.stopPropagation()"
        >
          <h2 class="cb-confirm-dialog__title" [id]="titleId">{{ header() ?? t().confirm }}</h2>
          <p class="cb-confirm-dialog__message" [id]="messageId">{{ message() ?? t().confirmMessage }}</p>
          <footer class="cb-confirm-dialog__actions">
            <cb-button variant="text" severity="secondary" (click)="reject()">{{ rejectLabel() ?? t().cancel }}</cb-button>
            <cb-button [severity]="acceptSeverity()" (click)="confirm()">{{ acceptLabel() ?? t().accept }}</cb-button>
          </footer>
        </section>
      </div>
    }
  `,
  styleUrl: './confirmdialog.component.css',
})
export class CbConfirmDialog {
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);

  /** Visibilidad (two-way). */
  readonly visible = model(false);
  /** Título. Por defecto, "Confirmar" del idioma activo. */
  readonly header = input<string | undefined>(undefined);
  /** Mensaje. Por defecto, "¿Deseas continuar?" del idioma activo. */
  readonly message = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly rejectLabel = input<string | undefined>(undefined);
  /** Severidad del botón de aceptar (p. ej. `danger` para acciones destructivas). */
  readonly acceptSeverity = input<'primary' | 'danger' | 'success' | 'warning'>('primary');

  readonly accepted = output<void>();
  readonly rejected = output<void>();

  protected readonly titleId = `cb-confirm-dialog-${++nextUid}-title`;
  protected readonly messageId = `${this.titleId.replace('-title', '')}-message`;

  /** Elemento enfocado antes de abrir; recibe el foco de vuelta al cerrar. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.previouslyFocused ??= this.document.activeElement as HTMLElement | null;
      } else if (this.previouslyFocused) {
        const el = this.previouslyFocused;
        this.previouslyFocused = null;
        queueMicrotask(() => el.focus?.());
      }
    });
  }

  protected onEscape(): void {
    if (this.visible()) this.reject();
  }

  protected confirm(): void {
    this.accepted.emit();
    this.visible.set(false);
  }

  protected reject(): void {
    this.rejected.emit();
    this.visible.set(false);
  }
}
