import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CB_CONFIG, cbFormat, cbFormatAmount, cbSummarize, cbToNumber, injectCbTranslation, type CbNegativeStyle, type CbSummary } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { cbDownloadXlsx, currencySymbol, type CbExcelExportOptions, type CbXlsxRow, type CbXlsxSheet } from '@caribeng/ui/xlsx';

export interface CbTreeTableColumn {
  field: string;
  header: string;
  /** Formato: `number`, `currency` o `percent` (alineados a la derecha, negativos en rojo). */
  type?: 'text' | 'number' | 'currency' | 'percent';
  /** Moneda de una columna `currency` (si no, la de la tabla o `provideCaribeNG({ currency })`). */
  currency?: string;
  decimals?: number;
  negative?: CbNegativeStyle;
  align?: 'left' | 'center' | 'right';
  width?: string;
  /** Texto propio de la celda. */
  format?: (value: unknown, node: CbTreeTableNode | null) => string;
  /**
   * Total de la columna: en el pie (sobre las hojas) y, con `rollup`, en cada fila
   * padre (sobre sus descendientes). `sum`, `avg`, `count`, `min`, `max` o una
   * función con los datos de las hojas.
   */
  summary?: CbSummary | ((leaves: readonly Record<string, unknown>[]) => unknown);
  /** Texto fijo en el pie de esta columna. */
  footer?: string;
}

export interface CbTreeTableNode {
  /** Identificador único en toda la tabla. */
  key: string;
  data: Record<string, unknown>;
  children?: readonly CbTreeTableNode[];
}

/** Contexto de `<ng-template cbTreeTableCell="campo" let-value let-node="node">`. */
export interface CbTreeTableCellContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe el valor sin tipar.
  $implicit: any;
  node: CbTreeTableNode;
  level: number;
}

/** Plantilla para las celdas de una columna (`cbTreeTableCell="campo"`). */
@Directive({ selector: 'ng-template[cbTreeTableCell]' })
export class CbTreeTableCellTemplate {
  readonly field = input.required<string>({ alias: 'cbTreeTableCell' });
  readonly template = inject<TemplateRef<CbTreeTableCellContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTreeTableCellTemplate, ctx: unknown): ctx is CbTreeTableCellContext {
    return true;
  }
}

/** Fila visible con su nivel y posición, en orden de lectura. */
interface Row {
  node: CbTreeTableNode;
  level: number;
  parentKey: string | null;
  setSize: number;
  posInSet: number;
}

let nextUid = 0;

/**
 * Tabla jerárquica de CaribeNG (patrón *treegrid* de WAI-ARIA): niveles
 * ilimitados con sangría, filas expandibles y navegación con teclado.
 *
 * @example
 * ```html
 * <cb-treetable [value]="nodes" [columns]="columns" ariaLabel="Archivos" />
 * ```
 */
