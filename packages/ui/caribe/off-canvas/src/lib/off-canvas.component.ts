import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
} from '@angular/core';

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
  host: { class: 'cb-off-canvas-host' },
  template: `
    @if (open()) {
      <aside
        class="cb-off-canvas cb-off-canvas--{{ position() }}"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <div class="cb-off-canvas__header">
          <strong class="cb-off-canvas__title">{{ title() }}</strong>
          <button
            type="button"
            class="cb-off-canvas__close"
            aria-label="Cerrar panel"
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
  /** Título del panel. */
  readonly title = input<string>('Panel lateral');
  /** Lado de aparición. */
  readonly position = input<'left' | 'right' | 'bottom'>('right');
  /** Estado abierto/cerrado (two-way). */
  readonly open = model<boolean>(false);
}
