import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, model, signal } from '@angular/core';
import { CB_CONFIG, cbFormat, cbFormatAmount, injectCbTranslation, type CbSummary } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbMultiSelect } from '@caribeng/ui/multiselect';
import { CbSelect } from '@caribeng/ui/select';
import { cbDownloadXlsx, currencySymbol, type CbXlsxColumn, type CbXlsxRow, type CbXlsxSheet } from '@caribeng/ui/xlsx';
import { aggregate, columnKeys, keyOf, rowTree, splitKey, type CbPivotField, type CbPivotValue, type PivotRowNode } from './pivot-model';

interface FlatRow {
  readonly node: PivotRowNode;
  readonly hasChildren: boolean;
}

let nextUid = 0;

/**
 * Tabla dinámica de CaribeNG: cruza los registros por dimensiones de filas y
 * columnas (cuenta, tercero, centro de costo, mes…) y agrega una o varias medidas.
 *
 * - Filas anidadas que se contraen, con subtotales; totales por fila, por columna y general.
 * - Con `configurable`, el usuario elige desde la propia tabla las dimensiones y la medida.
 * - Importes con la moneda de `provideCaribeNG`, exportación a Excel con niveles.
 *
 * @example
 * ```html
 * <cb-pivot [data]="movimientos" [fields]="dimensiones" [(rows)]="filas" [(columns)]="columnas" [values]="[{ field: 'valor' }]" configurable />
 * ```
 */
@Component({
  selector: 'cb-pivot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton, CbIcon, CbMultiSelect, CbSelect],
  host: { class: 'cb-pivot' },
  template: `
    @if (configurable()) {
      <div class="cb-pv__config" role="group" [attr.aria-label]="t().pivotConfig">
        <div class="cb-pv__field">
          <span class="cb-pv__label" [id]="uid + '-rows'">{{ t().pivotRows }}</span>
          <cb-multiselect [ariaLabelledBy]="uid + '-rows'" [options]="dimensionOptions()" optionValue="value" [value]="$any(rows())" (valueChange)="setRows($any($event))" />
        </div>
        <div class="cb-pv__field">
          <span class="cb-pv__label" [id]="uid + '-cols'">{{ t().pivotColumns }}</span>
          <cb-select [ariaLabelledBy]="uid + '-cols'" [options]="columnOptions()" optionValue="value" [value]="columns().length ? columns()[0] : ''" (valueChange)="columns.set($event ? [$any($event)] : [])" />
        </div>
        <div class="cb-pv__field">
          <span class="cb-pv__label" [id]="uid + '-agg'">{{ t().pivotAggregate }}</span>
          <cb-select [ariaLabelledBy]="uid + '-agg'" [options]="aggregateOptions()" optionValue="value" [value]="aggregateValue()" (valueChange)="aggregateOverride.set($any($event))" />
        </div>
        <span class="cb-pv__spacer"></span>
        <cb-button size="sm" variant="outlined" (click)="exportExcel()">
          <cb-icon name="download" [size]="15" aria-hidden="true" />
          {{ t().reportExcel }}
        </cb-button>
      </div>
    }

    <div class="cb-pv__wrap">
      <table class="cb-pv__table" [attr.aria-label]="ariaLabel() || t().pivotTitle">
        <thead>
          <tr>
            <th scope="col" class="cb-pv__corner" [attr.rowspan]="measures().length > 1 ? 2 : null">{{ rowHeader() }}</th>
            @for (ck of colKeys(); track ck) {
              <th scope="colgroup" class="cb-pv__num" [attr.colspan]="measures().length > 1 ? measures().length : null">{{ colLabel(ck) }}</th>
            }
            <th scope="colgroup" class="cb-pv__num cb-pv__total-col" [attr.colspan]="measures().length > 1 ? measures().length : null">{{ t().tableTotal }}</th>
          </tr>
          @if (measures().length > 1) {
            <tr>
              @for (ck of colKeysWithTotal(); track ck) {
                @for (m of measures(); track $index) {
                  <th scope="col" class="cb-pv__num cb-pv__measure">{{ measureLabel(m) }}</th>
                }
              }
            </tr>
          }
        </thead>
        <tbody>
          @for (r of flat(); track r.node.key) {
            <tr [class.cb-pv__group]="r.hasChildren" [attr.aria-level]="rows().length > 1 ? r.node.level + 1 : null">
              <th scope="row" [style.padding-inline-start]="'calc(0.75rem + ' + r.node.level * 1.1 + 'rem)'">
                @if (r.hasChildren) {
                  <button type="button" class="cb-pv__toggle" [attr.aria-expanded]="!isCollapsed(r.node.key)" (click)="toggle(r.node.key)">
                    <cb-icon name="chevron-right" [size]="13" [class.cb-is-open]="!isCollapsed(r.node.key)" aria-hidden="true" />
                    {{ r.node.label }}
                  </button>
                } @else {
                  {{ r.node.label }}
                }
              </th>
              @for (ck of colKeysWithTotal(); track ck; let last = $last) {
                @for (m of measures(); track $index) {
                  <td class="cb-pv__num" [class.cb-pv__total-col]="last" [class.cb-pv__neg]="(cell(r.node.records, ck, m) ?? 0) < 0">{{ text(cell(r.node.records, ck, m), m) }}</td>
                }
              }
            </tr>
          } @empty {
            <tr>
              <td class="cb-pv__empty" [attr.colspan]="1 + colKeysWithTotal().length * measures().length">{{ t().noData }}</td>
            </tr>
          }
        </tbody>
        @if (data().length) {
          <tfoot>
            <tr>
              <th scope="row">{{ t().tableTotal }}</th>
              @for (ck of colKeysWithTotal(); track ck; let last = $last) {
                @for (m of measures(); track $index) {
                  <td class="cb-pv__num" [class.cb-pv__total-col]="last" [class.cb-pv__neg]="(cell(data(), ck, m) ?? 0) < 0">{{ text(cell(data(), ck, m), m) }}</td>
                }
              }
            </tr>
          </tfoot>
        }
      </table>
    </div>
  `,
  styleUrl: './pivot.component.css',
})
export class CbPivot {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly config = inject(CB_CONFIG);
  protected readonly uid = `cb-pivot-${++nextUid}`;

