import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/**
 * Card-content de Caribe Design: tarjeta de contenido con título, subtítulo,
 * cuerpo proyectado y una acción al pie.
 *
 * @example
 * ```html
 * <cb-card-content title="Promoción" subtitle="Vigente">…</cb-card-content>
 * ```
 */
@Component({
  selector: 'cb-card-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <article class="cb-card-content">
      <header class="cb-card-content__head">
        <strong class="cb-card-content__title">{{ title() }}</strong>
        @if (subtitle()) {
          <span class="cb-card-content__subtitle">{{ subtitle() }}</span>
        }
      </header>
      <div class="cb-card-content__body"><ng-content /></div>
      <footer class="cb-card-content__foot">
        <button
          type="button"
          class="cb-card-content__action"
          (click)="action.emit()"
        >
          {{ actionLabel() }}
        </button>
      </footer>
    </article>
  `,
  styleUrl: './card-content.component.css',
})
export class CbCardContent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly actionLabel = input('Ver detalle');
  readonly action = output<void>();
}
