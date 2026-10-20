import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFileDownload } from '@caribeng/ui/caribe/file-download';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-file-download-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFileDownload],
  template: `
    <cb-doc-page
      category="Caribe Design · Archivos"
      title="FileDownload"
      subtitle="Tarjeta de descarga de documentos, extractos y comprobantes."
      importCode="import { CbFileDownload } from '@caribeng/ui/caribe/file-download';"
    >
      <cb-doc-example title="Descarga de certificado" code='<cb-file-download fileName="Extracto_Octubre.pdf" fileSize="1.2 MB" />'>
        <cb-file-download fileName="Extracto_Octubre.pdf" fileSize="1.2 MB" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class FileDownloadDocComponent {
  protected readonly docApi = DOC_API['cb-file-download'];

}
