import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbOnboardingComponent } from '@caribeng/ui/onboarding';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-onboarding-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbOnboardingComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Onboarding" lead="Onboarding para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-onboarding [steps]="steps" /></doc-section>
  `,
})
export class OnboardingDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Te damos la bienvenida', 'Configura tus preferencias'];
  protected readonly importCode = `import { CbOnboardingComponent } from '@caribeng/ui/onboarding';`;
  protected readonly exampleCode = `<cb-onboarding [steps]="steps" />`;
}
