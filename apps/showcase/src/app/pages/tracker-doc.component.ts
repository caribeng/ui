import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTracker } from '@caribeng/ui/tracker';
import { CbTransactionStatus } from '@caribeng/ui/transaction-status';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-tracker-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbTracker, CbTransactionStatus, CbButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Datos" title="Tracker" lead="Tracker para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" description="steps define las etapas y currentIndex la etapa actual." [code]="exampleCode"><cb-tracker [steps]="steps" [currentIndex]="1" /></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Seguimiento de solicitud', 'Request tracking')"
      [description]="
        i18n.t(
          'Composición de alto nivel: el tracker junto a un transaction-status que refleja el avance, controlable con un botón.',
          'High-level composition: the tracker alongside a transaction-status reflecting progress, driven by a button.'
        )
      "
      [code]="composedCode"
    >
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 26rem">
        <cb-tracker [steps]="flow" [currentIndex]="step()" />
        <cb-transaction-status [status]="step() === 2 ? 'success' : 'info'" [label]="flow[step()]" />
        <cb-button size="sm" (click)="advance()">{{ step() === 2 ? 'Reset' : 'Advance' }}</cb-button>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class TrackerDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-tracker'];

  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Solicitud', 'Validación', 'Finalizado'];
  protected readonly flow = ['Requested', 'Processing', 'Completed'];
  protected readonly step = signal(0);
  protected advance(): void { this.step.update((v) => (v >= 2 ? 0 : v + 1)); }
  protected readonly importCode = `import { CbTracker } from '@caribeng/ui/tracker';`;
  protected readonly exampleCode = `<cb-tracker [steps]="steps" [currentIndex]="1" />`;
  protected readonly composedCode = `<cb-tracker [steps]="['Requested', 'Processing', 'Completed']" [currentIndex]="step()" />
<cb-transaction-status [status]="step() === 2 ? 'success' : 'info'" [label]="flow[step()]" />
<cb-button (click)="advance()">Advance</cb-button>`;
}
