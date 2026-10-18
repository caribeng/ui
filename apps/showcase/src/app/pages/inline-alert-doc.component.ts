import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbInlineAlert } from '@caribeng/ui/caribe/inline-alert';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-inline-alert-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbInlineAlert, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Inline Alert" lead="Inline Alert para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-inline-alert title="Informacion" status="info">Puedes continuar con el proceso.</cb-inline-alert></doc-section>
  `,
})
export class InlineAlertDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbInlineAlert } from '@caribeng/ui/caribe/inline-alert';`;
  protected readonly exampleCode = `<cb-inline-alert title="Informacion" status="info">Puedes continuar con el proceso.</cb-inline-alert>`;
}
