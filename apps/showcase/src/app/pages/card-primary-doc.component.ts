import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCardPrimary } from '@caribeng/ui/caribe/card-primary';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-primary-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCardPrimary, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Primary" lead="Card Primary para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-card-primary title="Cuenta de ahorros" subtitle="**** 2048" value="$ 2.450.000" /></doc-section>
  `,
})
export class CardPrimaryDocComponent {
  protected readonly docApi = DOC_API['cb-card-primary'];

  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbCardPrimary } from '@caribeng/ui/caribe/card-primary';`;
  protected readonly exampleCode = `<cb-card-primary title="Cuenta de ahorros" subtitle="**** 2048" value="$ 2.450.000" />`;
}
