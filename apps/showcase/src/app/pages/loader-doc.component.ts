import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbLoader } from '@caribeng/ui/caribe/loader';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-loader-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbLoader],
  template: `
    <cb-doc-page
      category="Caribe Design · Loaders"
      title="Loader"
      subtitle="Indicador compacto de espera con anuncio accesible en vivo."
      importCode="import { CbLoader } from '@caribeng/ui/caribe/loader';"
    >
      <cb-doc-example title="Loader con mensaje" code='<cb-loader text="Consultando saldo…" />'>
        <cb-loader text="Consultando saldo…" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class LoaderDocComponent {
  protected readonly docApi = DOC_API['cb-loader'];

}
