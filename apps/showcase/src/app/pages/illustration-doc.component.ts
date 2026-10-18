import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbIllustration } from '@caribeng/ui/caribe/illustration';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-illustration-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbIllustration],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="Illustration"
      subtitle="Ilustraciones vectoriales expresivas para estados vacíos, confirmaciones y onboarding."
      importCode="import { CbIllustration } from '@caribeng/ui/caribe/illustration';"
      [api]="api"
    >
      <cb-doc-example title="Ilustración escalable" code='<cb-illustration name="transfer-success" size="180px" />'>
        <cb-illustration name="transfer-success" size="180px" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class IllustrationDocComponent {
  protected readonly docApi = DOC_API['cb-illustration'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'name', type: 'string', default: "'transfer-success'", description: 'Nombre de la ilustración del catálogo.' },
    { name: 'size', type: 'string', default: "'160px'", description: 'Ancho CSS de la ilustración.' },
    { name: 'alt', type: 'string', default: "'Ilustración Caribe'", description: 'Etiqueta accesible.' },
  ];
}
