import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbVoucher } from '@caribeng/ui/caribe/voucher';
import { CbTransactionStatus } from '@caribeng/ui/caribe/transaction-status';
import { CbExpansionPanel } from '@caribeng/ui/caribe/expansion-panel';
import { CbStatus } from '@caribeng/ui/caribe/status';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-voucher-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocPlaygroundComponent,
    CbVoucher,
    CbTransactionStatus,
    CbExpansionPanel,
    CbStatus,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Voucher" lead="Voucher para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>

    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-voucher title="Comprobante de pago" [rows]="details" /></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Comprobante enriquecido', 'Rich receipt')"
      [description]="
        i18n.t(
          'Composición de alto nivel: integra el voucher con transaction-status, un panel expandible (acordeón) para el detalle y un chip de estado, al estilo de la documentación de Caribe Design.',
          'High-level composition: combines the voucher with transaction-status, an expandable panel (accordion) for details and a status chip, in the style of the Caribe Design docs.'
        )
      "
      [code]="composedCode"
    >
      <div class="voucher-flow">
        <cb-transaction-status status="success" label="Transfer completed" />

        <cb-voucher title="Payment receipt" [rows]="advancedRows" actionLabel="Share receipt">
          Sent to savings account **** 4829.
        </cb-voucher>

        <cb-expansion-panel title="Transaction details">
          <div class="voucher-flow__detail">
            <cb-status status="success" text="Approved" />
            <dl class="voucher-flow__list">
              <div><dt>Authorization</dt><dd>0048-2291</dd></div>
              <div><dt>Channel</dt><dd>Mobile app</dd></div>
              <div><dt>Fee</dt><dd>$ 0</dd></div>
            </dl>
          </div>
        </cb-expansion-panel>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .voucher-flow {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-4, 1rem);
        width: 100%;
        max-width: 22rem;
      }
      .voucher-flow__detail {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-3, 0.75rem);
      }
      .voucher-flow__list {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-2, 0.5rem);
        font-size: var(--cb-text-sm, 0.875rem);
      }
      .voucher-flow__list > div {
        display: flex;
        justify-content: space-between;
        gap: var(--cb-space-3, 0.75rem);
      }
      .voucher-flow__list dt {
        color: var(--cb-color-text-muted, #64748b);
      }
      .voucher-flow__list dd {
        margin: 0;
        font-weight: var(--cb-font-weight-medium, 500);
      }
    `,
  ],
})
export class VoucherDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-voucher'];

  constructor() { inject(TocService).reset(); }
  protected readonly details = [{ label: 'Referencia', value: '004812' }, { label: 'Total', value: '$ 85.000' }];
  protected readonly advancedRows = [
    { label: 'Reference', value: '004812' },
    { label: 'Date', value: 'Oct 18, 2026' },
    { label: 'Amount', value: '$ 85,000' },
  ];
  protected readonly importCode = `import { CbVoucher } from '@caribeng/ui/caribe/voucher';`;
  protected readonly exampleCode = `<cb-voucher title="Comprobante de pago" [rows]="details" />`;
  protected readonly composedCode = `<cb-transaction-status status="success" label="Transfer completed" />

<cb-voucher title="Payment receipt" [rows]="advancedRows" actionLabel="Share receipt">
  Sent to savings account **** 4829.
</cb-voucher>

<cb-expansion-panel title="Transaction details">
  <cb-status status="success" text="Approved" />
  <dl>
    <div><dt>Authorization</dt><dd>0048-2291</dd></div>
    <div><dt>Channel</dt><dd>Mobile app</dd></div>
    <div><dt>Fee</dt><dd>$ 0</dd></div>
  </dl>
</cb-expansion-panel>`;
}
