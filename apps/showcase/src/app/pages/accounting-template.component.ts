import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbAging } from '@caribeng/ui/aging';
import { CbButton } from '@caribeng/ui/button';
import { CbDrawer } from '@caribeng/ui/drawer';
import { CbFinancialReport, type CbReportTotal } from '@caribeng/ui/financial-report';
import { CbIcon } from '@caribeng/ui/icon';
import { CbJournalEntry, type CbJournalEntryData } from '@caribeng/ui/journal-entry';
import { CbKpi } from '@caribeng/ui/kpi';
import { CbPeriodPicker, presetPeriod, type CbPeriod } from '@caribeng/ui/period-picker';
import { CbReconciliation, type CbReconMatch } from '@caribeng/ui/reconciliation';
import { CbTable, CbTableCellDirective, type CbTableColumn } from '@caribeng/ui/table';
import { CbTab, CbTabs } from '@caribeng/ui/tabs';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';
import { CARTERA, EXTRACTO, LIBROS, MESES_CERRADOS, PUC, SALDOS, TERCEROS, TIPOS_COMPROBANTE } from '../data/puc';

interface Voucher {
  id: number;
  numero: string;
  fecha: string;
  tipo: string;
  tercero: string;
  descripcion: string;
  valor: number;
  estado: string;
  entry: CbJournalEntryData;
}

const UTILIDAD = [{ code: '4' }, { code: '5', sign: -1 as const }, { code: '6', sign: -1 as const }];

/** Comprobante de ejemplo cuadrado con dos líneas. */
function voucher(id: number, numero: string, fecha: string, tipo: string, tercero: string, descripcion: string, debit: string, credit: string, valor: number): Voucher {
  const [y, m, d] = fecha.split('-').map(Number);
  return {
    id,
    numero,
    fecha,
    tipo,
    tercero: TERCEROS.find((t) => t.value === tercero)?.label ?? tercero,
    descripcion,
    valor,
    estado: 'Contabilizado',
    entry: {
      date: new Date(y, m - 1, d),
      type: tipo,
      number: numero,
      description: descripcion,
      lines: [
        { id: 1, account: debit, thirdParty: tercero, description: null, debit: valor, credit: null },
        { id: 2, account: credit, thirdParty: tercero, description: null, debit: null, credit: valor },
      ],
    },
  };
}

/**
 * Plantilla (receta copiable): tablero de un programa contable que combina los
 * componentes de Contabilidad: periodo, indicadores, estado de resultados,
 * cartera por edades, conciliación bancaria y últimos comprobantes.
 */
