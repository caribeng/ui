import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { CbIcon } from '@caribeng/ui/icon';
import { CbPaginator, type CbPaginatorState } from '@caribeng/ui/paginator';
import { cbDownloadXlsx, currencySymbol, type CbExcelExportOptions, type CbXlsxColumn, type CbXlsxRow, type CbXlsxSheet } from '@caribeng/ui/xlsx';
import { CB_CONFIG, cbFormat, cbFormatAmount, cbSummarize, cbToNumber, injectCbTranslation, type CbNegativeStyle, type CbSummary } from '@caribeng/ui';

/** Cómo compara un filtro el texto buscado con el valor de la celda (sin distinguir mayúsculas ni tildes). */
export type CbTableFilterMatchMode = 'contains' | 'startsWith' | 'equals';

export interface CbTableColumn {
  /** Propiedad de la fila a mostrar. Admite rutas (`cliente.nombre`). */
  field: string;
  /** Texto del encabezado. */
  header: string;
  /** Permite ordenar por esta columna. */
  sortable?: boolean;
  /** Muestra un campo de filtro bajo el encabezado. */
  filter?: boolean;
  /** Comparación del filtro de la columna. Por defecto `contains`. */
  filterMatchMode?: CbTableFilterMatchMode;
  /** Placeholder del filtro de la columna. */
  filterPlaceholder?: string;
  /** Alineación del contenido. */
  align?: 'left' | 'center' | 'right';
  /** Ancho CSS de la columna. */
  width?: string;
  /** Fija la columna a la izquierda al hacer scroll horizontal (las fijas se muestran primero). */
  frozen?: boolean;
  /** Incluir la columna en `toCSV()` / `exportCSV()`. Por defecto `true`. */
  exportable?: boolean;
  /**
   * Formato del valor: `number` (separadores y decimales), `currency` (moneda) o
   * `percent` (`0.15` → 15 %). Los numéricos se alinean a la derecha y los
   * negativos se marcan en rojo.
   */
  type?: 'text' | 'number' | 'currency' | 'percent';
  /** Moneda de una columna `currency` (si no, la de la tabla o `provideCaribeNG({ currency })`). */
  currency?: string;
  /** Decimales fijos de una columna numérica. */
  decimals?: number;
  /** Negativos con signo o entre paréntesis (si no, el de la tabla). */
  negative?: CbNegativeStyle;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la fila llega sin tipar.
  /** Texto propio de la celda (no cambia el valor con el que se ordena, filtra o exporta). */
  format?: (value: any, row: any) => string;
  /**
   * Total de la columna en el pie (y en los subtotales de grupo): `sum`, `avg`,
   * `count`, `min`, `max` o una función con las filas filtradas.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- filas sin tipar.
  summary?: CbSummary | ((rows: readonly any[]) => unknown);
  /** Texto fijo en el pie de esta columna (p. ej. "Total"). */
  footer?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe la fila sin tipar.
export interface CbTableCellContext<T = any> {
  $implicit: T;
  row: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- valor de la celda sin tipar.
  value: any;
  col: CbTableColumn;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe la fila sin tipar.
export interface CbTableRowExpansionContext<T = any> {
  $implicit: T;
  /** Posición de la fila en los datos filtrados y ordenados. */
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- el valor del grupo llega sin tipar.
export interface CbTableGroupHeaderContext<T = any> {
  /** Valor del campo `groupRowsBy` del grupo. */
  $implicit: T;
  /** Filas del grupo (en todos los datos filtrados). */
  count: number;
}

/** Petición de datos en modo `lazy`: la tabla pide la página, el orden y los filtros al servidor. */
export interface CbTableLazyLoadEvent {
  first: number;
  rows: number;
  sortField: string | null;
  sortOrder: 1 | -1;
  globalFilter: string;
  filters: Readonly<Partial<Record<string, string>>>;
}

/** Opciones de `toCSV()` / `exportCSV()`. */
export interface CbTableCsvOptions {
  /** Solo las filas seleccionadas. */
  selectionOnly?: boolean;
  /** Separador de columnas. Por defecto `,`. */
  separator?: string;
}

/** Estado de los filtros, emitido por `filterChange`. */
export interface CbTableFilterState {
  global: string;
  /** Texto de filtro por campo de columna. */
  columns: Readonly<Partial<Record<string, string>>>;
}

/** Plantilla de las celdas de una columna: `<ng-template cbTableCell="campo" let-row let-value="value">`. */
@Directive({
  selector: 'ng-template[cbTableCell]',
  standalone: true,
})
export class CbTableCellDirective {
  readonly cbTableCell = input.required<string>();
  readonly template = inject<TemplateRef<CbTableCellContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTableCellDirective, ctx: unknown): ctx is CbTableCellContext {
    return true;
  }
}

/** Contenido de la fila expandida: `<ng-template cbTableRowExpansion let-row>`. */
@Directive({
  selector: 'ng-template[cbTableRowExpansion]',
  standalone: true,
})
export class CbTableRowExpansion {
  readonly template = inject<TemplateRef<CbTableRowExpansionContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTableRowExpansion, ctx: unknown): ctx is CbTableRowExpansionContext {
    return true;
  }
}

/** Cabecera de grupo: `<ng-template cbTableGroupHeader let-valor let-count="count">`. */
@Directive({
  selector: 'ng-template[cbTableGroupHeader]',
  standalone: true,
})
export class CbTableGroupHeader {
  readonly template = inject<TemplateRef<CbTableGroupHeaderContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTableGroupHeader, ctx: unknown): ctx is CbTableGroupHeaderContext {
    return true;
  }
}

