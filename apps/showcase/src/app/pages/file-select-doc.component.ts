import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFileSelect } from '@caribeng/ui/caribe/file-select';
import { CbDocPageComponent } from '../components/doc-page.component';
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

}