@Component({
  selector: 'cb-treetable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon],
  host: { class: 'cb-treetable-host' },
  template: `
    <table class="cb-treetable" role="treegrid" [attr.aria-label]="ariaLabel() || null" (keydown)="onKeydown($event)">
      <thead>
        <tr>
          @for (col of columns(); track col.field) {
            <th scope="col" [style.text-align]="alignOf(col)" [style.width]="col.width || null">{{ col.header }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.node.key) {
          <tr
            class="cb-treetable__row"
            [class]="rowClass()?.(row.node) ?? ''"
            [class.cb-treetable__row--parent]="rollup() && hasChildren(row.node)"
            [class.cb-treetable__row--activatable]="activateLeaves() && !hasChildren(row.node)"
            (click)="onRowClick(row.node)"
            [id]="rowId(row.node)"
            [attr.aria-level]="row.level"
            [attr.aria-setsize]="row.setSize"
            [attr.aria-posinset]="row.posInSet"
            [attr.aria-expanded]="hasChildren(row.node) ? isExpanded(row.node) : null"
            [attr.tabindex]="row.node.key === tabbableKey() ? 0 : -1"
            (focus)="activeKey.set(row.node.key)"
          >
            @for (col of columns(); track col.field; let first = $first) {
              <td
                [class.cb-treetable__first]="first"
                [class.cb-treetable__num]="isNumeric(col)"
                [class.cb-is-negative]="isNegative(valueOf(row.node, col), col)"
                [style.text-align]="alignOf(col)"
              >
                @if (first) {
                  <span class="cb-treetable__cell">
                  <span
                    class="cb-treetable__indent"
                    [style.inline-size]="'calc(' + (row.level - 1) + ' * var(--cb-treetable-indent, 1.25rem))'"
                    aria-hidden="true"
                  ></span>
                  @if (hasChildren(row.node)) {
                    <button
                      type="button"
                      class="cb-treetable__toggler"
                      tabindex="-1"
                      [attr.aria-label]="fmt(isExpanded(row.node) ? t().collapseItem : t().expandItem, label(row.node))"
                      (click)="toggle(row.node)"
                    >
                      <cb-icon name="chevron-right" [size]="14" [class.cb-is-open]="isExpanded(row.node)" aria-hidden="true" />
                    </button>
                  } @else {
                    <span class="cb-treetable__spacer" aria-hidden="true"></span>
                  }
                  <span class="cb-treetable__label">
                    <ng-container *ngTemplateOutlet="content; context: { row, col }" />
                  </span>
                  </span>
                } @else {
                  <ng-container *ngTemplateOutlet="content; context: { row, col }" />
                }
              </td>
            }
          </tr>
        }
      </tbody>
      <ng-template #content let-row="row" let-col="col">
        @if (cellTemplate(col.field); as tpl) {
          <ng-container *ngTemplateOutlet="tpl; context: { $implicit: valueOf(row.node, col), node: row.node, level: row.level }" />
        } @else {
          {{ display(valueOf(row.node, col), col, row.node) }}
        }
      </ng-template>
      @if (showFooter() && hasFooter() && rows().length) {
        <tfoot>
          <tr class="cb-treetable__foot">
            @for (col of columns(); track col.field; let c = $index) {
              @if (col.footer || (c === labelColumn() && !hasFooterText())) {
                <th scope="row" [style.text-align]="alignOf(col)">{{ col.footer || t().tableTotal }}</th>
              } @else {
                <td [class.cb-treetable__num]="isNumeric(col)" [class.cb-is-negative]="isNegative(totals()[col.field], col)" [style.text-align]="alignOf(col)">
                  {{ summaryText(totals()[col.field], col) }}
                </td>
              }
            }
          </tr>
        </tfoot>
      }
    </table>
  `,
  styleUrl: './treetable.component.css',
})
export class CbTreeTable {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `cb-treetable-${++nextUid}`;

  /** Nodos raíz. */
  readonly value = input<readonly CbTreeTableNode[]>([]);
  /** Columnas; la primera muestra la jerarquía. */
  readonly columns = input<readonly CbTreeTableColumn[]>([]);
  /** Nombre accesible de la tabla. */
  readonly ariaLabel = input<string>('');
  /**
   * Las filas padre muestran, en las columnas con `summary`, el total de sus
   * descendientes (p. ej. el saldo de una cuenta mayor a partir de sus auxiliares).
   */
  readonly rollup = input<boolean, unknown>(false, { transform: (v: unknown) => v !== false && v != null && `${v}` !== 'false' });
  /** Moneda de las columnas `currency` (si no, la de `provideCaribeNG({ currency })`). */
  readonly currency = input<string | undefined>(undefined);
  /** Muestra el pie con los totales de las columnas con `summary`. */
  readonly showFooter = input<boolean, unknown>(true, { transform: (v: unknown) => v !== false && v != null && `${v}` !== 'false' });
  /** Clases CSS extra por fila (p. ej. para filas de total). */
  readonly rowClass = input<((node: CbTreeTableNode) => string | null) | null>(null);
  /** Las filas sin hijos se activan con clic o Enter (`nodeActivate`), p. ej. para ver sus movimientos. */
  readonly activateLeaves = input<boolean, unknown>(false, { transform: (v: unknown) => v !== false && v != null && `${v}` !== 'false' });
  /** Negativos con signo o entre paréntesis (si no, el de `provideCaribeNG({ negativeStyle })`). */
  readonly negativeStyle = input<CbNegativeStyle | undefined>(undefined);

  /** Se emite al expandir una fila. */
  readonly nodeExpand = output<CbTreeTableNode>();
  /** Se emite al contraer una fila. */
  readonly nodeCollapse = output<CbTreeTableNode>();
  /** Con `activateLeaves`: clic o Enter sobre una fila sin hijos. */
  readonly nodeActivate = output<CbTreeTableNode>();

  private readonly cellTemplates = contentChildren(CbTreeTableCellTemplate);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly activeKey = signal<string | null>(null);
  protected readonly tabbableKey = computed(() => this.activeKey() ?? this.value()[0]?.key ?? null);

