import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CbIcon } from '@caribeng/ui/icon';
import { CbPaginator, type CbPaginatorState } from '@caribeng/ui/paginator';
import { injectCbTranslation } from '@caribeng/ui';

export interface CbTableColumn {
  /** Propiedad de la fila a mostrar. */
  field: string;
  /** Texto del encabezado. */
  header: string;
  /** Permite ordenar por esta columna. */
  sortable?: boolean;
  /** Alineación del contenido. */
  align?: 'left' | 'center' | 'right';
  /** Ancho CSS de la columna. */
  width?: string;
}

export interface CbTableCellContext {
  $implicit: unknown;
  row: unknown;
  value: unknown;
  col: CbTableColumn;
}

@Directive({
  selector: 'ng-template[cbTableCell]',
  standalone: true,
})
export class CbTableCellDirective {
  readonly cbTableCell = input.required<string>();
  readonly template = inject<TemplateRef<CbTableCellContext>>(TemplateRef);
}

/**
 * Table de CaribeNG: tabla de datos con columnas declarativas, ordenación,
 * paginación y selección (simple/múltiple).
 *
 * @example
 * ```html
 * <cb-table [value]="productos" [columns]="cols" [paginator]="true" [rows]="5"
 *           striped selectionMode="multiple" dataKey="id" [(selection)]="sel" />
 * ```
 */
@Component({
  selector: 'cb-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbPaginator, NgTemplateOutlet],
  host: { class: 'cb-table-host' },
  template: `
    <div class="cb-table__wrap">
      <table class="cb-table" [class]="'cb-table--' + size()" [class.cb-table--striped]="striped()" [class.cb-table--hover]="rowHover()">
        <thead>
          <tr>
            @if (selectionMode() === 'multiple') {
              <th class="cb-table__sel">
                <span
                  class="cb-table__check"
                  [class.cb-is-checked]="allSelected()"
                  role="checkbox"
                  [attr.aria-checked]="allSelected()"
                  tabindex="0"
                  (click)="toggleAll()"
                  (keydown.enter)="toggleAll()"
                  (keydown.space)="toggleAll(); $event.preventDefault()"
                >
                  @if (allSelected()) { <cb-icon name="check" [size]="13" aria-hidden="true" /> }
                </span>
              </th>
            } @else if (selectionMode() === 'single') {
              <th class="cb-table__sel"></th>
            }
            @for (col of columns(); track col.field) {
              <th
                class="cb-table__th"
                [class.cb-is-sortable]="col.sortable"
                [style.width]="col.width || null"
                [style.text-align]="col.align || null"
                [attr.aria-sort]="ariaSort(col)"
                (click)="onSort(col)"
              >
                <span class="cb-table__th-inner">
                  {{ col.header }}
                  @if (col.sortable) {
                    <cb-icon class="cb-table__sort" [name]="sortIcon(col)" [size]="15" aria-hidden="true" />
                  }
                </span>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of pageRows(); track rowKey(row, $index)) {
            <tr
              class="cb-table__row"
              [class.cb-is-selected]="isSelected(row)"
              [class.cb-is-selectable]="!!selectionMode()"
              (click)="onRowClick(row)"
            >
              @if (selectionMode()) {
                <td class="cb-table__sel">
                  <span class="cb-table__check" [class.cb-is-checked]="isSelected(row)" aria-hidden="true">
                    @if (isSelected(row)) { <cb-icon name="check" [size]="13" /> }
                  </span>
                </td>
              }
              @for (col of columns(); track col.field) {
                <td class="cb-table__td" [style.text-align]="col.align || null">
                  @if (cellTemplate(col.field); as cell) {
                    <ng-container
                      [ngTemplateOutlet]="cell.template"
                      [ngTemplateOutletContext]="cellContext(row, col)"
                    />
                  } @else {
                    {{ cellValue(row, col) }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td class="cb-table__empty" [attr.colspan]="colspan()">{{ (emptyMessage() ?? t().noData) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (paginator()) {
      <cb-paginator
        class="cb-table__paginator"
        [totalRecords]="sorted().length"
        [(first)]="first"
        [(rows)]="rows"
        [rowsPerPageOptions]="rowsPerPageOptions()"
        (pageChange)="onPageChange($event)"
      />
    }
  `,
  styleUrl: './table.component.css',
})
export class CbTable {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly cellTemplates = contentChildren(CbTableCellDirective);
  readonly value = input<readonly unknown[]>([]);
  readonly columns = input<readonly CbTableColumn[]>([]);
  readonly paginator = input<boolean, unknown>(false, { transform: toBoolean });
  readonly rows = model<number>(10);
  readonly rowsPerPageOptions = input<readonly number[]>([]);
  readonly striped = input<boolean, unknown>(false, { transform: toBoolean });
  readonly rowHover = input<boolean, unknown>(true, { transform: toBoolean });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly emptyMessage = input<string | undefined>(undefined);
  /** `single`, `multiple` o `null` (sin selección). */
  readonly selectionMode = input<'single' | 'multiple' | null>(null);
  /** Propiedad identificadora para comparar selección (si no, por referencia). */
  readonly dataKey = input<string | null>(null);

