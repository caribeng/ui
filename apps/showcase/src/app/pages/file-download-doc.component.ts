import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbFileDownload } from '@caribeng/ui/caribe/file-download';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-file-download-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbFileDownload],
  template: `
    <cb-doc-page
      category="Caribe Design · Archivos"
      title="FileDownload"
      subtitle="Tarjeta de descarga de documentos, extractos y comprobantes."
      importCode="import { CbFileDownload } from '@caribeng/ui/caribe/file-download';"
      [api]="api"
    >
      <cb-doc-example title="Descarga de certificado" code='<cb-file-download fileName="Extracto_Octubre.pdf" fileSize="1.2 MB" />'>
        <cb-file-download fileName="Extracto_Octubre.pdf" fileSize="1.2 MB" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class FileDownloadDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'fileName', type: 'string', default: "'Certificado_Bancario.pdf'", description: 'Nombre visible del archivo.' },
    { name: 'fileSize', type: 'string', default: "'420 KB'", description: 'Tamaño formateado del archivo.' },
    { name: 'download', type: 'OutputEmitterRef<string>', default: '—', description: 'Evento emitido al solicitar la descarga.' },
  ];
}
