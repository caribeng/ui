import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Pop-over de Caribe Design: disparador con panel flotante de contenido
 * contextual.
 *
 * @example
 * ```html
 * <cb-pop-over triggerLabel="Más info">Detalle contextual…</cb-pop-over>
 * ```
 */
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
        (click)="visible.update((v) => !v)"
      >
        {{ (triggerLabel() ?? t().showInfo) }}
      </button>
      @if (visible()) {
        <section class="cb-pop-over__panel" role="dialog">
          <button
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
}
