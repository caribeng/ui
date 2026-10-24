import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, model, output, signal } from '@angular/core';
import { CB_CONFIG, cbFormat, injectCbAmount, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { cbDownloadXlsx, currencySymbol, type CbXlsxSheet } from '@caribeng/ui/xlsx';
import { ageDocuments, agingTotals, cbDefaultBuckets, daysOverdue, toDay, type CbAgingBucket, type CbAgingDocument, type CbAgingRow } from './aging-model';

/** Colores de los tramos, del más reciente al más vencido. */
const TONES = ['var(--cb-color-success-500, #10b981)', 'var(--cb-color-warning-400, #fbbf24)', 'var(--cb-color-warning-600, #f97316)', 'var(--cb-color-danger-500, #ef4444)', 'var(--cb-color-danger-700, #b91c1c)'];

type SortKey = 'party' | 'total' | 'maxDays' | string;

let nextUid = 0;

/**
 * Antigüedad de cartera de CaribeNG: cuentas por cobrar o por pagar repartidas
 * en tramos de vencimiento (por vencer, 1–30, 31–60, 61–90, más de 90 días).
 *
 * - Barra de composición por tramo con importes y porcentajes.
 * - Una fila por tercero, que se abre para ver sus documentos con los días vencidos.
 * - Ordenar por tercero, por total, por antigüedad o por cualquier tramo; totales y Excel.
 *
 * @example
 * ```html
 * <cb-aging title="Cartera por edades" [documents]="facturas" [asOf]="corte" />
 * ```
 */
@Component({
  selector: 'cb-aging',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton, CbIcon],
  host: { class: 'cb-aging' },
  template: `
    <div class="cb-ag__head">
      <div>
        @if (title()) {
          <h2 class="cb-ag__title">{{ title() }}</h2>
        }
        <p class="cb-ag__asof">{{ fmt(t().agingAsOf, longDate(asOf())) }}</p>
      </div>
      <cb-button size="sm" variant="outlined" (click)="exportExcel()">
        <cb-icon name="download" [size]="15" aria-hidden="true" />
        {{ t().reportExcel }}
      </cb-button>
    </div>

    <div class="cb-ag__summary">
      <div class="cb-ag__bar" aria-hidden="true">
        @for (b of bucketList(); track b.key; let i = $index) {
          @if (share(b.key) > 0) {
            <span class="cb-ag__seg" [style.flex-grow]="share(b.key)" [style.background]="tone(i)" [title]="b.label + ': ' + money(totals().buckets[b.key])"></span>
          }
        }
      </div>
      <ul class="cb-ag__legend">
        @for (b of bucketList(); track b.key; let i = $index) {
          <li>
            <span class="cb-ag__dot" [style.background]="tone(i)" aria-hidden="true"></span>
            <span class="cb-ag__legend-label">{{ b.label }}</span>
            <span class="cb-ag__legend-value">{{ money(totals().buckets[b.key]) }}</span>
            <span class="cb-ag__legend-pct">{{ pct(share(b.key)) }}</span>
          </li>
        }
        <li class="cb-ag__legend-total">
          <span class="cb-ag__legend-label">{{ t().tableTotal }}</span>
          <span class="cb-ag__legend-value">{{ money(totals().total) }}</span>
        </li>
      </ul>
    </div>

    <div class="cb-ag__wrap">
      <table class="cb-ag__table" [attr.aria-label]="title() || t().agingTitle">
        <thead>
          <tr>
            <th scope="col" [attr.aria-sort]="ariaSort('party')">
              <button type="button" class="cb-ag__sort" (click)="sortBy('party')">{{ partyHeader() || t().agingParty }}</button>
            </th>
            @for (b of bucketList(); track b.key) {
              <th scope="col" class="cb-ag__num" [attr.aria-sort]="ariaSort(b.key)">
                <button type="button" class="cb-ag__sort" (click)="sortBy(b.key)">{{ b.label }}</button>
              </th>
            }
            <th scope="col" class="cb-ag__num" [attr.aria-sort]="ariaSort('total')">
              <button type="button" class="cb-ag__sort" (click)="sortBy('total')">{{ t().tableTotal }}</button>
            </th>
            <th scope="col" class="cb-ag__num" [attr.aria-sort]="ariaSort('maxDays')">
              <button type="button" class="cb-ag__sort" (click)="sortBy('maxDays')">{{ t().agingMaxDays }}</button>
            </th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.party; let ri = $index) {
            <tr class="cb-ag__row">
              <th scope="row">
                <button
                  type="button"
                  class="cb-ag__toggle"
                  [attr.aria-expanded]="isOpen(row.party)"
                  [attr.aria-controls]="uid + '-docs-' + ri"
                  (click)="toggle(row.party)"
                >
                  <cb-icon name="chevron-right" [size]="14" [class.cb-is-open]="isOpen(row.party)" aria-hidden="true" />
                  {{ row.party }}
                  <span class="cb-ag__count">{{ fmt(t().agingDocs, row.documents.length) }}</span>
                </button>
              </th>
              @for (b of bucketList(); track b.key; let i = $index) {
                <td class="cb-ag__num" [class.cb-ag__late]="i > 0 && row.buckets[b.key] > 0">{{ row.buckets[b.key] ? money(row.buckets[b.key]) : '' }}</td>
              }
              <td class="cb-ag__num cb-ag__strong">{{ money(row.total) }}</td>
              <td class="cb-ag__num" [class.cb-ag__late]="row.maxDays > 0">{{ row.maxDays > 0 ? fmt(t().agingDays, row.maxDays) : t().agingCurrent }}</td>
            </tr>
            @if (isOpen(row.party)) {
              <tr class="cb-ag__docs" [id]="uid + '-docs-' + ri">
                <td [attr.colspan]="bucketList().length + 3">
                  <table class="cb-ag__detail" [attr.aria-label]="fmt(t().agingDocsOf, row.party)">
                    <thead>
                      <tr>
                        <th scope="col">{{ t().agingNumber }}</th>
                        <th scope="col">{{ t().agingDate }}</th>
                        <th scope="col">{{ t().agingDue }}</th>
                        <th scope="col" class="cb-ag__num">{{ t().agingOverdue }}</th>
                        <th scope="col" class="cb-ag__num">{{ t().agingBalance }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (doc of sortedDocs(row); track doc.id) {
                        <tr>
                          <td>
                            @if (documentLinks()) {
                              <button type="button" class="cb-ag__doc" (click)="documentOpen.emit(doc)">{{ doc.number || doc.id }}</button>
                            } @else {
                              {{ doc.number || doc.id }}
                            }
                          </td>
                          <td>{{ doc.date ? shortDate(doc.date) : '' }}</td>
                          <td>{{ shortDate(doc.due) }}</td>
                          <td class="cb-ag__num" [class.cb-ag__late]="days(doc) > 0">{{ days(doc) > 0 ? fmt(t().agingDays, days(doc)) : fmt(t().agingDueIn, -days(doc)) }}</td>
                          <td class="cb-ag__num">{{ money(doc.balance) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </td>
              </tr>
            }
          } @empty {
            <tr>
              <td class="cb-ag__empty" [attr.colspan]="bucketList().length + 3">{{ t().noData }}</td>
            </tr>
          }
        </tbody>
        @if (rows().length) {
          <tfoot>
            <tr>
              <th scope="row">{{ t().tableTotal }}</th>
              @for (b of bucketList(); track b.key) {
                <td class="cb-ag__num">{{ money(totals().buckets[b.key]) }}</td>
              }
              <td class="cb-ag__num">{{ money(totals().total) }}</td>
              <td></td>
            </tr>
          </tfoot>
        }
      </table>
    </div>
  `,
  styleUrl: './aging.component.css',
})
export class CbAging {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly amount = injectCbAmount();
  private readonly config = inject(CB_CONFIG);
  protected readonly uid = `cb-aging-${++nextUid}`;

