import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbIllustration } from '@caribeng/ui/caribe/illustration';
import { CbDocPageComponent } from '../components/doc-page.component';
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
    >
      <cb-doc-example title="Ilustración escalable" description="name selecciona la ilustración y size su tamaño." code='<cb-illustration name="transfer-success" size="180px" />'>
        <cb-illustration name="transfer-success" size="180px" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class IllustrationDocComponent {
  protected readonly docApi = DOC_API['cb-illustration'];

}
