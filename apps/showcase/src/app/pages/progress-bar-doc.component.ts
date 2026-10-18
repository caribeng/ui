import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbProgressBar } from '@caribeng/ui/caribe/progress-bar';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-progress-bar-caribe-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbProgressBar],
  template: `
    <cb-doc-page
      category="Caribe Design · Indicadores"
      title="ProgressBar (Caribe)"
      subtitle="Barra de progreso lineal con etiqueta y porcentaje integrado."
      importCode="import { CbProgressBar } from '@caribeng/ui/caribe/progress-bar';"
      [api]="api"
    >
      <cb-doc-example title="Meta de ahorro" code='<cb-progress-bar label="Meta de ahorro" [value]="72" />'>
        <div style="width: 100%; max-width: 360px">
          <cb-progress-bar label="Meta de ahorro" [value]="72" />
        </div>
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class ProgressBarCaribeDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'value', type: 'number', default: '60', description: 'Porcentaje completado (0–100).' },
    { name: 'label', type: 'string', default: "''", description: 'Etiqueta descriptiva.' },
    { name: 'showValue', type: 'boolean', default: 'true', description: 'Muestra el porcentaje numérico.' },
  ];
}
