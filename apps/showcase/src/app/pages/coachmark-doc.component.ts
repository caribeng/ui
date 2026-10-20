import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';
import { CbCardPrimary } from '@caribeng/ui/caribe/card-primary';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-coachmark-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCoachmark, CbCardPrimary, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Coachmark" lead="Coachmark para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-coachmark [steps]="steps" /></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Ayuda sobre un elemento', 'Help over an element')"
      [description]="
        i18n.t(
          'Composición de alto nivel: el coachmark acompaña a un elemento destacado (una tarjeta de cuenta) para guiar al usuario.',
          'High-level composition: the coachmark accompanies a highlighted element (an account card) to guide the user.'
        )
      "
      [code]="composedCode"
    >
      <div class="coach-demo">
        <cb-card-primary title="Savings account" subtitle="**** 4829" value="$ 4,250,000" />
        <cb-coachmark [steps]="coachSteps" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .coach-demo {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: var(--cb-space-4, 1rem);
      }
    `,
  ],
})
export class CoachmarkDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-coachmark'];

  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Consulta tus productos aqui', 'Revisa tus movimientos'];
  protected readonly coachSteps = ['This is your balance', 'Tap to make a transfer', 'Review your movements'];
  protected readonly importCode = `import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';`;
  protected readonly exampleCode = `<cb-coachmark [steps]="steps" />`;
  protected readonly composedCode = `<cb-card-primary title="Savings account" subtitle="**** 4829" value="$ 4,250,000" />
<cb-coachmark [steps]="['This is your balance', 'Tap to make a transfer', 'Review your movements']" />`;
}