  /** Registros a cruzar. */
  readonly data = input<readonly Record<string, unknown>[]>([]);
  /** Dimensiones disponibles (clave, etiqueta y formato de sus valores). */
  readonly fields = input<readonly CbPivotField[]>([]);
  /** Dimensiones de las filas, de la más general a la más detallada (bidireccional). */
  readonly rows = model<readonly string[]>([]);
  /** Dimensiones de las columnas (bidireccional). */
  readonly columns = model<readonly string[]>([]);
  /** Medidas (campo y agregación); por defecto, suma. */
  readonly values = input<readonly CbPivotValue[]>([]);
  /** Selectores de filas, columnas y agregación sobre la tabla. */
  readonly configurable = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Las filas con hijos empiezan contraídas. */
  readonly collapsed = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly currency = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly collapsedKeys = signal<ReadonlySet<string> | null>(null);
  protected readonly aggregateOverride = signal<CbSummary | null>(null);

  protected readonly measures = computed<CbPivotValue[]>(() => {
    const override = this.aggregateOverride();
    const list = this.values().length ? this.values() : [{ field: 'value' }];
    return list.map((v) => (override ? { ...v, aggregate: override } : v));
  });
  protected readonly aggregateValue = computed(() => this.aggregateOverride() ?? this.values()[0]?.aggregate ?? 'sum');

  private readonly fieldMap = computed(() => new Map(this.fields().map((f) => [f.key, f])));
  private labelOf = (field: string, value: string): string => {
    const f = this.fieldMap().get(field);
    return f?.format ? f.format(value) : value || this.t().pivotEmpty;
  };

  protected readonly colKeys = computed(() => (this.columns().length ? columnKeys(this.data(), this.columns()) : []));
  protected readonly colKeysWithTotal = computed(() => [...this.colKeys(), '\u0000total']);
  private readonly tree = computed(() => rowTree(this.data(), this.rows(), (f, v) => this.labelOf(f, v)));

  protected readonly flat = computed<FlatRow[]>(() => {
    const out: FlatRow[] = [];
    const collapsed = this.collapsedSet();
    const walk = (nodes: readonly PivotRowNode[]) =>
      nodes.forEach((node) => {
        const hasChildren = node.children.length > 0;
        out.push({ node, hasChildren });
        if (hasChildren && !collapsed.has(node.key)) walk(node.children);
      });
    walk(this.tree());
    return out;
  });

