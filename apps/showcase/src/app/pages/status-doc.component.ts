import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbStatus } from '@caribeng/ui/status';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-status-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbStatus, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Varios" title="Status" lead="Status para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" description="Indicador de estado; status define el color y text la etiqueta." [code]="exampleCode"><cb-status status="success" text="Activo" /></doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class StatusDocComponent {
  protected readonly docApi = DOC_API['cb-status'];

  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbStatus } from '@caribeng/ui/status';`;
  protected readonly exampleCode = `<cb-status status="success" text="Activo" />`;
}
