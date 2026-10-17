import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbFileUploadComponent } from '@caribeng/ui/fileupload';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-fileupload-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbFileUploadComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="FileUpload" lead="Selector de archivos con soporte de arrastrar y soltar y lista de adjuntos." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-file-upload [multiple]="true" style="width: 100%" />
    </doc-section>
  `,
})
export class FileuploadDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbFileUploadComponent } from '@caribeng/ui/fileupload';`;
  protected readonly basicCode = `<cb-file-upload [multiple]="true" />`;
}
