import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbStepIndicator } from '@caribeng/ui/step-indicator';
import { CbCardContent } from '@caribeng/ui/card-content';
import { CbButton } from '@caribeng/ui/button';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-step-indicator-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbStepIndicator, CbCardContent, CbButton],
  template: `
    <cb-doc-page
      category="Varios"
      title="StepIndicator"
      subtitle="Indicador compacto del progreso por pasos en flujos asistidos."
      importCode="import { CbStepIndicator } from '@caribeng/ui/step-indicator';"
    >
      <cb-doc-example title="Paso actual" description="currentStep y totalSteps indican el progreso; label describe el paso actual." code='<cb-step-indicator [currentStep]="2" [totalSteps]="4" label="Confirmación" />'>
        <cb-step-indicator [currentStep]="2" [totalSteps]="4" label="Confirmación" />
      </cb-doc-example>

      <cb-doc-example title="Flujo de transferencia" description="El indicador avanza junto con el contenido de cada paso del flujo." [code]="composedCode">
        <div style="width: 100%; max-width: 24rem; display: flex; flex-direction: column; gap: 1rem">
          <cb-step-indicator [currentStep]="current()" [totalSteps]="3" [label]="stepLabel()" />
          <cb-card-content [title]="stepLabel()" subtitle="New transfer" actionLabel="Help">
            Complete the "{{ stepLabel() }}" step to continue with your transfer.
          </cb-card-content>
          <div style="display: flex; gap: 0.5rem; justify-content: space-between">
            <cb-button variant="outlined" severity="secondary" [disabled]="current() === 1" (click)="prev()">Back</cb-button>
            <cb-button (click)="next()">{{ current() === 3 ? 'Finish' : 'Next' }}</cb-button>
          </div>
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class StepIndicatorDocComponent {
  protected readonly docApi = DOC_API['cb-step-indicator'];

  private readonly labels = ['Recipient', 'Amount', 'Confirm'];
  protected readonly current = signal(1);
  protected readonly stepLabel = computed(() => this.labels[this.current() - 1]);
  protected prev(): void { this.current.update((v) => Math.max(1, v - 1)); }
  protected next(): void { this.current.update((v) => Math.min(3, v + 1)); }

  protected readonly composedCode = `<cb-step-indicator [currentStep]="current()" [totalSteps]="3" [label]="stepLabel()" />
<cb-card-content [title]="stepLabel()" subtitle="New transfer">…</cb-card-content>
<cb-button variant="outlined" [disabled]="current() === 1" (click)="prev()">Back</cb-button>
<cb-button (click)="next()">{{ current() === 3 ? 'Finish' : 'Next' }}</cb-button>`;

}
