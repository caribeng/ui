import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
} from '@angular/core';

/**
 * Expansion-panel de Caribe Design: panel colapsable con cabecera pulsable y
 * contenido proyectado.
 *
 * @example
 * ```html
 * <cb-expansion-panel title="Detalles" [(expanded)]="open">…</cb-expansion-panel>
 * ```
 */
@Component({
  selector: 'cb-expansion-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-expansion-panel-host' },
  template: `
    <div class="cb-expansion-panel" [class.cb-is-open]="expanded()">
      <button
        type="button"
        class="cb-expansion-panel__header"
        [attr.aria-expanded]="expanded()"
        (click)="expanded.set(!expanded())"
      >
        <span class="cb-expansion-panel__title">{{ title() }}</span>
        <span class="cb-expansion-panel__chevron" aria-hidden="true">▾</span>
      </button>
      @if (expanded()) {
        <div class="cb-expansion-panel__body">
          <ng-content />
        </div>
      }
    </div>
  `,
  styleUrl: './expansion-panel.component.css',
})
export class CbExpansionPanel {
  /** Título de la cabecera. */
  readonly title = input<string>('Detalles');
  /** Estado abierto/cerrado (two-way). */
  readonly expanded = model<boolean>(false);
}
