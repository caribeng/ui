import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbIllustrationComponent } from '@caribeng/ui/illustration';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-illustration-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbIllustrationComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="Illustration"
      subtitle="Ilustraciones vectoriales expresivas para estados vacíos, confirmaciones y onboarding."
      importCode="import { CbIllustrationComponent } from '@caribeng/ui/illustration';"
      [api]="api"
    >
      <cb-doc-example title="Ilustración escalable" code='<cb-illustration name="transfer-success" size="180px" />'>
        <cb-illustration name="transfer-success" size="180px" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class IllustrationDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'name', type: 'string', default: "'transfer-success'", description: 'Nombre de la ilustración del catálogo.' },
    { name: 'size', type: 'string', default: "'160px'", description: 'Ancho CSS de la ilustración.' },
    { name: 'alt', type: 'string', default: "'Ilustración Caribe'", description: 'Etiqueta accesible.' },
  ];
}
