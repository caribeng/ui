import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Card de CaribeNG: contenedor con encabezado opcional, cuerpo y pie.
 *
 * @example
 * ```html
 * <cb-card header="Título" subtitle="Subtítulo">
 *   <p>Contenido…</p>
 *   <div cb-card-footer>
 *     <cb-button>Acción</cb-button>
 *   </div>
 * </cb-card>
 * ```
 */
@Component({
  selector: 'cb-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-card' },
  template: `
    @if (header() || subtitle()) {
      <div class="cb-card__header">
        @if (header()) {
          <h3 class="cb-card__title">{{ header() }}</h3>
        }
        @if (subtitle()) {
          <p class="cb-card__subtitle">{{ subtitle() }}</p>
        }
      </div>
    }
    <div class="cb-card__body"><ng-content /></div>
    <div class="cb-card__footer"><ng-content select="[cb-card-footer]" /></div>
  `,
  styleUrl: './card.component.css',
})
export class CbCard {
  /** Título del encabezado. */
  readonly header = input<string>('');
  /** Subtítulo bajo el título. */
  readonly subtitle = input<string>('');
}
