import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

let nextFieldsetUid = 0;

/**
 * Fieldset de CaribeNG: contenedor semántico `<fieldset>` con `<legend>` y
 * soporte opcional para expandir/contraer contenido.
 *
 * @example
 * ```html
 * <cb-fieldset legend="Datos personales" toggleable>
 *   <p>Contenido del grupo…</p>
 * </cb-fieldset>
 * ```
 */
@Component({
  selector: 'cb-fieldset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-fieldset',
    '[class.cb-fieldset--toggleable]': 'toggleable()',
    '[class.cb-is-collapsed]': 'collapsed()',
  },
  template: `
    <fieldset class="cb-fieldset__root">
      <legend class="cb-fieldset__legend" [id]="legendId">
        @if (toggleable()) {
          <button
            type="button"
            class="cb-fieldset__toggler"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-controls]="collapsed() ? null : contentId"
            (click)="toggle()"
          >
            <cb-icon
              class="cb-fieldset__icon"
              [name]="collapsed() ? 'plus' : 'minus'"
              [size]="14"
              aria-hidden="true"
            />
            <span class="cb-fieldset__legend-text">{{ legend() }}</span>
          </button>
        } @else {
          <span class="cb-fieldset__legend-label">{{ legend() }}</span>
        }
      </legend>
      @if (!collapsed()) {
        <div
          class="cb-fieldset__content"
          role="region"
          [id]="contentId"
          [attr.aria-labelledby]="legendId"
        >
          <div class="cb-fieldset__body"><ng-content /></div>
        </div>
      }
    </fieldset>
  `,
  styleUrl: './fieldset.component.css',
})
export class CbFieldset {
  private readonly uid = ++nextFieldsetUid;

  /** Texto de la leyenda del fieldset. */
  readonly legend = input<string>('');
  /** Si es true, la leyenda funciona como botón para colapsar/expandir. */
  readonly toggleable = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado colapsado (`[(collapsed)]`). */
  readonly collapsed = model<boolean>(false);

  protected readonly legendId = `cb-fieldset-l-${this.uid}`;
  protected readonly contentId = `cb-fieldset-c-${this.uid}`;

  toggle(): void {
    if (!this.toggleable()) return;
    this.collapsed.set(!this.collapsed());
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
