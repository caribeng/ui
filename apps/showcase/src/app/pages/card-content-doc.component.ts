import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCardContent } from '@caribeng/ui/caribe/card-content';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-content-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCardContent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Content" lead="Card Content para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-card-content title="Producto" subtitle="Cuenta de ahorros">Consulta el detalle de tu producto.</cb-card-content></doc-section>
  `,
})
export class CardContentDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbCardContent } from '@caribeng/ui/caribe/card-content';`;
  protected readonly exampleCode = `<cb-card-content title="Producto" subtitle="Cuenta de ahorros">Consulta el detalle de tu producto.</cb-card-content>`;
}
