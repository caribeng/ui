import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbPictogramComponent } from '@caribeng/ui/pictogram';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-pictogram-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbPictogramComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="Pictogram"
      subtitle="Pictogramas gráficos de síntesis visual para categorías financieras y servicios."
      importCode="import { CbPictogramComponent } from '@caribeng/ui/pictogram';"
      [api]="api"
    >
      <cb-doc-example title="Pictograma" code='<cb-pictogram name="security-shield" size="64px" />'>
        <cb-pictogram name="security-shield" size="64px" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class PictogramDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'name', type: 'string', default: "'security-shield'", description: 'Identificador del pictograma.' },
    { name: 'size', type: 'string', default: "'56px'", description: 'Tamaño del pictograma.' },
    { name: 'alt', type: 'string', default: "'Pictograma'", description: 'Descripción accesible.' },
  ];
}
