import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbProgressBar } from '@caribeng/ui/caribe/progress-bar';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-progress-bar-caribe-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbProgressBar],
  template: `
    <cb-doc-page
      category="Caribe Design · Indicadores"
      title="ProgressBar (Caribe)"
      subtitle="Barra de progreso lineal con etiqueta y porcentaje integrado."
      importCode="import { CbProgressBar } from '@caribeng/ui/caribe/progress-bar';"
    >
      <cb-doc-example title="Meta de ahorro" code='<cb-progress-bar label="Meta de ahorro" [value]="72" />'>
        <div style="width: 100%; max-width: 360px">
          <cb-progress-bar label="Meta de ahorro" [value]="72" />
        </div>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class ProgressBarCaribeDocComponent {
  protected readonly docApi = DOC_API['cb-progress-bar'];

}
