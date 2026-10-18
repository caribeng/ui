import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbStepIndicator } from '@caribeng/ui/caribe/step-indicator';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-step-indicator-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbStepIndicator],
  template: `
    <cb-doc-page
      category="Caribe Design · Indicadores"
      title="StepIndicator"
      subtitle="Indicador compacto del progreso por pasos en flujos asistidos."
      importCode="import { CbStepIndicator } from '@caribeng/ui/caribe/step-indicator';"
      [api]="api"
    >
      <cb-doc-example title="Paso actual" code='<cb-step-indicator [currentStep]="2" [totalSteps]="4" label="Confirmación" />'>
        <cb-step-indicator [currentStep]="2" [totalSteps]="4" label="Confirmación" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class StepIndicatorDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'currentStep', type: 'number', default: '1', description: 'Número del paso actual.' },
    { name: 'totalSteps', type: 'number', default: '4', description: 'Total de pasos del flujo.' },
    { name: 'label', type: 'string', default: "'Datos de destino'", description: 'Título descriptivo del paso.' },
  ];
}
