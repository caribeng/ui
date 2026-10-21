import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { CbIcon } from '@caribeng/ui/icon';
import { CbPaginator, type CbPaginatorState } from '@caribeng/ui/paginator';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

/** Cómo compara un filtro el texto buscado con el valor de la celda (sin distinguir mayúsculas ni tildes). */
export type CbTableFilterMatchMode = 'contains' | 'startsWith' | 'equals';

export interface CbTableColumn {
  /** Propiedad de la fila a mostrar. */
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

let nextId = 0;
const MIN_COLUMN_WIDTH = 48;

/**
 * Table de CaribeNG: tabla de datos con columnas declarativas, ordenación,
 * filtros (global y por columna), paginación, selección (simple/múltiple),
 * columnas redimensionables y filas expandibles.
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
    <div class="cb-table__wrap">
      <table
        class="cb-table"
        [class]="'cb-table--' + size()"
        [class.cb-table--striped]="striped()"
        [class.cb-table--hover]="rowHover()"
        [class.cb-table--resizable]="resizableColumns()"
        [attr.aria-label]="ariaLabel() || null"
      >
        <thead>
          <tr>
            @if (expansion()) {
              <th class="cb-table__sel" scope="col"><span class="cb-table__sr">{{ t().details }}</span></th>
            }
            @if (selectionMode() === 'multiple') {
              <th class="cb-table__sel" scope="col">
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
              <th class="cb-table__sel" scope="col"><span class="cb-table__sr">{{ t().select }}</span></th>
            }
            @for (col of columns(); track col.field) {
              <th
                class="cb-table__th"
                scope="col"
                [class.cb-is-sortable]="col.sortable"
                [style.width]="columnWidth(col)"
                [style.text-align]="col.align || null"
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
                <td class="cb-table__sel"></td>
              }
              @if (selectionMode()) {
                <td class="cb-table__sel"></td>
              }
              @for (col of columns(); track col.field) {
                <td class="cb-table__filter-cell">
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
            <tr
              class="cb-table__row"
              [class.cb-is-selected]="isSelected(row)"
              [class.cb-is-selectable]="!!selectionMode()"
              (click)="onRowClick(row)"
            >
              @if (expansion()) {
                <td class="cb-table__sel">
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
                <td class="cb-table__sel">
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
              @for (col of columns(); track col.field) {
                <td class="cb-table__td" [style.text-align]="col.align || null">
                  @if (cellTemplate(col.field); as cell) {
                    <ng-container [ngTemplateOutlet]="cell.template" [ngTemplateOutletContext]="cellContext(row, col)" />
                  } @else {
                    {{ cellValue(row, col) }}
                  }
                </td>
              }
            </tr>
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
      </table>
    </div>
    @if (isFiltering()) {
      <span class="cb-table__sr" aria-live="polite">{{ fmt(t().resultsCount, sorted().length) }}</span>
    }

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
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  protected readonly minColumnWidth = MIN_COLUMN_WIDTH;
  private readonly document = inject(DOCUMENT);
  private readonly cellTemplates = contentChildren(CbTableCellDirective);
  /** Plantilla de fila expandida; si existe, se añade la columna de expandir. */
  protected readonly expansion = contentChild(CbTableRowExpansion);

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

  readonly selection = model<unknown>(null);
  readonly sortChange = output<{ field: string | null; order: 1 | -1 }>();
  readonly filterChange = output<CbTableFilterState>();
  readonly columnResize = output<{ field: string; width: number }>();
  readonly rowExpand = output<unknown>();
  readonly rowCollapse = output<unknown>();

  private readonly sortField = signal<string | null>(null);
  private readonly sortOrder = signal<1 | -1>(1);
  protected readonly columnFilters = signal<Readonly<Partial<Record<string, string>>>>({});
  protected readonly widths = signal<Readonly<Partial<Record<string, number>>>>({});

  protected readonly hasColumnFilters = computed(() => this.columns().some((c) => c.filter));
  protected readonly isFiltering = computed(
    () => !!this.globalFilter().trim() || Object.values(this.columnFilters()).some((v) => !!v?.trim()),
  );

  protected readonly filtered = computed(() => {
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
    const field = this.sortField();
    const data = [...this.filtered()];
    if (!field) return data;
    const order = this.sortOrder();
    return data.sort((a, b) => this.compare(a, b, field) * order);
  });

  /** Primera fila de la página; vuelve a 0 al filtrar u ordenar. */
  protected readonly first = linkedSignal({
    source: () => [this.filtered(), this.sortField(), this.sortOrder()],
    computation: () => 0,
  });

  protected readonly pageRows = computed(() => {
    const data = this.sorted();
    if (!this.paginator()) return data;
    const start = Math.min(this.first(), Math.max(0, data.length - 1));
    return data.slice(start, start + this.rows());
  });

  protected readonly colspan = computed(
    () => this.columns().length + (this.selectionMode() ? 1 : 0) + (this.expansion() ? 1 : 0),
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
  }

  // --- Helpers ---------------------------------------------------------------
  protected cellValue(row: unknown, col: CbTableColumn): unknown {
    return row != null && typeof row === 'object' ? (row as Record<string, unknown>)[col.field] : row;
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

function fieldValue(row: unknown, field: string): unknown {
  return row != null && typeof row === 'object' ? (row as Record<string, unknown>)[field] : row;
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
