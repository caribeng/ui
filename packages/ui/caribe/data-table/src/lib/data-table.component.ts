import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Data-table de Caribe Design: tabla simple de columnas y filas con mensaje de
 * vacío.
 *
 * @example
 * ```html
 * <cb-data-table [columns]="cols" [rows]="data" />
 * ```
 */
@Component({
  selector: 'cb-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="cb-data-table">
      <table class="cb-data-table__table" [attr.aria-label]="ariaLabel() || null">
        <thead>
          <tr>
            @for (col of columns(); track col) {
              <th class="cb-data-table__th" scope="col">{{ col }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr class="cb-data-table__row">
              @for (col of columns(); track col) {
                <td class="cb-data-table__td">{{ row[col] }}</td>
              }
            </tr>
          } @empty {
            <tr>
              <td class="cb-data-table__empty" [attr.colspan]="columns().length">
                {{ (emptyMessage() ?? t().noData) }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './data-table.component.css',
})
export class CbDataTable {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly columns = input<readonly string[]>([]);
  readonly rows = input<readonly Record<string, unknown>[]>([]);
  readonly emptyMessage = input<string | undefined>(undefined);
  /** Nombre accesible de la tabla (p. ej. "Movimientos del mes"). */
  readonly ariaLabel = input<string | undefined>(undefined);
}
