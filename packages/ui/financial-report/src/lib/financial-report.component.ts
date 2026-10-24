import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { CB_CONFIG, cbFormat, cbFormatAmount, cbSummarize, injectCbTranslation, type CbNegativeStyle } from '@caribeng/ui';
import { accountLabel, resolveAccounts, type CbAccount, type CbResolvedAccount } from '@caribeng/ui/account-picker';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbTreeTable, type CbTreeTableColumn, type CbTreeTableNode } from '@caribeng/ui/treetable';
import { cbDownloadXlsx, currencySymbol, type CbXlsxRow, type CbXlsxSheet } from '@caribeng/ui/xlsx';

/** Fila de total calculada a partir de cuentas (p. ej. «Utilidad del ejercicio» = 4 − 5 − 6). */
export interface CbReportTotal {
  readonly label: string;
  readonly terms: readonly { readonly code: string; readonly sign?: 1 | -1 }[];
}

/** Valores por cuenta de movimiento: uno por periodo, en el orden de `periods`. */
export type CbReportBalances = Readonly<Record<string, readonly (number | null)[]>>;

let nextUid = 0;

/**
 * Informe financiero jerárquico de CaribeNG: balance general, estado de resultados
 * o balance de prueba a partir del plan de cuentas y los saldos de las cuentas de
 * movimiento.
 *
 * - Cada cuenta mayor suma a sus auxiliares; los niveles se abren con los botones
 *   «Nivel 1…N» y se pueden ocultar las cuentas en cero.
 * - Varios periodos en columnas y, con `comparative`, la variación y el % del
 *   primero frente al segundo.
 * - Totales calculados (`totals`), saldos de naturaleza crédito en positivo
 *   (`signByNature`), exportación a Excel con niveles plegables e impresión.
 * - Clic o Enter en una cuenta de movimiento emite `accountOpen` (ver sus movimientos).
 *
 * @example
 * ```html
 * <cb-financial-report title="Estado de resultados" [accounts]="puc" [balances]="saldos" [periods]="['2026', '2025']" comparative [classes]="['4', '5', '6']" [totals]="utilidad" />
 * ```
 */
@Component({
  selector: 'cb-financial-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbTreeTable, CbButton, CbIcon],
  host: { class: 'cb-financial-report' },
  template: `
    @if (title() || subtitle().length) {
      <header class="cb-fr__head">
        @if (title()) {
          <h2 class="cb-fr__title" [id]="uid + '-title'">{{ title() }}</h2>
        }
        @for (line of subtitle(); track $index) {
          <p class="cb-fr__subtitle">{{ line }}</p>
        }
      </header>
    }

    @if (toolbar()) {
      <div class="cb-fr__toolbar" role="toolbar" [attr.aria-label]="t().reportToolbar">
        <div class="cb-fr__levels" role="group" [attr.aria-label]="t().reportLevel">
          @for (n of levels(); track n) {
            <button type="button" class="cb-fr__level" [attr.aria-pressed]="level() === n" [attr.aria-label]="fmt(t().reportLevelN, n)" (click)="level.set(n)">{{ n }}</button>
          }
        </div>
        <button type="button" class="cb-fr__toggle" [attr.aria-pressed]="hideZero()" (click)="hideZero.set(!hideZero())">
          <cb-icon [name]="hideZero() ? 'eye-off' : 'eye'" [size]="15" aria-hidden="true" />
          {{ t().reportHideZero }}
        </button>
        <span class="cb-fr__spacer"></span>
        <cb-button size="sm" variant="outlined" (click)="exportExcel()">
          <cb-icon name="download" [size]="15" aria-hidden="true" />
          {{ t().reportExcel }}
        </cb-button>
        <cb-button size="sm" variant="text" (click)="print()">
          <cb-icon name="file" [size]="15" aria-hidden="true" />
          {{ t().reportPrint }}
        </cb-button>
      </div>
    }

    <cb-treetable
      [value]="nodes()"
      [columns]="columns()"
      rollup
      [showFooter]="false"
      [currency]="currency()"
      [negativeStyle]="negativeStyle()"
      [rowClass]="rowClass"
      [activateLeaves]="true"
      [ariaLabel]="title() || t().reportTitle"
      (nodeActivate)="onActivate($event)"
    />
  `,
  styleUrl: './financial-report.component.css',
})
export class CbFinancialReport {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly config = inject(CB_CONFIG);
  protected readonly uid = `cb-financial-report-${++nextUid}`;
  private readonly tree = viewChild.required(CbTreeTable);