  /** Filas visibles: las de las ramas expandidas, en orden. */
  protected readonly rows = computed<Row[]>(() => {
    const out: Row[] = [];
    const walk = (nodes: readonly CbTreeTableNode[], level: number, parentKey: string | null) =>
      nodes.forEach((node, i) => {
        out.push({ node, level, parentKey, setSize: nodes.length, posInSet: i + 1 });
        if (node.children?.length && this.expanded().has(node.key)) walk(node.children, level + 1, node.key);
      });
    walk(this.value(), 1, null);
    return out;
  });

  private readonly config = inject(CB_CONFIG);
  protected readonly hasFooterText = computed(() => this.columns().some((c) => c.footer));
  protected readonly hasFooter = computed(() => this.hasFooterText() || this.columns().some((c) => c.summary));
  /** Columna de la etiqueta "Total": la primera sin total. */
  protected readonly labelColumn = computed(() => Math.max(0, this.columns().findIndex((c) => !c.summary)));

  /** Totales de cada nodo con hijos (sobre sus hojas), por columna con `summary`. */
  private readonly aggregates = computed(() => {
    const cols = this.columns().filter((c) => c.summary);
    const out = new Map<string, Record<string, unknown>>();
    if (!cols.length) return out;
    const leavesOf = (node: CbTreeTableNode): Record<string, unknown>[] => {
      if (!node.children?.length) return [node.data];
      const leaves = node.children.flatMap(leavesOf);
      out.set(node.key, this.summarize(cols, leaves));
      return leaves;
    };
    const all = this.value().flatMap(leavesOf);
    out.set('', this.summarize(cols, all));
    return out;
  });

  /** Totales del pie (sobre todas las hojas). */
  protected readonly totals = computed(() => this.aggregates().get('') ?? {});

  /**
   * Hoja de Excel con todas las filas (también las contraídas) agrupadas por
   * nivel con el esquema de Excel, sangría en la primera columna, filas padre en
   * negrita (con sus totales si hay `rollup`) y el total al final.
   */
  toExcelSheet(options: CbExcelExportOptions = {}): CbXlsxSheet {
    const cols = this.columns();
    const locale = this.config.numberLocale ?? this.t().intlLocale;
    const rows: CbXlsxRow[] = [];
    const walk = (nodes: readonly CbTreeTableNode[], level: number) =>
      nodes.forEach((node) => {
        const parent = !!node.children?.length;
        rows.push({ level, indent: level, bold: parent, cells: cols.map((c) => (c.format && !this.isNumeric(c) ? c.format(this.valueOf(node, c), node) : this.valueOf(node, c))) });
        if (parent) walk(node.children!, level + 1);
      });
    walk(this.value(), 0);
    return {
      name: options.sheetName ?? (this.ariaLabel() || 'Datos'),
      title: options.title,
      columns: cols.map((c) => {
        const currency = c.currency ?? this.currency() ?? this.config.currency;
        return {
          header: c.header,
          type: c.type === 'currency' ? (currency ? 'currency' : 'number') : c.type === 'number' ? 'number' : c.type === 'percent' ? 'percent' : 'text',
          decimals: c.decimals,
          negative: c.negative ?? this.negativeStyle() ?? this.config.negativeStyle,
          symbol: c.type === 'currency' && currency ? currencySymbol(currency, locale) : undefined,
        };
      }),
      rows,
      totals: this.hasFooter() ? cols.map((c, i) => (c.footer ?? (i === this.labelColumn() && !this.hasFooterText() ? this.t().tableTotal : (this.totals()[c.field] ?? null)))) : undefined,
    };
  }

  /** Descarga el árbol en Excel (`nombre.xlsx`), con los niveles plegables. */
  exportExcel(filename = 'datos', options: CbExcelExportOptions = {}): void {
    cbDownloadXlsx(filename, this.toExcelSheet(options));
  }

  /** Expande todas las filas. */
  expandAll(): void {
    const keys = new Set<string>();
    const walk = (nodes: readonly CbTreeTableNode[]) =>
      nodes.forEach((n) => {
        if (n.children?.length) {
          keys.add(n.key);
          walk(n.children);
        }
      });
    walk(this.value());
    this.expanded.set(keys);
  }

  /** Expande las filas hasta el nivel `level` (1 = solo las raíces visibles) y contrae el resto. */
  expandToLevel(level: number): void {
    const keys = new Set<string>();
    const walk = (nodes: readonly CbTreeTableNode[], depth: number) =>
      nodes.forEach((n) => {
        if (n.children?.length && depth < level) {
          keys.add(n.key);
          walk(n.children, depth + 1);
        }
      });
    walk(this.value(), 1);
    this.expanded.set(keys);
  }

