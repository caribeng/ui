import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCircleLoading } from '@caribeng/ui/caribe/circle-loading';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
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
      [api]="api"
    >
      <cb-doc-example title="Progreso circular" code='<cb-circle-loading [progress]="75" label="Procesando 75%" />'>
        <cb-circle-loading [progress]="75" label="Procesando 75%" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class CircleLoadingDocComponent {
  protected readonly docApi = DOC_API['cb-circle-loading'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'progress', type: 'number', default: '65', description: 'Porcentaje entre 0 y 100.' },
    { name: 'size', type: 'number', default: '48', description: 'Diámetro en píxeles.' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Modo indeterminado continuo.' },
    { name: 'label', type: 'string', default: "'Cargando'", description: 'Texto descriptivo y aria-label.' },
  ];
}