  readonly title = input<string>('');
  /** Líneas bajo el título (empresa, NIT, periodo). */
  readonly subtitle = input<readonly string[]>([]);
  /** Plan de cuentas. */
  readonly accounts = input<readonly CbAccount[]>([]);
  /** Saldos de las cuentas de movimiento, uno por periodo. */
  readonly balances = input<CbReportBalances>({});
  /** Nombres de los periodos (columnas). */
  readonly periods = input<readonly string[]>([]);
  /** Columnas de variación y % del primer periodo frente al segundo. */
  readonly comparative = input<boolean, unknown>(false, { transform: booleanAttribute });
  /**
   * Clases (cuentas raíz) que se muestran: `['1', '2', '3']` para el balance. Todas
   * por defecto. Los `totals` pueden usar cualquier cuenta, también de otras clases.
   */
  readonly classes = input<readonly string[] | null>(null);
  /** Muestra en positivo los saldos de naturaleza crédito (pasivo, patrimonio, ingresos). */
  readonly signByNature = input<boolean, unknown>(true, { transform: booleanAttribute });
  /** Filas de total al final. */
  readonly totals = input<readonly CbReportTotal[]>([]);
  /** Niveles abiertos (1 = solo las clases). */
  readonly level = model<number>(2);
  /** Oculta las cuentas cuyos saldos son todos cero. */
  readonly hideZero = model<boolean>(false);
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly currency = input<string | undefined>(undefined);
  readonly negativeStyle = input<CbNegativeStyle | undefined>('parens');

  /** Clic o Enter en una cuenta de movimiento. */
  readonly accountOpen = output<CbAccount>();

  private readonly resolved = computed(() => resolveAccounts(this.accounts()));
  private readonly byCode = computed(() => new Map(this.resolved().map((a) => [a.code, a])));

  /** Signo de cada cuenta según la naturaleza de su clase. */
  private signOf(acc: CbResolvedAccount): number {
    if (!this.signByNature()) return 1;
    const nature = acc.nature ?? acc.ancestors.find((a) => a.nature)?.nature ?? (['2', '3', '4'].includes(acc.code[0]) ? 'credit' : 'debit');
    return nature === 'credit' ? -1 : 1;
  }

  /** Árbol de todo el plan de cuentas con los saldos (con signo) en las hojas. */
  private readonly allNodes = computed<CbTreeTableNode[]>(() => {
    const periods = this.periods().length;
    const balances = this.balances();
    const all = this.resolved();
    const childrenOf = new Map<string, CbResolvedAccount[]>();
    const roots: CbResolvedAccount[] = [];
    const present = new Set(all.map((a) => a.code));
    for (const a of all) {
      const parent = [...a.ancestors].reverse().find((p) => present.has(p.code));
      if (parent) {
        if (!childrenOf.has(parent.code)) childrenOf.set(parent.code, []);
        childrenOf.get(parent.code)!.push(a);
      } else roots.push(a);
    }
    const build = (a: CbResolvedAccount): CbTreeTableNode => {
      const kids = childrenOf.get(a.code) ?? [];
      const data: Record<string, unknown> = { cuenta: accountLabel(a), code: a.code };
      if (!kids.length) {
        const sign = this.signOf(a);
        const values = balances[a.code] ?? [];
        for (let i = 0; i < periods; i++) data[`p${i}`] = values[i] == null ? 0 : sign * (values[i] as number);
        if (this.comparative() && periods >= 2) {
          data['var'] = (data['p0'] as number) - (data['p1'] as number);
          data['pct'] = (data['p1'] as number) ? (data['var'] as number) / Math.abs(data['p1'] as number) : null;
        }
      }
      return { key: a.code, data, children: kids.length ? kids.map(build) : undefined };
    };
    return roots.map(build);
  });

  /** Árbol del informe: solo las clases pedidas (`classes`). */
  private readonly baseNodes = computed<CbTreeTableNode[]>(() => {
    const allowed = this.classes();
    return allowed ? this.allNodes().filter((n) => allowed.some((c) => n.key.startsWith(c))) : this.allNodes();
  });

