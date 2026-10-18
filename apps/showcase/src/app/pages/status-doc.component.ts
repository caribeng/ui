import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbStatusComponent } from '@caribeng/ui/status';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-status-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbStatusComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Status" lead="Status para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-status status="success" text="Activo" /></doc-section>
  `,
})
export class StatusDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbStatusComponent } from '@caribeng/ui/status';`;
  protected readonly exampleCode = `<cb-status status="success" text="Activo" />`;
}
