import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbVoucher } from '@caribeng/ui/caribe/voucher';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-voucher-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbVoucher, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Voucher" lead="Voucher para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-voucher title="Comprobante de pago" [rows]="details" /></doc-section>
  `,
})
export class VoucherDocComponent {
  protected readonly docApi = DOC_API['cb-voucher'];

  constructor() { inject(TocService).reset(); }
  protected readonly details = [{ label: 'Referencia', value: '004812' }, { label: 'Total', value: '$ 85.000' }];
  protected readonly importCode = `import { CbVoucher } from '@caribeng/ui/caribe/voucher';`;
  protected readonly exampleCode = `<cb-voucher title="Comprobante de pago" [rows]="details" />`;
}