  /** Contrae todas las filas. */
  collapseAll(): void {
    this.expanded.set(new Set());
  }

  protected hasChildren(node: CbTreeTableNode): boolean {
    return !!node.children?.length;
  }

  protected isExpanded(node: CbTreeTableNode): boolean {
    return this.expanded().has(node.key);
  }

  protected rowId(node: CbTreeTableNode): string {
    return `${this.uid}-${node.key}`;
  }

  /** Texto de la primera columna, para las etiquetas accesibles. */
  protected label(node: CbTreeTableNode): string {
    const field = this.columns()[0]?.field;
    return field ? String(node.data[field] ?? '') : node.key;
  }

  /** Valor de una celda: el total de sus descendientes en las filas padre con `rollup`. */
  protected valueOf(node: CbTreeTableNode, col: CbTreeTableColumn): unknown {
    if (this.rollup() && col.summary && node.children?.length) return this.aggregates().get(node.key)?.[col.field];
    return node.data[col.field];
  }

  protected isNumeric(col: CbTreeTableColumn): boolean {
    return col.type === 'number' || col.type === 'currency' || col.type === 'percent';
  }

  protected alignOf(col: CbTreeTableColumn): string | null {
    return col.align || (this.isNumeric(col) ? 'right' : null);
  }

  protected isNegative(value: unknown, col: CbTreeTableColumn): boolean {
    const n = this.isNumeric(col) ? cbToNumber(value) : null;
    return n !== null && n < 0;
  }

  protected display(value: unknown, col: CbTreeTableColumn, node: CbTreeTableNode | null): unknown {
    if (col.format) return col.format(value, node);
    return this.isNumeric(col) ? this.formatNumber(value, col) : value;
  }

  protected summaryText(value: unknown, col: CbTreeTableColumn): string {
    if (value === undefined || value === null) return '';
    if (col.summary === 'count') return cbFormatAmount(value, this.config.numberLocale ?? this.t().intlLocale, { decimals: 0 });
    return String(this.display(value, col, null) ?? '');
  }

  private summarize(cols: readonly CbTreeTableColumn[], leaves: readonly Record<string, unknown>[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const col of cols) {
      out[col.field] = typeof col.summary === 'function' ? col.summary(leaves) : cbSummarize(leaves.map((d) => d[col.field]), col.summary!);
    }
    return out;
  }

  private formatNumber(value: unknown, col: CbTreeTableColumn): string {
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

  protected cellTemplate(field: string): TemplateRef<CbTreeTableCellContext> | null {
    return this.cellTemplates().find((c) => c.field() === field)?.template ?? null;
  }

  protected onRowClick(node: CbTreeTableNode): void {
    if (this.activateLeaves() && !this.hasChildren(node)) this.nodeActivate.emit(node);
  }

  protected toggle(node: CbTreeTableNode): void {
    this.setExpanded(node, !this.isExpanded(node));
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.rows();
    const index = rows.findIndex((r) => r.node.key === this.tabbableKey());
    if (index < 0) return;
    const current = rows[index];
    let target: Row | undefined;

    switch (event.key) {
      case 'ArrowDown':
        target = rows[index + 1];
        break;
      case 'ArrowUp':
        target = rows[index - 1];
        break;
      case 'Home':
        target = rows[0];
        break;
      case 'End':
        target = rows[rows.length - 1];
        break;
      case 'ArrowRight':
        if (this.hasChildren(current.node) && !this.isExpanded(current.node)) this.setExpanded(current.node, true);
        else if (this.isExpanded(current.node)) target = rows[index + 1];
        break;
      case 'ArrowLeft':
        if (this.isExpanded(current.node)) this.setExpanded(current.node, false);
        else if (current.parentKey) target = rows.find((r) => r.node.key === current.parentKey);
        break;
      case 'Enter':
      case ' ':
        if (this.hasChildren(current.node)) this.toggle(current.node);
        else if (event.key === 'Enter' && this.activateLeaves()) this.nodeActivate.emit(current.node);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target) {
      this.activeKey.set(target.node.key);
      const id = this.rowId(target.node);
      Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('tr[id]'))
        .find((el) => el.id === id)
        ?.focus();
    }
  }

  private setExpanded(node: CbTreeTableNode, open: boolean): void {
    if (open === this.isExpanded(node)) return;
    const next = new Set(this.expanded());
    if (open) next.add(node.key);
    else next.delete(node.key);
    this.expanded.set(next);
    (open ? this.nodeExpand : this.nodeCollapse).emit(node);
  }
}
