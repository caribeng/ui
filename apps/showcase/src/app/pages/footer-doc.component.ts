import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFooter } from '@caribeng/ui/caribe/footer';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-footer-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFooter],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="Footer"
      subtitle="Pie de página institucional con texto legal y ranura para enlaces."
      importCode="import { CbFooter } from '@caribeng/ui/caribe/footer';"
    >
      <cb-doc-example title="Pie institucional" code='<cb-footer />'>
        <cb-footer />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class FooterDocComponent {
  protected readonly docApi = DOC_API['cb-footer'];

}
