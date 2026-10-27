import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCardMove } from '@caribeng/ui/card-move';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-move-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCardMove, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Paneles" title="Card Move" lead="Card Move para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" description="Lista de movimientos a partir del arreglo items." [code]="exampleCode"><cb-card-move [items]="moveItems" /></doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class CardMoveDocComponent {
  protected readonly docApi = DOC_API['cb-card-move'];

  constructor() { inject(TocService).reset(); }
  protected readonly moveItems = ['Cuenta principal', 'Ahorros', 'Tarjeta'];
  protected readonly importCode = `import { CbCardMove } from '@caribeng/ui/card-move';`;
  protected readonly exampleCode = `<cb-card-move [items]="moveItems" />`;
}
