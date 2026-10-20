import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCardSelect } from '@caribeng/ui/caribe/card-select';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-select-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCardSelect, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Select" lead="Card Select para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-card-select [items]="options" /></doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class CardSelectDocComponent {
  protected readonly docApi = DOC_API['cb-card-select'];

  constructor() { inject(TocService).reset(); }
  protected readonly options = ['Ahorros', 'Corriente', 'Nomina'];
  protected readonly importCode = `import { CbCardSelect } from '@caribeng/ui/caribe/card-select';`;
  protected readonly exampleCode = `<cb-card-select [items]="options" />`;
}
