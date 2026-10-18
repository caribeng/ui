import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCardMoveComponent } from '@caribeng/ui/card-move';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-move-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCardMoveComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Move" lead="Card Move para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-card-move [items]="moveItems" /></doc-section>
  `,
})
export class CardMoveDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly moveItems = ['Cuenta principal', 'Ahorros', 'Tarjeta'];
  protected readonly importCode = `import { CbCardMoveComponent } from '@caribeng/ui/card-move';`;
  protected readonly exampleCode = `<cb-card-move [items]="moveItems" />`;
}
