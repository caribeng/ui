import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbVoucherComponent } from '@caribeng/ui/voucher';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-voucher-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbVoucherComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Voucher" lead="Voucher para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-voucher title="Comprobante de pago" [rows]="details" /></doc-section>
  `,
})
export class VoucherDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly details = [{ label: 'Referencia', value: '004812' }, { label: 'Total', value: '$ 85.000' }];
  protected readonly importCode = `import { CbVoucherComponent } from '@caribeng/ui/voucher';`;
  protected readonly exampleCode = `<cb-voucher title="Comprobante de pago" [rows]="details" />`;
}
