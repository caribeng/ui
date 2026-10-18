import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbAlert } from '@caribeng/ui/caribe/alert';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-alert-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAlert, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Alert" lead="Alert para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-alert title="Operacion exitosa" severity="success">El cambio se guardo correctamente.</cb-alert></doc-section>
  `,
})
export class AlertDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbAlert } from '@caribeng/ui/caribe/alert';`;
  protected readonly exampleCode = `<cb-alert title="Operacion exitosa" severity="success">El cambio se guardo correctamente.</cb-alert>`;
}
