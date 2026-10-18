import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbPopOver } from '@caribeng/ui/caribe/pop-over';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-pop-over-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPopOver, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Pop Over" lead="Pop Over para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-pop-over triggerLabel="Ver informacion">Informacion adicional sobre la opci?n.</cb-pop-over></doc-section>
  `,
})
export class PopOverDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbPopOver } from '@caribeng/ui/caribe/pop-over';`;
  protected readonly exampleCode = `<cb-pop-over triggerLabel="Ver informacion">Informacion adicional sobre la opci?n.</cb-pop-over>`;
}
