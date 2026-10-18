import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPictogram } from '@caribeng/ui/caribe/pictogram';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-pictogram-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbPictogram],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="Pictogram"
      subtitle="Pictogramas gráficos de síntesis visual para categorías financieras y servicios."
      importCode="import { CbPictogram } from '@caribeng/ui/caribe/pictogram';"
      [api]="api"
    >
      <cb-doc-example title="Pictograma" code='<cb-pictogram name="security-shield" size="64px" />'>
        <cb-pictogram name="security-shield" size="64px" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class PictogramDocComponent {
  protected readonly docApi = DOC_API['cb-pictogram'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'name', type: 'string', default: "'security-shield'", description: 'Identificador del pictograma.' },
    { name: 'size', type: 'string', default: "'56px'", description: 'Tamaño del pictograma.' },
    { name: 'alt', type: 'string', default: "'Pictograma'", description: 'Descripción accesible.' },
  ];
}
