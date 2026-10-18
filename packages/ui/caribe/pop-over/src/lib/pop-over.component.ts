import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
} from '@angular/core';

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
        {{ triggerLabel() }}
      </button>
      @if (visible()) {
        <section class="cb-pop-over__panel" role="dialog">
          <button
            type="button"
            class="cb-pop-over__close"
            aria-label="Cerrar"
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
  readonly triggerLabel = input('Mostrar información');
  readonly visible = model(false);
}