  readonly title = input<string>('');
  /** Documentos pendientes (tercero, número, fecha, vencimiento y saldo). */
  readonly documents = input<readonly CbAgingDocument[]>([]);
  /** Fecha de corte (hoy por defecto). */
  readonly asOf = input<Date>(new Date());
  /** Tramos (por defecto: por vencer, 1–30, 31–60, 61–90 y más de 90 días). */
  readonly buckets = input<readonly CbAgingBucket[] | null>(null);
  /** Encabezado de la columna de terceros («Cliente», «Proveedor»…). */
  readonly partyHeader = input<string>('');
  /** Orden de las filas (bidireccional): `party`, `total`, `maxDays` o la clave de un tramo. */
  readonly sort = model<{ key: SortKey; order: 1 | -1 }>({ key: 'total', order: -1 });
  /** Los números de documento son botones (`documentOpen`). */
  readonly documentLinks = input<boolean>(false);
  readonly currency = input<string | undefined>(undefined);

  readonly documentOpen = output<CbAgingDocument>();

  private readonly open = signal<ReadonlySet<string>>(new Set());

  protected readonly bucketList = computed(() => {
    const t = this.t();
    return this.buckets() ?? cbDefaultBuckets({ current: t.agingCurrent, range: t.agingRange, over: t.agingOver });
  });

