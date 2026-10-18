import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

let nextPanelUid = 0;

/**
 * Panel de CaribeNG: contenedor con encabezado, cuerpo colapsable opcional y pie.
 *
 * @example
 * ```html
 * <cb-panel header="Detalles" toggleable [(collapsed)]="isCollapsed">
 *   <p>Contenido del panel…</p>
 *   <div cb-panel-footer>Pie del panel</div>
 * </cb-panel>
 * ```
 */
@Component({
  selector: 'cb-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-panel',
    '[class.cb-panel--toggleable]': 'toggleable()',
    '[class.cb-is-collapsed]': 'collapsed()',
  },
  template: `
    <div class="cb-panel__header" [id]="headerId">
      <span class="cb-panel__title">{{ header() }}</span>
      <div class="cb-panel__actions">
        <ng-content select="[cb-panel-icons]" />
        @if (toggleable()) {
          <button
            type="button"
            class="cb-panel__toggler"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-controls]="contentId"
            [attr.aria-label]="header() || 'Alternar panel'"
            (click)="toggle()"
          >
            <cb-icon
              class="cb-panel__chevron"
              [class.cb-is-collapsed]="collapsed()"
              name="chevron-down"
              [size]="16"
              aria-hidden="true"
            />
          </button>
        }
      </div>
    </div>
    @if (!collapsed()) {
      <div
        class="cb-panel__content"
        role="region"
        [id]="contentId"
        [attr.aria-labelledby]="headerId"
      >
        <div class="cb-panel__body"><ng-content /></div>
        <div class="cb-panel__footer"><ng-content select="[cb-panel-footer]" /></div>
      </div>
    }
  `,
  styleUrl: './panel.component.css',
})
export class CbPanel {
  private readonly uid = ++nextPanelUid;

  /** Título mostrado en la cabecera del panel. */
  readonly header = input<string>('');
  /** Permite contraer/expandir el contenido desde la cabecera. */
  readonly toggleable = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado colapsado (soporta two-way binding `[(collapsed)]`). */
  readonly collapsed = model<boolean>(false);
  /** Emitido después de alternar el estado colapsado. */
  readonly collapsedChange2 = output<boolean>();

  protected readonly headerId = `cb-panel-h-${this.uid}`;
  protected readonly contentId = `cb-panel-c-${this.uid}`;

  toggle(): void {
    if (!this.toggleable()) return;
    const next = !this.collapsed();
    this.collapsed.set(next);
    this.collapsedChange2.emit(next);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
