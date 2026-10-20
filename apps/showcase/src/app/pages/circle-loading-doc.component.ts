import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCircleLoading } from '@caribeng/ui/caribe/circle-loading';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-circle-loading-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbCircleLoading],
  template: `
    <cb-doc-page
      category="Caribe Design · Loaders"
      title="CircleLoading"
      subtitle="Indicador circular de carga determinada o indeterminada."
      importCode="import { CbCircleLoading } from '@caribeng/ui/caribe/circle-loading';"
    >
      <cb-doc-example title="Progreso circular" description="progress indica el porcentaje completado y label el texto accesible." code='<cb-circle-loading [progress]="75" label="Procesando 75%" />'>
        <cb-circle-loading [progress]="75" label="Procesando 75%" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class CircleLoadingDocComponent {
  protected readonly docApi = DOC_API['cb-circle-loading'];

}