let nextId = 0;
const MIN_COLUMN_WIDTH = 48;

/**
 * Table de CaribeNG: tabla de datos con columnas declarativas, ordenación,
 * filtros (global y por columna), paginación, selección (simple/múltiple),
 * columnas redimensionables y fijas, cabecera fija, filas expandibles y
 * agrupadas, exportación a CSV y carga desde el servidor (`lazy`).
 *
 * @example
 * ```html
 * <input type="search" [(ngModel)]="busqueda" aria-label="Buscar" />
 * <cb-table [value]="productos" [columns]="cols" [globalFilter]="busqueda" [paginator]="true" [rows]="5"
 *           striped selectionMode="multiple" dataKey="id" [(selection)]="sel" resizableColumns>
 *   <ng-template cbTableRowExpansion let-producto>{{ producto.descripcion }}</ng-template>
 * </cb-table>
 * ```
 */
@Component({
  selector: 'cb-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbPaginator, NgTemplateOutlet],
  host: { class: 'cb-table-host' },
  template: `
    <ng-content select="[cbTableHeader]" />
    <div class="cb-table__wrap" [class.cb-table__wrap--scroll]="!!scrollHeight()" [style.max-height]="scrollHeight()">
      <table
        #table
        class="cb-table"
        [class]="'cb-table--' + size()"
        [class.cb-table--striped]="striped()"
        [class.cb-table--hover]="rowHover()"
        [class.cb-table--resizable]="resizableColumns()"
        [class.cb-table--scroll]="!!scrollHeight()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-busy]="loading() || null"
      >
        <thead>
          <tr>
            @if (expansion()) {
              <th class="cb-table__sel" scope="col" data-key="__exp" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__exp')">
                <span class="cb-table__sr">{{ t().details }}</span>
              </th>
            }
            @if (selectionMode() === 'multiple') {
              <th class="cb-table__sel" scope="col" data-key="__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__sel')">
                <span
                  class="cb-table__check"
                  [class.cb-is-checked]="allSelected()"
                  [class.cb-is-mixed]="someSelected()"
                  role="checkbox"
                  [attr.aria-checked]="allSelected() ? 'true' : someSelected() ? 'mixed' : 'false'"
                  [attr.aria-label]="t().selectAllRows"
                  tabindex="0"
                  (click)="toggleAll()"
                  (keydown.space)="toggleAll(); $event.preventDefault()"
                >
                  @if (allSelected()) {
                    <cb-icon name="check" [size]="13" aria-hidden="true" />
                  } @else if (someSelected()) {
                    <cb-icon name="minus" [size]="13" aria-hidden="true" />
                  }
                </span>
              </th>
            } @else if (selectionMode() === 'single') {
              <th class="cb-table__sel" scope="col" data-key="__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__sel')">
                <span class="cb-table__sr">{{ t().select }}</span>
              </th>
            }
            @for (col of displayColumns(); track col.field) {
              <th
                class="cb-table__th"
                scope="col"
                [attr.data-key]="col.field"
                [class.cb-is-frozen]="!!col.frozen"
                [class.cb-is-frozen-last]="col.field === lastFrozen()"
                [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                [class.cb-is-sortable]="col.sortable"
                [style.width]="columnWidth(col)"
                [style.text-align]="alignOf(col)"
                [attr.aria-sort]="ariaSort(col)"
              >
                @if (col.sortable) {
                  <button
                    type="button"
                    class="cb-table__th-inner cb-table__sort-btn"
                    [attr.aria-label]="fmt(t().sortBy, col.header)"
                    (click)="onSort(col)"
                  >
                    {{ col.header }}
                    <cb-icon class="cb-table__sort" [name]="sortIcon(col)" [size]="15" aria-hidden="true" />
                  </button>
                } @else {
                  <span class="cb-table__th-inner">{{ col.header }}</span>
                }
                @if (resizableColumns()) {
                  <span
                    class="cb-table__resizer"
                    role="separator"
                    aria-orientation="vertical"
                    tabindex="0"
                    [attr.aria-label]="fmt(t().resizeColumn, col.header)"
                    [attr.aria-valuenow]="widths()[col.field] ?? null"
                    [attr.aria-valuemin]="minColumnWidth"
                    (pointerdown)="startResize($event, col)"
                    (keydown)="onResizerKeydown($event, col)"
                  ></span>
                }
              </th>
            }
          </tr>
          @if (hasColumnFilters()) {
            <tr class="cb-table__filter-row">
              @if (expansion()) {
                <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__exp')"></td>
              }
              @if (selectionMode()) {
                <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__sel')"></td>
              }
              @for (col of displayColumns(); track col.field) {
                <td
                  class="cb-table__filter-cell"
                  [class.cb-is-frozen]="!!col.frozen"
                  [class.cb-is-frozen-last]="col.field === lastFrozen()"
                  [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                >
                  @if (col.filter) {
                    <input
                      type="search"
                      class="cb-table__filter"
                      [value]="columnFilters()[col.field] ?? ''"
                      [placeholder]="col.filterPlaceholder ?? t().search"
                      [attr.aria-label]="fmt(t().filterBy, col.header)"
                      (input)="filterColumn(col.field, $any($event.target).value)"
                    />
                  }
                </td>
              }
            </tr>
          }
        </thead>
        <tbody>
          @for (row of pageRows(); track rowKey(row, $index); let i = $index) {
            @if (groupRowsBy() && isGroupStart(i)) {
              <tr class="cb-table__group">
                <th scope="rowgroup" [attr.colspan]="colspan()">
                  @if (groupHeader(); as gh) {
                    <ng-container
                      [ngTemplateOutlet]="gh.template"
                      [ngTemplateOutletContext]="{ $implicit: groupOf(row), count: groupCount(row) }"
                    />
                  } @else {
                    {{ groupOf(row) }} <span class="cb-table__group-count">({{ groupCount(row) }})</span>
                  }
                </th>
              </tr>
            }
            <tr
              class="cb-table__row"
              [class.cb-is-selected]="isSelected(row)"
              [class.cb-is-selectable]="!!selectionMode()"
              (click)="onRowClick(row)"
            >
              @if (expansion()) {
                <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__exp')">
                  <button
                    type="button"
                    class="cb-table__expander"
                    [attr.aria-expanded]="isExpanded(row)"
                    [attr.aria-controls]="isExpanded(row) ? expansionId(first() + i) : null"
                    [attr.aria-label]="fmt(t().expandRow, first() + i + 1)"
                    (click)="toggleExpansion(row); $event.stopPropagation()"
                  >
                    <cb-icon [name]="isExpanded(row) ? 'chevron-down' : 'chevron-right'" [size]="15" aria-hidden="true" />
                  </button>
                </td>
              }
              @if (selectionMode()) {
                <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__sel')">
                  <span
                    class="cb-table__check"
                    [class.cb-table__check--radio]="selectionMode() === 'single'"
                    [class.cb-is-checked]="isSelected(row)"
                    [attr.role]="selectionMode() === 'single' ? 'radio' : 'checkbox'"
                    [attr.aria-checked]="isSelected(row)"
                    [attr.aria-label]="fmt(t().selectRow, first() + i + 1)"
                    tabindex="0"
                    (keydown.space)="onRowClick(row); $event.preventDefault()"
                  >
                    @if (isSelected(row)) {
                      <cb-icon name="check" [size]="13" aria-hidden="true" />
                    }
                  </span>
                </td>
              }
              @for (col of displayColumns(); track col.field) {
                <td
                  class="cb-table__td"
                  [class.cb-is-frozen]="!!col.frozen"
                  [class.cb-is-frozen-last]="col.field === lastFrozen()"
                  [class.cb-table__num]="isNumeric(col)"
                  [class.cb-is-negative]="isNegative(cellValue(row, col), col)"
                  [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                  [style.text-align]="alignOf(col)"
                >
                  @if (cellTemplate(col.field); as cell) {
                    <ng-container [ngTemplateOutlet]="cell.template" [ngTemplateOutletContext]="cellContext(row, col)" />
                  } @else {
                    {{ display(cellValue(row, col), col, row) }}
                  }
                </td>
              }
            </tr>
            @if (groupRowsBy() && groupSubtotals() && hasSummary() && isGroupEnd(i)) {
              <tr class="cb-table__subtotal">
                @if (expansion()) {
                  <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__exp')"></td>
                }
                @if (selectionMode()) {
                  <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__sel')"></td>
                }
                @for (col of displayColumns(); track col.field; let c = $index) {
                  @if (c < labelColumn() + labelSpan() && c > labelColumn()) {
                    <!-- cubierta por la etiqueta -->
                  } @else if (c === labelColumn()) {
                    <th
                      scope="row"
                      class="cb-table__td"
                      [attr.colspan]="labelSpan() > 1 ? labelSpan() : null"
                      [class.cb-is-frozen]="!!col.frozen"
                      [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                    >{{ fmt(t().tableSubtotal, groupOf(row)) }}</th>
                  } @else {
                    <td
                      class="cb-table__td"
                      [class.cb-is-frozen]="!!col.frozen"
                      [class.cb-table__num]="isNumeric(col)"
                      [class.cb-is-negative]="isNegative(groupSummary(row, col), col)"
                      [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                      [style.text-align]="alignOf(col)"
                    >{{ summaryText(groupSummary(row, col), col) }}</td>
                  }
                }
              </tr>
            }
            @if (expansion(); as exp) {
              @if (isExpanded(row)) {
                <tr class="cb-table__expansion" [id]="expansionId(first() + i)">
                  <td [attr.colspan]="colspan()">
                    <ng-container
                      [ngTemplateOutlet]="exp.template"
                      [ngTemplateOutletContext]="{ $implicit: row, index: first() + i }"
                    />
                  </td>
                </tr>
              }
            }
          } @empty {
            <tr>
              <td class="cb-table__empty" [attr.colspan]="colspan()">{{ (emptyMessage() ?? t().noData) }}</td>
            </tr>
          }
        </tbody>
        @if (hasFooter() && pageRows().length) {
          <tfoot>
            <tr class="cb-table__foot">
              @if (expansion()) {
                <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__exp')"></td>
              }
              @if (selectionMode()) {
                <td class="cb-table__sel" [class.cb-is-frozen]="hasFrozen()" [style.left.px]="frozenLeft('__sel')"></td>
              }
              @for (col of displayColumns(); track col.field; let c = $index) {
                @if (!hasFooterText() && c < labelColumn() + labelSpan() && c > labelColumn()) {
                  <!-- cubierta por la etiqueta -->
                } @else if (col.footer || (c === labelColumn() && !hasFooterText())) {
                  <th
                    scope="row"
                    class="cb-table__td"
                    [attr.colspan]="!hasFooterText() && labelSpan() > 1 ? labelSpan() : null"
                    [class.cb-is-frozen]="!!col.frozen"
                    [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                    [style.text-align]="hasFooterText() ? alignOf(col) : null"
                  >{{ col.footer || t().tableTotal }}</th>
                } @else {
                  <td
                    class="cb-table__td"
                    [class.cb-is-frozen]="!!col.frozen"
                    [class.cb-table__num]="isNumeric(col)"
                    [class.cb-is-negative]="isNegative(totals()[col.field], col)"
                    [style.left.px]="col.frozen ? frozenLeft(col.field) : null"
                    [style.text-align]="alignOf(col)"
                  >{{ summaryText(totals()[col.field], col) }}</td>
                }
              }
            </tr>
          </tfoot>
        }
      </table>
      @if (loading()) {
        <div class="cb-table__loading" role="status">
          <cb-icon name="loader" [size]="22" [spin]="true" aria-hidden="true" />
          <span class="cb-table__sr">{{ t().loading }}</span>
        </div>
      }
    </div>
    @if (isFiltering()) {
      <span class="cb-table__sr" aria-live="polite">{{ fmt(t().resultsCount, total()) }}</span>
    }

    @if (paginator()) {
      <cb-paginator
        class="cb-table__paginator"
        [totalRecords]="total()"
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
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  protected readonly minColumnWidth = MIN_COLUMN_WIDTH;
  private readonly document = inject(DOCUMENT);
  private readonly cellTemplates = contentChildren(CbTableCellDirective);
  /** Plantilla de fila expandida; si existe, se añade la columna de expandir. */
  protected readonly expansion = contentChild(CbTableRowExpansion);
  /** Plantilla de cabecera de grupo (con `groupRowsBy`). */
  protected readonly groupHeader = contentChild(CbTableGroupHeader);
  private readonly tableRef = viewChild<ElementRef<HTMLTableElement>>('table');

  readonly value = input<readonly unknown[]>([]);
  readonly columns = input<readonly CbTableColumn[]>([]);
  readonly paginator = input<boolean, unknown>(false, { transform: toBoolean });
  readonly rows = model<number>(10);
  readonly rowsPerPageOptions = input<readonly number[]>([]);
  readonly striped = input<boolean, unknown>(false, { transform: toBoolean });
  readonly rowHover = input<boolean, unknown>(true, { transform: toBoolean });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly emptyMessage = input<string | undefined>(undefined);
  /** Nombre accesible de la tabla. */
  readonly ariaLabel = input<string | undefined>(undefined);
  /** `single`, `multiple` o `null` (sin selección). */
  readonly selectionMode = input<'single' | 'multiple' | null>(null);
  /** Propiedad identificadora para comparar selección y filas expandidas (si no, por referencia). */
  readonly dataKey = input<string | null>(null);
  /** Texto del filtro global (two-way). Busca en `globalFilterFields`. */
  readonly globalFilter = model<string>('');
  /** Campos en los que busca el filtro global. Por defecto, los de todas las columnas. */
  readonly globalFilterFields = input<readonly string[] | null>(null);
  /** Permite cambiar el ancho de las columnas arrastrando o con el teclado. */
  readonly resizableColumns = input<boolean, unknown>(false, { transform: toBoolean });
  /** Claves (`dataKey`) o filas expandidas (two-way). */
  readonly expandedRowKeys = model<readonly unknown[]>([]);
  /** Alto máximo (CSS) de la tabla: hace scroll con la cabecera fija. */
  readonly scrollHeight = input<string | null>(null);
  /** Agrupa las filas por este campo, con una fila de cabecera por grupo. */
  readonly groupRowsBy = input<string | null>(null);
  /**
   * Datos desde el servidor: la tabla no filtra, ordena ni pagina; emite `lazyLoad`
   * y muestra `value` tal cual (la página actual).
   */
  readonly lazy = input<boolean, unknown>(false, { transform: toBoolean });
  /** Total de filas en el servidor (modo `lazy`), para el paginador. */
  readonly totalRecords = input<number | null>(null);
  /** Muestra la capa de carga y marca la tabla con `aria-busy`. */
  readonly loading = input<boolean, unknown>(false, { transform: toBoolean });
  /** Con `groupRowsBy`, una fila de subtotal al final de cada grupo (columnas con `summary`). */
  readonly groupSubtotals = input<boolean, unknown>(false, { transform: toBoolean });
  /** Moneda de las columnas `currency` (si no, la de `provideCaribeNG({ currency })`). */
  readonly currency = input<string | undefined>(undefined);
  /** Negativos con signo o entre paréntesis (si no, el de `provideCaribeNG({ negativeStyle })`). */
  readonly negativeStyle = input<CbNegativeStyle | undefined>(undefined);

  readonly selection = model<unknown>(null);
  readonly sortChange = output<{ field: string | null; order: 1 | -1 }>();
  readonly filterChange = output<CbTableFilterState>();
  readonly columnResize = output<{ field: string; width: number }>();
  readonly rowExpand = output<unknown>();
  readonly rowCollapse = output<unknown>();
  /** En modo `lazy`: página, orden y filtros que hay que pedir al servidor. */
  readonly lazyLoad = output<CbTableLazyLoadEvent>();

  private readonly sortField = signal<string | null>(null);
  private readonly sortOrder = signal<1 | -1>(1);
  protected readonly columnFilters = signal<Readonly<Partial<Record<string, string>>>>({});
  protected readonly widths = signal<Readonly<Partial<Record<string, number>>>>({});

  /** Columnas en orden de pantalla: las fijas primero. */
  protected readonly displayColumns = computed(() => [
    ...this.columns().filter((c) => c.frozen),
    ...this.columns().filter((c) => !c.frozen),
  ]);
  protected readonly hasFrozen = computed(() => this.columns().some((c) => c.frozen));
  protected readonly lastFrozen = computed(() => this.displayColumns().filter((c) => c.frozen).at(-1)?.field ?? null);
  /** Desplazamiento `left` (px) de cada celda fija, medido tras el render. */
  private readonly frozenOffsets = signal<Readonly<Partial<Record<string, number>>>>({});

  protected readonly hasColumnFilters = computed(() => this.columns().some((c) => c.filter));
  protected readonly isFiltering = computed(
    () => !!this.globalFilter().trim() || Object.values(this.columnFilters()).some((v) => !!v?.trim()),
  );

  protected readonly filtered = computed(() => {
    if (this.lazy()) return this.value();
    const global = normalize(this.globalFilter());
    const globalFields = this.globalFilterFields() ?? this.columns().map((c) => c.field);
    const columnFilters = Object.entries(this.columnFilters())
      .map(([field, text]) => ({ field, text: normalize(text), mode: this.matchMode(field) }))
      .filter((f) => f.text);
    return this.value().filter(
      (row) =>
        (!global || globalFields.some((field) => matches(fieldValue(row, field), global, 'contains'))) &&
        columnFilters.every((f) => matches(fieldValue(row, f.field), f.text, f.mode)),
    );
  });

  protected readonly sorted = computed(() => {
    if (this.lazy()) return this.value();
    const field = this.sortField();
    const group = this.groupRowsBy();
    const data = [...this.filtered()];
    if (!field && !group) return data;
    const order = this.sortOrder();
    // Con grupos, primero se ordena por el campo del grupo para que sus filas queden juntas.
    return data.sort((a, b) => (group ? this.compare(a, b, group) : 0) || (field ? this.compare(a, b, field) * order : 0));
  });

  /** Filas totales: las del servidor en modo `lazy`, las filtradas si no. */
  protected readonly total = computed(() => (this.lazy() ? (this.totalRecords() ?? this.value().length) : this.sorted().length));

  /** Primera fila de la página; vuelve a 0 al filtrar u ordenar (y, sin `lazy`, al cambiar los datos). */
  protected readonly first = linkedSignal({
    source: () => [
      this.sortField(),
      this.sortOrder(),
      this.globalFilter(),
      this.columnFilters(),
      this.lazy() ? null : this.value(),
    ],
    computation: () => 0,
  });

  /** Filas por grupo en todos los datos (no solo en la página). */
  private readonly groupCounts = computed(() => {
    const field = this.groupRowsBy();
    const counts = new Map<unknown, number>();
    if (!field) return counts;
    for (const row of this.sorted()) {
      const key = fieldValue(row, field);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  });

  protected readonly pageRows = computed(() => {
    const data = this.sorted();
    if (!this.paginator() || this.lazy()) return data;
    const start = Math.min(this.first(), Math.max(0, data.length - 1));
    return data.slice(start, start + this.rows());
  });

  private readonly config = inject(CB_CONFIG);
  protected readonly hasSummary = computed(() => this.columns().some((c) => c.summary));
  protected readonly hasFooterText = computed(() => this.columns().some((c) => c.footer));
  protected readonly hasFooter = computed(() => this.hasSummary() || this.hasFooterText());
  /** Columna donde va la etiqueta "Total" / "Subtotal": la primera sin total. */
  protected readonly labelColumn = computed(() => Math.max(0, this.displayColumns().findIndex((c) => !c.summary)));
  /**
   * Columnas que ocupa la etiqueta: desde la suya hasta la siguiente con total
   * (sin partir columnas fijas de no fijas).
   */
  protected readonly labelSpan = computed(() => {
    const cols = this.displayColumns();
    const start = this.labelColumn();
    let end = start + 1;
    while (end < cols.length && !cols[end].summary && !!cols[end].frozen === !!cols[start].frozen) end++;
    return end - start;
  });
  /** Totales del pie, sobre todas las filas filtradas (no solo la página). */
  protected readonly totals = computed(() => this.summarize(this.sorted()));
  /** Totales por grupo (con `groupSubtotals`). */
  private readonly groupTotals = computed(() => {
    const field = this.groupRowsBy();
    const out = new Map<unknown, Record<string, unknown>>();
    if (!field || !this.groupSubtotals() || !this.hasSummary()) return out;
    const groups = new Map<unknown, unknown[]>();
    for (const row of this.sorted()) {
      const key = fieldValue(row, field);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }
    for (const [key, rows] of groups) out.set(key, this.summarize(rows));
    return out;
  });

  protected readonly colspan = computed(
    () => this.displayColumns().length + (this.selectionMode() ? 1 : 0) + (this.expansion() ? 1 : 0),
  );

  private readonly selectedCount = computed(() => {
    const sel = Array.isArray(this.selection()) ? (this.selection() as unknown[]) : [];
    return this.sorted().filter((row) => sel.some((s) => this.same(s, row))).length;
  });
  protected readonly allSelected = computed(() => this.sorted().length > 0 && this.selectedCount() === this.sorted().length);
  protected readonly someSelected = computed(() => this.selectedCount() > 0 && !this.allSelected());

  private readonly uid = `cb-table-${++nextId}`;
  private stopResize: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopResize?.());
    // En modo lazy, la primera página se pide al montar la tabla.
    afterNextRender(() => {
      if (this.lazy()) this.emitLazy();
    });
    // Columnas fijas: se miden los encabezados para saber dónde anclar cada una.
    afterEveryRender(() => this.measureFrozen());
  }

  // --- Filtros ---------------------------------------------------------------
  /** Aplica el filtro global (equivale a `[globalFilter]`). */
  filterGlobal(text: string): void {
    this.globalFilter.set(text);
    this.emitFilters();
  }
  /** Aplica el filtro de una columna. */
  filterColumn(field: string, text: string): void {
    this.columnFilters.update((f) => ({ ...f, [field]: text }));
    this.emitFilters();
  }
  /** Quita todos los filtros. */
  clearFilters(): void {
    this.globalFilter.set('');
    this.columnFilters.set({});
    this.emitFilters();
  }
  private emitFilters(): void {
    this.filterChange.emit({ global: this.globalFilter(), columns: this.columnFilters() });
    this.emitLazy(0);
  }

  /** Pide al servidor la página actual (solo en modo `lazy`). */
  private emitLazy(first = this.first()): void {
    if (!this.lazy()) return;
    this.lazyLoad.emit({
      first,
      rows: this.rows(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
      globalFilter: this.globalFilter(),
      filters: this.columnFilters(),
    });
  }
  private matchMode(field: string): CbTableFilterMatchMode {
    return this.columns().find((c) => c.field === field)?.filterMatchMode ?? 'contains';
  }

  // --- Ordenación ------------------------------------------------------------
  protected onSort(col: CbTableColumn): void {
    if (!col.sortable) return;
    if (this.sortField() === col.field) {
      this.sortOrder.set(this.sortOrder() === 1 ? -1 : 1);
    } else {
      this.sortField.set(col.field);
      this.sortOrder.set(1);
    }
    this.sortChange.emit({ field: this.sortField(), order: this.sortOrder() });
    this.emitLazy(0);
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

  // --- Filas expandibles -------------------------------------------------------
  protected isExpanded(row: unknown): boolean {
    const key = this.keyOf(row);
    return this.expandedRowKeys().some((k) => k === key);
  }
  /** Expande o contrae una fila. */
  toggleExpansion(row: unknown): void {
    const key = this.keyOf(row);
    if (this.isExpanded(row)) {
      this.expandedRowKeys.update((keys) => keys.filter((k) => k !== key));
      this.rowCollapse.emit(row);
    } else {
      this.expandedRowKeys.update((keys) => [...keys, key]);
      this.rowExpand.emit(row);
    }
  }
  protected expansionId(index: number): string {
    return `${this.uid}-expansion-${index}`;
  }

  // --- Columnas redimensionables ---------------------------------------------------
  protected columnWidth(col: CbTableColumn): string | null {
    const px = this.widths()[col.field];
    return px != null ? `${px}px` : col.width || null;
  }
  protected startResize(event: PointerEvent, col: CbTableColumn): void {
    event.preventDefault();
    event.stopPropagation();
    const th = (event.target as HTMLElement).closest('th');
    const startX = event.clientX;
    const startWidth = this.currentWidth(th, col);
    const move = (e: PointerEvent) => this.setWidth(col.field, startWidth + e.clientX - startX);
    const up = () => {
      this.stopResize?.();
      this.columnResize.emit({ field: col.field, width: this.widths()[col.field] ?? startWidth });
    };
    this.stopResize?.();
    this.document.addEventListener('pointermove', move);
    this.document.addEventListener('pointerup', up);
    this.stopResize = () => {
      this.document.removeEventListener('pointermove', move);
      this.document.removeEventListener('pointerup', up);
      this.stopResize = null;
    };
  }
  /** Flecha izquierda / derecha cambian el ancho (10 px; 50 px con Mayús). */
  protected onResizerKeydown(event: KeyboardEvent, col: CbTableColumn): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = (event.shiftKey ? 50 : 10) * (event.key === 'ArrowLeft' ? -1 : 1);
    const th = (event.target as HTMLElement).closest('th');
    this.setWidth(col.field, this.currentWidth(th, col) + step);
    this.columnResize.emit({ field: col.field, width: this.widths()[col.field] ?? MIN_COLUMN_WIDTH });
  }
  private currentWidth(th: HTMLElement | null, col: CbTableColumn): number {
    return this.widths()[col.field] ?? (th?.getBoundingClientRect().width || parseFloat(col.width ?? '') || 120);
  }
  private setWidth(field: string, width: number): void {
    this.widths.update((w) => ({ ...w, [field]: Math.max(MIN_COLUMN_WIDTH, Math.round(width)) }));
  }

  // --- Paginación ------------------------------------------------------------
  protected onPageChange(state: CbPaginatorState): void {
    this.first.set(state.first);
    this.rows.set(state.rows);
    this.emitLazy(state.first);
  }

  // --- Grupos --------------------------------------------------------------------
  protected groupOf(row: unknown): unknown {
    const field = this.groupRowsBy();
    return field ? fieldValue(row, field) : null;
  }
  protected groupCount(row: unknown): number {
    return this.groupCounts().get(this.groupOf(row)) ?? 0;
  }
  /** La fila cierra grupo si es la última de la página o el siguiente cambia de grupo. */
  protected isGroupEnd(index: number): boolean {
    const rows = this.pageRows();
    return index === rows.length - 1 || this.groupOf(rows[index + 1]) !== this.groupOf(rows[index]);
  }
  protected groupSummary(row: unknown, col: CbTableColumn): unknown {
    return this.groupTotals().get(this.groupOf(row))?.[col.field];
  }
  /** La fila abre grupo si es la primera de la página o cambia el valor del grupo. */
  protected isGroupStart(index: number): boolean {
    const rows = this.pageRows();
    return index === 0 || this.groupOf(rows[index - 1]) !== this.groupOf(rows[index]);
  }

  // --- Columnas fijas ----------------------------------------------------------------
  protected frozenLeft(key: string): number | null {
    return this.hasFrozen() ? (this.frozenOffsets()[key] ?? 0) : null;
  }
  /** Suma los anchos de las celdas fijas anteriores (expandir, selección y columnas `frozen`). */
  private measureFrozen(): void {
    const table = this.tableRef()?.nativeElement;
    if (!table || !this.hasFrozen()) return;
    const frozen = new Set(['__exp', '__sel', ...this.columns().filter((c) => c.frozen).map((c) => c.field)]);
    const offsets: Record<string, number> = {};
    let left = 0;
    for (const th of Array.from(table.querySelectorAll<HTMLElement>('thead tr:first-child > th[data-key]'))) {
      const key = th.dataset['key']!;
      if (!frozen.has(key)) break;
      offsets[key] = Math.round(left);
      left += th.getBoundingClientRect().width;
    }
    const current = this.frozenOffsets();
    const changed = Object.keys(offsets).some((k) => current[k] !== offsets[k]) || Object.keys(current).length !== Object.keys(offsets).length;
    if (changed) this.frozenOffsets.set(offsets);
  }

  // --- Exportación ---------------------------------------------------------------------
  /**
   * Hoja de Excel con las columnas visibles (salvo `exportable: false`) y todas las
   * filas filtradas y ordenadas: importes como números con su formato, subtotales
   * de grupo y totales en negrita.
   */
  toExcelSheet(options: CbExcelExportOptions & CbTableCsvOptions = {}): CbXlsxSheet {
    const cols = this.displayColumns().filter((c) => c.exportable !== false);
    const locale = this.config.numberLocale ?? this.t().intlLocale;
    const columns: CbXlsxColumn[] = cols.map((c) => {
      const currency = c.currency ?? this.currency() ?? this.config.currency;
      const negative = c.negative ?? this.negativeStyle() ?? this.config.negativeStyle;
      return {
        header: c.header,
        type: c.type === 'currency' ? (currency ? 'currency' : 'number') : c.type === 'number' ? 'number' : c.type === 'percent' ? 'percent' : 'text',
        decimals: c.decimals,
        negative,
        symbol: c.type === 'currency' && currency ? currencySymbol(currency, locale) : undefined,
      };
    });
    const cell = (row: unknown, c: CbTableColumn) => {
      const v = fieldValue(row, c.field);
      return c.format && !this.isNumeric(c) ? c.format(v, row) : v;
    };
    const source = options.selectionOnly ? this.sorted().filter((row) => this.isSelected(row)) : this.sorted();
    const rows: CbXlsxRow[] = [];
    const group = this.groupRowsBy();
    source.forEach((row, i) => {
      rows.push({ cells: cols.map((c) => cell(row, c)) });
      const key = group ? fieldValue(row, group) : null;
      if (group && this.groupSubtotals() && this.hasSummary() && (i === source.length - 1 || fieldValue(source[i + 1], group) !== key)) {
        const totals = this.groupTotals().get(key) ?? {};
        rows.push({ bold: true, cells: cols.map((c, ci) => (ci === 0 && !c.summary ? cbFormat(this.t().tableSubtotal, key) : totals[c.field])) });
      }
    });
    const totals = this.hasSummary() ? cols.map((c, ci) => (ci === 0 && !c.summary ? (c.footer ?? this.t().tableTotal) : (this.totals()[c.field] ?? c.footer ?? null))) : undefined;
    return { name: options.sheetName ?? this.ariaLabel() ?? 'Datos', title: options.title, columns, rows, totals };
  }

  /** Descarga las filas en Excel (`nombre.xlsx`) con formatos de número, subtotales y totales. */
  exportExcel(filename = 'datos', options: CbExcelExportOptions & CbTableCsvOptions = {}): void {
    cbDownloadXlsx(filename, this.toExcelSheet(options));
  }

  /**
   * Datos en CSV: columnas visibles (salvo `exportable: false`) y todas las filas
   * filtradas y ordenadas (no solo la página), o las seleccionadas con `selectionOnly`.
   */
  toCSV(options: CbTableCsvOptions = {}): string {
    const sep = options.separator ?? ',';
    const cols = this.displayColumns().filter((c) => c.exportable !== false);
    const rows = options.selectionOnly ? this.sorted().filter((row) => this.isSelected(row)) : this.sorted();
    const cell = (v: unknown) => {
      const text = v == null ? '' : String(v);
      return /["\n\r]/.test(text) || text.includes(sep) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [cols.map((c) => cell(c.header)).join(sep), ...rows.map((row) => cols.map((c) => cell(fieldValue(row, c.field))).join(sep))].join('\r\n');
  }

  /** Descarga el CSV (`nombre.csv`), con BOM para que Excel respete tildes y eñes. */
  exportCSV(filename = 'datos', options: CbTableCsvOptions = {}): void {
    const blob = new Blob(['\uFEFF' + this.toCSV(options)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }

  // --- Formato y totales -----------------------------------------------------------
  /** Totales de las columnas con `summary` sobre unas filas. */
  private summarize(rows: readonly unknown[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const col of this.columns()) {
      if (!col.summary) continue;
      out[col.field] = typeof col.summary === 'function' ? col.summary(rows) : cbSummarize(rows.map((r) => fieldValue(r, col.field)), col.summary);
    }
    return out;
  }
  protected isNumeric(col: CbTableColumn): boolean {
    return col.type === 'number' || col.type === 'currency' || col.type === 'percent';
  }
  protected alignOf(col: CbTableColumn): string | null {
    return col.align || (this.isNumeric(col) ? 'right' : null);
  }
  protected isNegative(value: unknown, col: CbTableColumn): boolean {
    if (!this.isNumeric(col)) return false;
    const n = cbToNumber(value);
    return n !== null && n < 0;
  }
  /** Texto de una celda: `format`, o el formato de su `type`. */
  protected display(value: unknown, col: CbTableColumn, row: unknown): unknown {
    if (col.format) return col.format(value, row);
    return this.isNumeric(col) ? this.formatNumber(value, col) : value;
  }
  /** Texto de un total: con el formato de la columna (una cuenta, como número entero). */
  protected summaryText(value: unknown, col: CbTableColumn): string {
    if (value === undefined || value === null) return '';
    if (col.summary === 'count') return cbFormatAmount(value, this.config.numberLocale ?? this.t().intlLocale, { decimals: 0 });
    if (col.format && typeof col.summary !== 'function') return col.format(value, null);
    return this.isNumeric(col) ? this.formatNumber(value, col) : String(value);
  }
  private formatNumber(value: unknown, col: CbTableColumn): string {
    const locale = this.config.numberLocale ?? this.t().intlLocale;
    const negative = col.negative ?? this.negativeStyle() ?? this.config.negativeStyle ?? 'minus';
    if (col.type === 'percent') {
      const n = cbToNumber(value);
      if (n === null) return value == null ? '' : String(value);
      const text = new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: col.decimals ?? 0, maximumFractionDigits: col.decimals ?? 2 }).format(Math.abs(n));
      return n < 0 ? (negative === 'parens' ? `(${text})` : `-${text}`) : text;
    }
    const currency = col.type === 'currency' ? (col.currency ?? this.currency() ?? this.config.currency ?? null) : null;
    return cbFormatAmount(value, locale, { currency, decimals: col.decimals, negative });
  }

  // --- Helpers ---------------------------------------------------------------
  protected cellValue(row: unknown, col: CbTableColumn): unknown {
    return fieldValue(row, col.field);
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
  /** Clave de una fila: su `dataKey` o la propia fila. */
  private keyOf(row: unknown): unknown {
    const key = this.dataKey();
    return key && row != null && typeof row === 'object' ? (row as Record<string, unknown>)[key] : row;
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
    const av = fieldValue(a, field);
    const bv = fieldValue(b, field);
    if (av == null) return bv == null ? 0 : -1;
    if (bv == null) return 1;
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av).localeCompare(String(bv), undefined, { numeric: true });
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

/** Valor de `field` en la fila; admite rutas (`cliente.nombre`), como `field` en PrimeNG. */
function fieldValue(row: unknown, field: string): unknown {
  if (row == null || typeof row !== 'object') return row;
  const record = row as Record<string, unknown>;
  if (field in record || !field.includes('.')) return record[field];
  return field.split('.').reduce<unknown>((value, key) => (value != null && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), row);
}

/** Minúsculas y sin tildes, para que "jose" encuentre "José". */
function normalize(text: unknown): string {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function matches(value: unknown, text: string, mode: CbTableFilterMatchMode): boolean {
  const v = normalize(value);
  return mode === 'equals' ? v === text : mode === 'startsWith' ? v.startsWith(text) : v.includes(text);
}
