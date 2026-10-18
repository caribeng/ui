import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFileSelect } from '@caribeng/ui/caribe/file-select';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-file-select-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFileSelect],
  template: `
    <cb-doc-page
      category="Caribe Design · Archivos"
      title="FileSelect"
      subtitle="Selector de archivos con filtro de extensiones y modelo reactivo."
      importCode="import { CbFileSelect } from '@caribeng/ui/caribe/file-select';"
      [api]="api"
    >
      <cb-doc-example title="Selección de soporte PDF" code='<cb-file-select label="Adjuntar RUT" accept=".pdf" />'>
        <cb-file-select label="Adjuntar RUT" accept=".pdf" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class FileSelectDocComponent {
  protected readonly docApi = DOC_API['cb-file-select'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'label', type: 'string', default: "'Seleccionar documento'", description: 'Etiqueta principal del selector.' },
    { name: 'accept', type: 'string', default: "'.pdf,.png,.jpg'", description: 'Tipos MIME o extensiones permitidas.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Permite seleccionar varios archivos.' },
  ];
}