  /** Árbol mostrado: sin las cuentas en cero (si se pide) y con las filas de total. */
  protected readonly nodes = computed<CbTreeTableNode[]>(() => {
    const periods = this.periods().length;
    const isZero = (n: CbTreeTableNode): boolean =>
      n.children?.length ? n.children.every(isZero) : Array.from({ length: periods }, (_, i) => n.data[`p${i}`]).every((v) => !v);
    const prune = (nodes: readonly CbTreeTableNode[]): CbTreeTableNode[] =>
      nodes.filter((n) => !isZero(n)).map((n) => (n.children?.length ? { ...n, children: prune(n.children) } : n));
    const tree = this.hideZero() ? prune(this.baseNodes()) : this.baseNodes();
    return [...tree, ...this.totalNodes()];
  });

  /** Total (con signo) de una cuenta en cada periodo, sumando sus hojas. */
  private readonly sums = computed(() => {
    const periods = this.periods().length;
    const out = new Map<string, number[]>();
    const walk = (n: CbTreeTableNode): number[] => {
      const v = n.children?.length
        ? n.children.map(walk).reduce((acc, x) => acc.map((a, i) => a + x[i]), new Array(periods).fill(0))
        : Array.from({ length: periods }, (_, i) => (n.data[`p${i}`] as number) ?? 0);
      out.set(n.key, v);
      return v;
    };
    // Sobre todo el plan: un total puede usar cuentas fuera de las clases mostradas.
    this.allNodes().forEach(walk);
    return out;
  });

  private readonly totalNodes = computed<CbTreeTableNode[]>(() => {
    const periods = this.periods().length;
    return this.totals().map((total, ti) => {
      const values = new Array(periods).fill(0);
      for (const term of total.terms) {
        const v = this.sums().get(term.code) ?? new Array(periods).fill(0);
        v.forEach((x, i) => (values[i] = Math.round((values[i] + (term.sign ?? 1) * x) * 100) / 100));
      }
      const data: Record<string, unknown> = { cuenta: total.label };
      values.forEach((v, i) => (data[`p${i}`] = v));
      if (this.comparative() && periods >= 2) {
        data['var'] = values[0] - values[1];
        data['pct'] = values[1] ? (values[0] - values[1]) / Math.abs(values[1]) : null;
      }
      return { key: `__total${ti}`, data };
    });
  });

  protected readonly columns = computed<CbTreeTableColumn[]>(() => {
    const t = this.t();
    const cols: CbTreeTableColumn[] = [{ field: 'cuenta', header: t.journalAccount }];
    this.periods().forEach((p, i) => cols.push({ field: `p${i}`, header: p, type: 'currency', summary: 'sum' }));
    if (this.comparative() && this.periods().length >= 2) {
      cols.push(
        { field: 'var', header: t.reportVariation, type: 'currency', summary: (leaves) => (cbSummarize(leaves.map((d) => d['p0']), 'sum') ?? 0) - (cbSummarize(leaves.map((d) => d['p1']), 'sum') ?? 0) },
        {
          field: 'pct',
          header: '%',
          type: 'percent',
          decimals: 1,
          summary: (leaves) => {
            const cur = cbSummarize(leaves.map((d) => d['p0']), 'sum') ?? 0;
            const prev = cbSummarize(leaves.map((d) => d['p1']), 'sum') ?? 0;
            return prev ? (cur - prev) / Math.abs(prev) : null;
          },
        },
      );
    }
    return cols;
  });

  /** Niveles disponibles (hasta la profundidad del plan de cuentas). */
  protected readonly levels = computed(() => {
    let depth = 1;
    const walk = (nodes: readonly CbTreeTableNode[], d: number) =>
      nodes.forEach((n) => {
        depth = Math.max(depth, d);
        if (n.children?.length) walk(n.children, d + 1);
      });
    walk(this.baseNodes(), 1);
    return Array.from({ length: depth }, (_, i) => i + 1);
  });

  protected readonly rowClass = (node: CbTreeTableNode): string | null =>
    node.key.startsWith('__total') ? 'cb-fr__total' : this.byCode().get(node.key)?.level === 1 ? 'cb-fr__class' : null;

