import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  model,
  viewChild,
} from '@angular/core';
import { cbOverlayFocus, injectCbTranslation } from '@caribeng/ui';

/**
 * Pop-over de Caribe Design: disparador con panel flotante de contenido
 * contextual.
 *
 * @example
 * ```html
 * <cb-pop-over triggerLabel="Más info">Detalle contextual…</cb-pop-over>
 * ```
 */
let nextId = 0;

@Component({
  selector: 'cb-pop-over',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="cb-pop-over">
      <button
        type="button"
        class="cb-pop-over__trigger"
        [attr.aria-expanded]="visible()"
        [attr.aria-controls]="visible() ? panelId : null"
        (click)="visible.update((v) => !v)"
      >
        {{ (triggerLabel() ?? t().showInfo) }}
      </button>
      @if (visible()) {
        <section
          class="cb-pop-over__panel"
          role="dialog"
          [id]="panelId"
          [attr.aria-label]="triggerLabel() ?? t().showInfo"
          (keydown.escape)="visible.set(false)"
        >
          <button
            #closeBtn
            type="button"
            class="cb-pop-over__close"
            [attr.aria-label]="t().close"
            (click)="visible.set(false)"
          >
            ×
          </button>
          <div class="cb-pop-over__content"><ng-content /></div>
        </section>
      }
    </div>
  `,
  styleUrl: './pop-over.component.css',
})
export class CbPopOver {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly triggerLabel = input<string | undefined>(undefined);
  readonly visible = model(false);

  protected readonly panelId = `cb-pop-over-${++nextId}`;
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  constructor() {
    cbOverlayFocus({ open: this.visible, initialFocus: () => this.closeBtn()?.nativeElement });
  }
}