  readonly selection = model<unknown>(null);
  readonly sortChange = output<{ field: string | null; order: 1 | -1 }>();

  protected readonly first = signal(0);
  private readonly sortField = signal<string | null>(null);
  private readonly sortOrder = signal<1 | -1>(1);

  protected readonly sorted = computed(() => {
    const field = this.sortField();
    const data = [...this.value()];
    if (!field) return data;
    const order = this.sortOrder();
    return data.sort((a, b) => this.compare(a, b, field) * order);
  });

  protected readonly pageRows = computed(() => {
    const data = this.sorted();
    if (!this.paginator()) return data;
    const start = Math.min(this.first(), Math.max(0, data.length - 1));
    return data.slice(start, start + this.rows());
  });

  protected readonly colspan = computed(
    () => this.columns().length + (this.selectionMode() ? 1 : 0),
  );

  protected readonly allSelected = computed(() => {
    const data = this.sorted();
    if (!data.length) return false;
    const sel = Array.isArray(this.selection()) ? (this.selection() as unknown[]) : [];
    return data.every((row) => sel.some((s) => this.same(s, row)));
  });

  // --- Ordenación ------------------------------------------------------------
  protected onSort(col: CbTableColumn): void {
    if (!col.sortable) return;
    if (this.sortField() === col.field) {
      this.sortOrder.set(this.sortOrder() === 1 ? -1 : 1);
    } else {
      this.sortField.set(col.field);
      this.sortOrder.set(1);
    }
    this.first.set(0);
    this.sortChange.emit({ field: this.sortField(), order: this.sortOrder() });
  }
  protected sortIcon(col: CbTableColumn): string {
    if (this.sortField() !== col.field) return 'arrow-up-down';
    return this.sortOrder() === 1 ? 'chevron-up' : 'chevron-down';
  }
  protected ariaSort(col: CbTableColumn): string | null {
    if (!col.sortable || this.sortField() !== col.field) return col.sortable ? 'none' : null;
    return this.sortOrder() === 1 ? 'ascending' : 'descending';
  }

  // --- Selección -------------------------------------------------------------
  protected onRowClick(row: unknown): void {
    const mode = this.selectionMode();
    if (!mode) return;
    if (mode === 'single') {
      this.selection.set(this.same(this.selection(), row) ? null : row);
    } else {
      const arr = Array.isArray(this.selection()) ? (this.selection() as unknown[]) : [];
      this.selection.set(
        arr.some((s) => this.same(s, row)) ? arr.filter((s) => !this.same(s, row)) : [...arr, row],
      );
    }
  }
  protected toggleAll(): void {
    if (this.selectionMode() !== 'multiple') return;
    this.selection.set(this.allSelected() ? [] : [...this.sorted()]);
  }
  protected isSelected(row: unknown): boolean {
    const sel = this.selection();
    return Array.isArray(sel) ? sel.some((s) => this.same(s, row)) : this.same(sel, row);
  }

  // --- Paginación ------------------------------------------------------------
  protected onPageChange(state: CbPaginatorState): void {
    this.first.set(state.first);
    this.rows.set(state.rows);
  }

  // --- Helpers ---------------------------------------------------------------
  protected cellValue(row: unknown, col: CbTableColumn): unknown {
    return row != null && typeof row === 'object'
      ? (row as Record<string, unknown>)[col.field]
      : row;
  }
  protected cellTemplate(field: string): CbTableCellDirective | undefined {
    return this.cellTemplates().find((cell) => cell.cbTableCell() === field);
  }
  protected cellContext(row: unknown, col: CbTableColumn): CbTableCellContext {
    return { $implicit: row, row, value: this.cellValue(row, col), col };
  }
  protected rowKey(row: unknown, index: number): unknown {
    const key = this.dataKey();
    if (key && row != null && typeof row === 'object') {
      return (row as Record<string, unknown>)[key];
    }
    return index;
  }
  private same(a: unknown, b: unknown): boolean {
    if (a == null || b == null) return a === b;
    const key = this.dataKey();
    if (key && typeof a === 'object' && typeof b === 'object') {
      return (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key];
    }
    return a === b;
  }
  private compare(a: unknown, b: unknown, field: string): number {
    const av = (a as Record<string, unknown>)?.[field];
    const bv = (b as Record<string, unknown>)?.[field];
    if (av == null) return bv == null ? 0 : -1;
    if (bv == null) return 1;
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av).localeCompare(String(bv), undefined, { numeric: true });
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