  constructor() {
    // Cada cambio de nivel (o del árbol) abre las filas hasta ese nivel.
    afterRenderEffect(() => {
      const level = this.level();
      this.nodes();
      untracked(() => this.tree().expandToLevel(level));
    });
  }

  protected onActivate(node: CbTreeTableNode): void {
    const acc = this.byCode().get(node.key);
    if (acc) this.accountOpen.emit(acc);
  }

  /** Hoja de Excel del informe: todas las cuentas con sus niveles plegables, títulos y totales. */
  toExcelSheet(): CbXlsxSheet {
    const sheet = this.tree().toExcelSheet({ title: [this.title(), ...this.subtitle()].filter(Boolean), sheetName: this.title() || this.t().reportTitle });
    // Las filas de total van en negrita y sin nivel.
    const firstTotal = sheet.rows.length - this.totalNodes().length;
    const rows = (sheet.rows as CbXlsxRow[]).map((r, i) => (i >= firstTotal ? { ...r, bold: true, level: 0, indent: 0 } : r));
    const currency = this.currency() ?? this.config.currency;
    return { ...sheet, rows, totals: undefined, columns: sheet.columns.map((c) => (c.type === 'currency' ? { ...c, negative: this.negativeStyle() ?? c.negative, symbol: currency ? currencySymbol(currency, this.config.numberLocale ?? this.t().intlLocale) : c.symbol } : c)) };
  }

  /** Descarga el informe en Excel. */
  exportExcel(filename?: string): void {
    cbDownloadXlsx(filename ?? (this.title() || this.t().reportTitle), this.toExcelSheet());
  }

  /** Imprime el informe (todas las cuentas hasta el nivel abierto) en una ventana de impresión limpia. */
  print(): void {
    const doc = document;
    const frame = doc.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    doc.body.appendChild(frame);
    const w = frame.contentWindow;
    if (!w) return;
    const esc = (s: unknown) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
    const cols = this.columns();
    const locale = this.config.numberLocale ?? this.t().intlLocale;
    const currency = this.currency() ?? this.config.currency ?? null;
    const money = (v: unknown, c: CbTreeTableColumn) =>
      v == null || v === '' ? '' : c.type === 'percent' ? cbFormatAmount((v as number) * 100, locale, { decimals: 1, negative: this.negativeStyle() }) + ' %' : cbFormatAmount(v, locale, { currency, negative: this.negativeStyle() });
    const sheet = this.tree().toExcelSheet();
    const visibleLevel = this.level();
    const firstTotal = sheet.rows.length - this.totalNodes().length;
    const body = (sheet.rows as CbXlsxRow[])
      .map((r, i) => ({ r, isTotal: i >= firstTotal }))
      .filter(({ r }) => (r.level ?? 0) < visibleLevel)
      .map(({ r, isTotal }) => {
        return `<tr class="${r.bold || isTotal ? 'b' : ''}${isTotal ? ' t' : ''}"><td style="padding-left:${0.4 + (r.indent ?? 0) * 1.1}rem">${esc(r.cells[0])}</td>${cols
          .slice(1)
          .map((c, ci) => `<td class="n">${esc(money(r.cells[ci + 1], c))}</td>`)
          .join('')}</tr>`;
      })
      .join('');
    w.document.open();
    w.document.write(
      `<!doctype html><html lang="${esc(this.t().intlLocale)}"><head><meta charset="utf-8"><title>${esc(this.title() || this.t().reportTitle)}</title><style>` +
        'body{font:12px system-ui,sans-serif;color:#111;margin:24px}h1{font-size:16px;margin:0 0 2px}p{margin:0;color:#555}table{width:100%;border-collapse:collapse;margin-top:14px}' +
        'th,td{padding:4px 6px;border-bottom:1px solid #e5e7eb;text-align:left}th{font-size:11px;text-transform:uppercase;color:#555;border-bottom:1.5px solid #111}.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.b td{font-weight:600}.t td{border-top:1.5px solid #111}' +
        `</style></head><body>${this.title() ? `<h1>${esc(this.title())}</h1>` : ''}${this.subtitle()
          .map((s) => `<p>${esc(s)}</p>`)
          .join('')}<table><thead><tr>${cols.map((c, i) => `<th${i ? ' class="n"' : ''}>${esc(c.header)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
    setTimeout(() => frame.remove(), 1000);
  }
}