  private collapsedSet(): ReadonlySet<string> {
    const explicit = this.collapsedKeys();
    if (explicit) return explicit;
    if (!this.collapsed()) return new Set();
    const all = new Set<string>();
    const walk = (nodes: readonly PivotRowNode[]) =>
      nodes.forEach((n) => {
        if (!n.children.length) return;
        all.add(n.key);
        walk(n.children);
      });
    walk(this.tree());
    return all;
  }

  protected readonly dimensionOptions = computed(() => this.fields().map((f) => ({ label: f.label, value: f.key })));
  protected readonly columnOptions = computed(() => [{ label: this.t().pivotNone, value: '' }, ...this.dimensionOptions()]);
  protected readonly aggregateOptions = computed(() => {
    const t = this.t();
    return [
      { label: t.pivotSum, value: 'sum' },
      { label: t.pivotCount, value: 'count' },
      { label: t.pivotAvg, value: 'avg' },
      { label: t.pivotMin, value: 'min' },
      { label: t.pivotMax, value: 'max' },
    ];
  });

  protected rowHeader(): string {
    return this.rows()
      .map((r) => this.fieldMap().get(r)?.label ?? r)
      .join(' › ');
  }

  protected colLabel(key: string): string {
    const parts = splitKey(key);
    return parts.map((v, i) => this.labelOf(this.columns()[i], v)).join(' / ');
  }

  protected measureLabel(m: CbPivotValue): string {
    return m.label ?? this.fieldMap().get(m.field)?.label ?? m.field;
  }

  protected cell(records: readonly Record<string, unknown>[], colKey: string, m: CbPivotValue): number | null {
    const subset = colKey === '\u0000total' ? records : records.filter((r) => keyOf(r, this.columns()) === colKey);
    return subset.length ? aggregate(subset, m) : null;
  }

  protected text(value: number | null, m: CbPivotValue): string {
    if (value === null) return '';
    const locale = this.config.numberLocale ?? this.t().intlLocale;
    const agg = m.aggregate ?? 'sum';
    if (agg === 'count' || m.format === 'integer') return cbFormatAmount(value, locale, { decimals: 0 });
    if (m.format === 'number') return cbFormatAmount(value, locale, { negative: this.config.negativeStyle });
    return cbFormatAmount(value, locale, { currency: this.currency() ?? this.config.currency ?? null, negative: this.config.negativeStyle });
  }

  protected isCollapsed(key: string): boolean {
    return this.collapsedSet().has(key);
  }

  protected toggle(key: string): void {
    const next = new Set(this.collapsedSet());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.collapsedKeys.set(next);
  }

  protected setRows(keys: readonly string[]): void {
    // Se respeta el orden de las dimensiones en `fields`.
    const order = this.fields().map((f) => f.key);
    this.rows.set([...keys].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
    this.collapsedKeys.set(null);
  }

  /** Hoja de Excel con todas las filas (con niveles plegables) y los totales. */
  toExcelSheet(): CbXlsxSheet {
    const currency = this.currency() ?? this.config.currency;
    const symbol = currency ? currencySymbol(currency, this.config.numberLocale ?? this.t().intlLocale) : undefined;
    const keys = this.colKeysWithTotal();
    const measures = this.measures();
    const columns: CbXlsxColumn[] = [{ header: this.rowHeader() || this.t().pivotRows }];
    for (const ck of keys) {
      for (const m of measures) {
        const head = ck === '\u0000total' ? this.t().tableTotal : this.colLabel(ck);
        const agg = m.aggregate ?? 'sum';
        columns.push({ header: measures.length > 1 ? `${head} · ${this.measureLabel(m)}` : head, type: agg === 'count' || m.format === 'integer' ? 'integer' : m.format === 'number' || !currency ? 'number' : 'currency', symbol });
      }
    }
    const rows: CbXlsxRow[] = [];
    const walk = (nodes: readonly PivotRowNode[]) =>
      nodes.forEach((n) => {
        rows.push({ level: n.level, indent: n.level, bold: n.children.length > 0, cells: [n.label, ...keys.flatMap((ck) => measures.map((m) => this.cell(n.records, ck, m)))] });
        walk(n.children);
      });
    walk(this.tree());
    return { name: this.ariaLabel() || this.t().pivotTitle, columns, rows, totals: [this.t().tableTotal, ...keys.flatMap((ck) => measures.map((m) => this.cell(this.data(), ck, m)))] };
  }

  exportExcel(filename?: string): void {
    cbDownloadXlsx(filename ?? (this.ariaLabel() || this.t().pivotTitle), this.toExcelSheet());
  }
}
