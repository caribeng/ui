import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CbIconComponent } from '@caribeng/ui/icon';

let nextUid = 0;

/**
 * Dialog (modal) de CaribeNG sobre CDK Overlay con trampa de foco (FocusTrap),
 * bloqueo de scroll, cierre con Escape y backdrop, y restauración del foco.
 *
 * @example
 * ```html
 * <cb-button (click)="visible.set(true)">Abrir</cb-button>
 * <cb-dialog [(visible)]="visible" header="Confirmar">
 *   <p>¿Deseas continuar?</p>
 *   <div cb-dialog-footer>
 *     <cb-button variant="text" (click)="visible.set(false)">Cancelar</cb-button>
 *     <cb-button (click)="aceptar()">Aceptar</cb-button>
 *   </div>
 * </cb-dialog>
 * ```
 */
@Component({
  selector: 'cb-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule, CbIconComponent],
  template: `
    <ng-template #tpl>
      <div class="cb-dialog__mask">
        <div
          class="cb-dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="header() ? titleId : null"
          [attr.aria-label]="header() ? null : ariaLabel()"
          [style.width]="width()"
          cdkTrapFocus
          cdkTrapFocusAutoCapture
        >
          @if (header() || closable()) {
            <header class="cb-dialog__header">
              @if (header()) {
                <h2 class="cb-dialog__title" [id]="titleId">{{ header() }}</h2>
              }
              @if (closable()) {
                <button
                  type="button"
                  class="cb-dialog__close"
                  aria-label="Cerrar"
                  (click)="close()"
                >
                  <cb-icon name="x" size="sm" />
                </button>
              }
            </header>
          }
          <div class="cb-dialog__body">
            <ng-content />
          </div>
          <footer class="cb-dialog__footer">
            <ng-content select="[cb-dialog-footer]" />
          </footer>
        </div>
      </div>
    </ng-template>
  `,
  styleUrl: './dialog.component.css',
})
export class CbDialogComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);

  /** Visibilidad del diálogo (two-way). */
  readonly visible = model<boolean>(false);
  /** Título del encabezado. Si se omite, usa `ariaLabel`. */
  readonly header = input<string>('');
  /** Muestra el botón de cerrar (✕). */
  readonly closable = input<boolean, unknown>(true, { transform: toBoolean });
  /** Cierra al hacer clic en el backdrop. */
  readonly dismissableMask = input<boolean, unknown>(true, { transform: toBoolean });
  /** Cierra con la tecla Escape. */
  readonly closeOnEscape = input<boolean, unknown>(true, { transform: toBoolean });
  /** Ancho del panel. */
  readonly width = input<string>('32rem');
  /** Nombre accesible cuando no hay `header`. */
  readonly ariaLabel = input<string>('Diálogo');

  /** Se emite cuando el diálogo se cierra. */
  readonly onHide = output<void>();
  /** Se emite cuando el diálogo se abre. */
  readonly onShow = output<void>();

  protected readonly titleId = `cb-dialog-${++nextUid}-title`;

  private readonly tpl = viewChild<TemplateRef<unknown>>('tpl');
  private overlayRef: OverlayRef | null = null;
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (visible && !this.overlayRef) {
        this.openOverlay();
      } else if (!visible && this.overlayRef) {
        this.disposeOverlay();
      }
    });
  }

  /** Cierra el diálogo. */
  close(): void {
    this.visible.set(false);
  }

  private openOverlay(): void {
    const tpl = this.tpl();
    if (!tpl) return;

    this.previouslyFocused = this.document.activeElement as HTMLElement | null;

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cb-dialog-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    this.overlayRef.attach(new TemplatePortal(tpl, this.vcr));

    this.overlayRef.backdropClick().subscribe(() => {
      if (this.dismissableMask()) this.close();
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' && this.closeOnEscape()) {
        event.preventDefault();
        this.close();
      }
    });

    this.onShow.emit();
  }

  private disposeOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.previouslyFocused?.focus?.();
    this.previouslyFocused = null;
    this.onHide.emit();
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