@Component({
  selector: 'doc-accounting-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbAging,
    CbButton,
    CbDrawer,
    CbFinancialReport,
    CbIcon,
    CbJournalEntry,
    CbKpi,
    CbPeriodPicker,
    CbReconciliation,
    CbTable,
    CbTableCellDirective,
    CbTab,
    CbTabs,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Tablero contable"
      lead="Tablero de un programa contable armado con los componentes de Contabilidad: periodo, indicadores, estado de resultados comparativo, cartera por edades, conciliación bancaria y últimos comprobantes."
    />

    <doc-section id="preview" title="Vista previa">
      <div class="acc">
        <header class="acc__head">
          <div>
            <p class="acc__company">CaribeNG S.A.S. · NIT 901.234.567-1</p>
            <h2 class="acc__title">Resumen contable</h2>
          </div>
          <div class="acc__actions">
            <cb-period-picker class="acc__period" [(value)]="periodo" [closed]="cerrados" [today]="hoy" label="Periodo" />
            <cb-button size="sm" (click)="nuevo()">
              <cb-icon name="plus" [size]="15" aria-hidden="true" />
              Nuevo comprobante
            </cb-button>
          </div>
        </header>

        <div class="acc__kpis">
          <cb-kpi label="Ingresos" [value]="208330000" [previous]="167440000" [series]="ingresos" compareLabel="Mismo periodo 2025" [target]="250000000" />
          <cb-kpi label="Gastos operacionales" [value]="47700000" [previous]="58110000" better="down" [series]="gastos" compareLabel="Mismo periodo 2025" />
          <cb-kpi label="Utilidad del ejercicio" [value]="62230000" [previous]="24730000" [series]="utilidad" compareLabel="Mismo periodo 2025" />
          <cb-kpi label="Cartera vencida" [value]="19350000" [previous]="15800000" better="down" [series]="vencida" compareLabel="Mes anterior" />
        </div>

        <cb-tabs class="acc__tabs">
          <cb-tab label="Resultados">
            <cb-financial-report
              title="Estado de resultados"
              [subtitle]="[periodoTexto() + ' frente a 2025']"
              [accounts]="puc"
              [balances]="saldos"
              [periods]="['2026', '2025']"
              comparative
              [classes]="['4', '5', '6']"
              [totals]="totales"
              [level]="1"
            />
          </cb-tab>
          <cb-tab label="Cartera">
            <cb-aging title="Cartera por edades" partyHeader="Cliente" [documents]="cartera" [asOf]="hoy" />
          </cb-tab>
          <cb-tab label="Bancos">
            <cb-reconciliation statementLabel="Extracto Banco de Bogotá" ledgerLabel="Libros · 111005" [statement]="extracto" [ledger]="libros" [(matches)]="conciliados" />
          </cb-tab>
          <cb-tab label="Comprobantes">
            <cb-table [value]="comprobantes()" [columns]="columnas" dataKey="id" size="sm" ariaLabel="Últimos comprobantes" [paginator]="true" [rows]="5">
              <ng-template cbTableCell="numero" let-row>
                <button type="button" class="acc__link" (click)="abrir(row)">{{ row.numero }}</button>
              </ng-template>
            </cb-table>
          </cb-tab>
        </cb-tabs>
      </div>

      <cb-drawer [(visible)]="drawer" [header]="editando()?.number ? 'Comprobante ' + editando()!.number : 'Nuevo comprobante'" size="min(64rem, 96vw)">
        @if (editando(); as entry) {
          <cb-journal-entry
            [entry]="entry"
            (entryChange)="editando.set($event)"
            [accounts]="puc"
            [thirdParties]="terceros"
            [types]="tipos"
            [readonly]="soloLectura()"
            scrollHeight="18rem"
            (save)="guardar($event)"
          />
        }
      </cb-drawer>
    </doc-section>
  `,
  styles: [
    `
      .acc {
        display: grid;
        gap: 1.25rem;
        width: 100%;
        min-width: 0;
      }
      .acc__head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: 0.75rem 1rem;
      }
      .acc__company {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.8125rem;
      }
      .acc__title {
        margin: 0.1rem 0 0;
        font-size: 1.25rem;
      }
      .acc__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .acc__period {
        width: 18rem;
      }
      .acc__kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
        gap: 0.85rem;
      }
      .acc__tabs {
        width: 100%;
      }
      .acc__link {
        padding: 0;
        border: 0;
        background: none;
        color: var(--cb-color-primary-700, var(--cb-color-primary-500));
        font: inherit;
        font-variant-numeric: tabular-nums;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }
    `,
  ],
})
export class AccountingTemplateComponent {
  protected readonly hoy = new Date(2026, 9, 31);
  protected readonly puc = PUC;
  protected readonly saldos = SALDOS;
  protected readonly cartera = CARTERA;
  protected readonly extracto = EXTRACTO;
  protected readonly libros = LIBROS;
  protected readonly terceros = TERCEROS;
  protected readonly tipos = TIPOS_COMPROBANTE;
  protected readonly cerrados = MESES_CERRADOS;
  protected readonly totales: CbReportTotal[] = [
    { label: 'Utilidad bruta', terms: [{ code: '4' }, { code: '6', sign: -1 }] },
    { label: 'Utilidad del ejercicio', terms: UTILIDAD },
  ];

  protected readonly ingresos = [142, 151, 149, 160, 171, 168, 180, 186, 195, 208];
  protected readonly gastos = [58, 57, 59, 55, 53, 52, 50, 49, 48, 47.7];
  protected readonly utilidad = [24, 28, 27, 33, 39, 38, 45, 50, 56, 62];
  protected readonly vencida = [12, 13.5, 13, 14.2, 15.1, 15.8, 16.4, 17.9, 15.8, 19.35];

  protected readonly periodo = signal<CbPeriod | null>(presetPeriod('yearToDate', this.hoy));
  protected readonly periodoTexto = computed(() => {
    const p = this.periodo();
    if (!p) return '2026';
    const f = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
    return `${f.format(p.from)} – ${f.format(p.to)} de ${p.to.getFullYear()}`.replace(/\./g, '');
  });
  protected readonly conciliados = signal<readonly CbReconMatch[]>([]);

  protected readonly columnas: CbTableColumn[] = [
    { field: 'numero', header: 'Número', width: '8rem', sortable: true },
    { field: 'fecha', header: 'Fecha', width: '7rem', sortable: true },
    { field: 'tercero', header: 'Tercero', sortable: true },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'valor', header: 'Valor', type: 'currency', decimals: 0, sortable: true },
  ];
  protected readonly comprobantes = signal<Voucher[]>([
    voucher(1, 'CE-000124', '2026-10-05', 'CE', '860063875', 'Pago factura de energía octubre', '513530', '111005', 971750),
    voucher(2, 'RC-000089', '2026-10-02', 'RC', '901234567', 'Recaudo factura FV-1203', '111005', '130505', 2450000),
    voucher(3, 'NC-000031', '2026-10-31', 'NC', '860002964', 'Comisión manejo de cuenta', '530505', '111005', 18900),
    voucher(4, 'CE-000125', '2026-10-12', 'CE', '52876543', 'Nómina primera quincena', '250505', '111005', 6400000),
    voucher(5, 'RC-000090', '2026-10-21', 'RC', '901234567', 'Recaudo Hotel Las Américas', '111005', '130505', 1500000),
    voucher(6, 'FV-001252', '2026-10-20', 'FV', '901234567', 'Venta Ferretería Bolívar', '130505', '413595', 5211750),
  ]);

  protected readonly drawer = signal(false);
  protected readonly editando = signal<CbJournalEntryData | null>(null);
  protected readonly soloLectura = signal(false);

  protected abrir(row: Voucher): void {
    this.editando.set(row.entry);
    this.soloLectura.set(true);
    this.drawer.set(true);
  }

  protected nuevo(): void {
    this.editando.set({
      date: new Date(),
      type: 'NC',
      number: `NC-0000${32 + this.comprobantes().length}`,
      description: null,
      lines: [
        { id: 1, account: null, thirdParty: null, description: null, debit: null, credit: null },
        { id: 2, account: null, thirdParty: null, description: null, debit: null, credit: null },
      ],
    });
    this.soloLectura.set(false);
    this.drawer.set(true);
  }

  /** El comprobante guardado se añade arriba de la lista. */
  protected guardar(entry: CbJournalEntryData): void {
    const valor = entry.lines.reduce((t, l) => t + (l.debit ?? 0), 0);
    const d = entry.date ?? new Date();
    const fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const tercero = entry.lines.find((l) => l.thirdParty)?.thirdParty;
    this.comprobantes.update((list) => [
      {
        id: Date.now(),
        numero: entry.number ?? '',
        fecha,
        tipo: String(entry.type ?? ''),
        tercero: TERCEROS.find((t) => t.value === tercero)?.label ?? '—',
        descripcion: entry.description ?? '',
        valor,
        estado: 'Contabilizado',
        entry,
      },
      ...list,
    ]);
    this.drawer.set(false);
  }

  constructor() {
    inject(TocService).reset();
  }
}
