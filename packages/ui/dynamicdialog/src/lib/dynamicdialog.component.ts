import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbDialog } from '@caribeng/ui/dialog';

/**
 * Variante declarativa del diálogo dinámico: un `cb-dialog` con título y
 * texto, para casos simples. Para abrir **componentes** con datos y recibir un
 * resultado, usa `CbDialogService.open()`.
 *
 * @example
 * ```html
 * <cb-dynamic-dialog [(visible)]="visible" header="Detalle" content="Tu solicitud fue enviada." />
 * ```
 */
@Component({
  selector: 'cb-dynamic-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbDialog],
  host: { style: 'display: contents' },
  template: `
    <cb-dialog [(visible)]="visible" [header]="header() ?? t().dialog" (onHide)="closed.emit()">
      @if (content()) {
        <p class="cb-dynamic-dialog__text">{{ content() }}</p>
      }
      <ng-content />
    </cb-dialog>
  `,
  styles: [`.cb-dynamic-dialog__text { margin: 0; }`],
})
export class CbDynamicDialog {
  protected readonly t = injectCbTranslation();

  /** Visibilidad (two-way). */
  readonly visible = model(false);
  /** Título. Por defecto, "Diálogo" del idioma activo. */
  readonly header = input<string | undefined>(undefined);
  /** Texto del cuerpo (también se puede proyectar contenido). */
  readonly content = input('');

  /** Se emite al cerrarse. */
  readonly closed = output<void>();
}
