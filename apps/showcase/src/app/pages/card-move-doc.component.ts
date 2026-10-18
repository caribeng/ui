import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCardMove } from '@caribeng/ui/caribe/card-move';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-move-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCardMove, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Move" lead="Card Move para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-card-move [items]="moveItems" /></doc-section>
  `,
})
export class CardMoveDocComponent {
  protected readonly docApi = DOC_API['cb-card-move'];

  constructor() { inject(TocService).reset(); }
  protected readonly moveItems = ['Cuenta principal', 'Ahorros', 'Tarjeta'];
  protected readonly importCode = `import { CbCardMove } from '@caribeng/ui/caribe/card-move';`;
  protected readonly exampleCode = `<cb-card-move [items]="moveItems" />`;
}
