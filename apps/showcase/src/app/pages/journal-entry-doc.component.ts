import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbJournalEntry, cbEmptyJournalEntry, type CbJournalEntryData } from '@caribeng/ui/journal-entry';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { CENTROS_COSTO, PUC, TERCEROS, TIPOS_COMPROBANTE } from '../data/puc';

@Component({
  selector: 'doc-journal-entry-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbJournalEntry, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Journal Entry"
      lead="Editor de comprobante contable: cabecera y líneas con cuenta, tercero, centro de costo, detalle, débito y crédito, editables como una hoja de cálculo, con los totales y la diferencia en vivo y la validación antes de guardar."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="voucher"
      title="Comprobante de egreso"
      description="Escribe en la celda de la cuenta un código o un nombre (energía, bancos) y elige con Enter; tercero y centro de costo se buscan igual. Escribir el débito borra el crédito de la línea y al revés. Cuadrar pone la diferencia en la última línea sin valor; Guardar (o Ctrl + Enter) valida la fecha, que haya dos líneas con valor, las cuentas, el tercero de las cuentas que lo exigen (13 y 22 aquí) y que cuadre. Las líneas vacías se quitan y las que no tienen detalle toman la descripción."
      [code]="voucherCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <cb-journal-entry
          [(entry)]="comprobante"
          [accounts]="puc"
          [thirdParties]="terceros"
          [costCenters]="centros"
          [types]="tipos"
          [thirdPartyRequired]="['13', '22']"
          (save)="guardado.set($event)"
        />
        @if (guardado()) {
          <pre class="je-saved">{{ guardadoJson() }}</pre>
        }
      </div>
    </doc-section>

    <doc-section
      id="new"
      title="Comprobante nuevo"
      description="cbEmptyJournalEntry() crea un comprobante con la fecha de hoy y dos líneas vacías. Sin terceros, centros de costo ni tipos, esas columnas y campos no se muestran."
      [code]="newCode"
    >
      <cb-journal-entry [(entry)]="nuevo" [accounts]="puc" scrollHeight="16rem" />
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura"
      description="Con readonly se consulta un comprobante ya contabilizado: se navega, se selecciona y se copia, pero no se edita ni se guarda."
      [code]="readonlyCode"
    >
      <cb-journal-entry [entry]="contabilizado" [accounts]="puc" [thirdParties]="terceros" [types]="tipos" readonly scrollHeight="14rem" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .je-saved {
        max-height: 16rem;
        margin: 0;
        padding: 0.75rem 1rem;
        overflow: auto;
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-surface-subtle);
        font-size: 0.8rem;
      }
    `,
  ],
})
export class JournalEntryDocComponent {
  protected readonly docApi = DOC_API['cb-journal-entry'];
  protected readonly a11y = DOC_A11Y['cb-journal-entry'];

  protected readonly puc = PUC;
  protected readonly terceros = TERCEROS;
  protected readonly centros = CENTROS_COSTO;
  protected readonly tipos = TIPOS_COMPROBANTE;

  protected readonly comprobante = signal<CbJournalEntryData>({
    date: new Date(),
    type: 'CE',
    number: 'CE-000124',
    description: 'Pago factura de energía octubre',
    lines: [
      { id: 1, account: '513530', thirdParty: '860063875', costCenter: '100', description: null, debit: 845000, credit: null },
      { id: 2, account: '240810', thirdParty: '860063875', costCenter: null, description: 'IVA 19 %', debit: 160550, credit: null },
      { id: 3, account: '236525', thirdParty: '800197268', costCenter: null, description: 'Retención 4 %', debit: null, credit: 33800 },
      { id: 4, account: '111005', thirdParty: '860002964', costCenter: null, description: 'Transferencia', debit: null, credit: 900000 },
      { id: 5, account: null, thirdParty: null, costCenter: null, description: null, debit: null, credit: null },
    ],
  });
  protected readonly guardado = signal<CbJournalEntryData | null>(null);
  protected readonly guardadoJson = computed(() => JSON.stringify(this.guardado(), null, 2));

  protected readonly nuevo = signal<CbJournalEntryData>(cbEmptyJournalEntry());

  protected readonly contabilizado: CbJournalEntryData = {
    date: new Date(2026, 9, 1),
    type: 'RC',
    number: 'RC-000087',
    description: 'Recaudo de cartera',
    lines: [
      { id: 1, account: '111005', thirdParty: '860002964', description: 'Consignación', debit: 2450000, credit: null },
      { id: 2, account: '130505', thirdParty: '901234567', description: 'Abono factura FV-1203', debit: null, credit: 2450000 },
    ],
  };

  protected readonly importCode = `import { CbJournalEntry, cbEmptyJournalEntry, type CbJournalEntryData } from '@caribeng/ui/journal-entry';`;
  protected readonly voucherCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <cb-journal-entry
    [(entry)]="comprobante"
    [accounts]="puc"
    [thirdParties]="terceros"
    [costCenters]="centros"
    [types]="tipos"
    [thirdPartyRequired]="['13', '22']"
    (save)="guardado.set($event)"
  />
  @if (guardado()) {
    <pre class="je-saved">{{ guardadoJson() }}</pre>
  }
</div>`;
  protected readonly newCode = `<cb-journal-entry [(entry)]="nuevo" [accounts]="puc" scrollHeight="16rem" />`;
  protected readonly readonlyCode = `<cb-journal-entry [entry]="contabilizado" [accounts]="puc" [thirdParties]="terceros" [types]="tipos" readonly scrollHeight="14rem" />`;

  constructor() {
    inject(TocService).reset();
  }
}
