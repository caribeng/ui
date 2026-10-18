import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbOnboarding } from '@caribeng/ui/caribe/onboarding';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-onboarding-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbOnboarding, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Onboarding" lead="Onboarding para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-onboarding [steps]="steps" /></doc-section>
  `,
})
export class OnboardingDocComponent {
  protected readonly docApi = DOC_API['cb-onboarding'];

  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Te damos la bienvenida', 'Configura tus preferencias'];
  protected readonly importCode = `import { CbOnboarding } from '@caribeng/ui/caribe/onboarding';`;
  protected readonly exampleCode = `<cb-onboarding [steps]="steps" />`;
}
