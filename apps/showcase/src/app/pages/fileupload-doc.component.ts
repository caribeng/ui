import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFileUpload } from '@caribeng/ui/fileupload';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-fileupload-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbFileUpload, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="FileUpload" lead="Selector de archivos con soporte de arrastrar y soltar y lista de adjuntos." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Con multiple se pueden adjuntar varios archivos a la vez." [code]="basicCode">
      <cb-file-upload [multiple]="true" style="width: 100%" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class FileuploadDocComponent {
  protected readonly docApi = DOC_API['cb-file-upload'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbFileUpload } from '@caribeng/ui/fileupload';`;
  protected readonly basicCode = `<cb-file-upload [multiple]="true" />`;
}
