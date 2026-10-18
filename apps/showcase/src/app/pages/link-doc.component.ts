import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbLink } from '@caribeng/ui/caribe/link';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-link-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbLink],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="Link"
      subtitle="Hipervínculo accesible con soporte para enlaces externos seguros."
      importCode="import { CbLink } from '@caribeng/ui/caribe/link';"
      [api]="api"
    >
      <cb-doc-example title="Enlace estándar" code='<cb-link label="Conoce nuestras tarifas" href="#tarifas" />'>
        <cb-link label="Conoce nuestras tarifas" href="#tarifas" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class LinkDocComponent {
  protected readonly docApi = DOC_API['cb-link'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'href', type: 'string', default: "'#'", description: 'URL de destino.' },
    { name: 'label', type: 'string', default: "''", description: 'Texto del enlace.' },
    { name: 'external', type: 'boolean', default: 'false', description: 'Abre en nueva pestaña con rel seguro.' },
  ];
}
