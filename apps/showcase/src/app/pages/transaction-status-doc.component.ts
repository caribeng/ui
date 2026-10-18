import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbTransactionStatus } from '@caribeng/ui/caribe/transaction-status';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-transaction-status-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbTransactionStatus, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Transaction Status" lead="Transaction Status para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-transaction-status status="success" label="Transaccion aprobada" /></doc-section>
  `,
})
export class TransactionStatusDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbTransactionStatus } from '@caribeng/ui/caribe/transaction-status';`;
  protected readonly exampleCode = `<cb-transaction-status status="success" label="Transaccion aprobada" />`;
}