  protected readonly rows = computed<CbAgingRow[]>(() => {
    const rows = ageDocuments(this.documents(), this.bucketList(), this.asOf());
    const { key, order } = this.sort();
    const value = (r: CbAgingRow): number | string => (key === 'party' ? r.party : key === 'total' ? r.total : key === 'maxDays' ? r.maxDays : (r.buckets[key] ?? 0));
    return rows.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      return (typeof va === 'string' ? va.localeCompare(String(vb), this.t().intlLocale) : va - (vb as number)) * order;
    });
  });

  protected readonly totals = computed(() => agingTotals(this.rows(), this.bucketList()));

  protected money(value: number | undefined): string {
    return this.amount(value ?? 0, this.currency() ? { currency: this.currency() } : {});
  }

  protected share(key: string): number {
    const total = this.totals().total;
    return total ? Math.max(0, (this.totals().buckets[key] ?? 0) / total) : 0;
  }

  protected pct(share: number): string {
    return new Intl.NumberFormat(this.t().intlLocale, { style: 'percent', maximumFractionDigits: 1 }).format(share);
  }

  protected tone(i: number): string {
    return TONES[Math.min(i, TONES.length - 1)];
  }

  protected days(doc: CbAgingDocument): number {
    return daysOverdue(doc.due, this.asOf());
  }

  protected sortedDocs(row: CbAgingRow): CbAgingDocument[] {
    return [...row.documents].sort((a, b) => toDay(a.due).getTime() - toDay(b.due).getTime());
  }

  protected shortDate(value: Date | string): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { day: '2-digit', month: 'short', year: 'numeric' }).format(toDay(value)).replace(/\./g, '');
  }

  protected longDate(value: Date): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'long' }).format(value);
  }

  protected isOpen(party: string): boolean {
    return this.open().has(party);
  }

  protected toggle(party: string): void {
    const next = new Set(this.open());
    if (next.has(party)) next.delete(party);
    else next.add(party);
    this.open.set(next);
  }

  protected sortBy(key: SortKey): void {
    const s = this.sort();
    this.sort.set(s.key === key ? { key, order: s.order === 1 ? -1 : 1 } : { key, order: key === 'party' ? 1 : -1 });
  }

  protected ariaSort(key: SortKey): string {
    const s = this.sort();
    return s.key !== key ? 'none' : s.order === 1 ? 'ascending' : 'descending';
  }

  /** Libro de Excel con el resumen por tercero y el detalle de documentos. */
  toExcelSheets(): CbXlsxSheet[] {
    const t = this.t();
    const currency = this.currency() ?? this.config.currency;
    const symbol = currency ? currencySymbol(currency, this.config.numberLocale ?? t.intlLocale) : undefined;
    const money = { type: currency ? ('currency' as const) : ('number' as const), symbol };
    const buckets = this.bucketList();
    const title = [this.title() || t.agingTitle, cbFormat(t.agingAsOf, this.longDate(this.asOf()))];
    return [
      {
        name: t.agingSummary,
        title,
        columns: [{ header: this.partyHeader() || t.agingParty }, ...buckets.map((b) => ({ header: b.label, ...money })), { header: t.tableTotal, ...money }, { header: t.agingMaxDays, type: 'integer' }],
        rows: this.rows().map((r) => [r.party, ...buckets.map((b) => r.buckets[b.key] || null), r.total, Math.max(0, r.maxDays)]),
        totals: [t.tableTotal, ...buckets.map((b) => this.totals().buckets[b.key]), this.totals().total, null],
      },
      {
        name: t.agingDetail,
        title,
        columns: [{ header: this.partyHeader() || t.agingParty }, { header: t.agingNumber }, { header: t.agingDate, type: 'date' }, { header: t.agingDue, type: 'date' }, { header: t.agingOverdue, type: 'integer' }, { header: t.agingBalance, ...money }],
        rows: this.rows().flatMap((r) => this.sortedDocs(r).map((d) => [r.party, d.number ?? String(d.id), d.date ?? null, d.due, this.days(d), d.balance])),
        totals: [t.tableTotal, null, null, null, null, this.totals().total],
      },
    ];
  }

  /** Descarga la cartera en Excel (resumen y detalle). */
  exportExcel(filename?: string): void {
    cbDownloadXlsx(filename ?? (this.title() || this.t().agingTitle), this.toExcelSheets());
  }
}
