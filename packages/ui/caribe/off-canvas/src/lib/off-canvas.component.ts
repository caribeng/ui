import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  model,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { cbOverlayFocus, injectCbTranslation } from '@caribeng/ui';

/**
 * Off-canvas de Caribe Design: panel lateral deslizable con cabecera, botón de
 * cierre y contenido proyectado.
 *
 * @example
 * ```html
 * <cb-off-canvas title="Filtros" [(open)]="visible">…</cb-off-canvas>
 * ```
 */
@Component({
  selector: 'cb-off-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule],
  host: { class: 'cb-off-canvas-host' },
  template: `
    @if (open()) {
      <aside
        class="cb-off-canvas cb-off-canvas--{{ position() }}"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="(title() ?? t().sidePanel)"
        cdkTrapFocus
        (keydown.escape)="open.set(false)"
      >
        <div class="cb-off-canvas__header">
          <strong class="cb-off-canvas__title">{{ (title() ?? t().sidePanel) }}</strong>
          <button
            #closeBtn
            type="button"
            class="cb-off-canvas__close"
            [attr.aria-label]="t().close"
            (click)="open.set(false)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="cb-off-canvas__body">
          <ng-content />
        </div>
      </aside>
    }
  `,
  styleUrl: './off-canvas.component.css',
})
export class CbOffCanvas {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Título del panel. */
  readonly title = input<string | undefined>(undefined);
  /** Lado de aparición. */
  readonly position = input<'left' | 'right' | 'bottom'>('right');
  /** Estado abierto/cerrado (two-way). */
  readonly open = model<boolean>(false);

  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  constructor() {
    cbOverlayFocus({ open: this.open, initialFocus: () => this.closeBtn()?.nativeElement });
  }
}
