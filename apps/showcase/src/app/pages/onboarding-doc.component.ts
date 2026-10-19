import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbOnboarding } from '@caribeng/ui/caribe/onboarding';
import { CbIllustration } from '@caribeng/ui/caribe/illustration';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-onboarding-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbOnboarding, CbIllustration, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Onboarding" lead="Onboarding para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-onboarding [steps]="steps" /></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Bienvenida con ilustración', 'Welcome with illustration')"
      [description]="
        i18n.t(
          'Composición de alto nivel: el flujo de onboarding con una ilustración de Caribe proyectada en el cuerpo.',
          'High-level composition: the onboarding flow with a projected Caribe illustration in the body.'
        )
      "
      [code]="composedCode"
    >
      <cb-onboarding [steps]="flowSteps">
        <cb-illustration name="transfer-success" size="120px" />
        <p>Manage your money securely from anywhere, anytime.</p>
      </cb-onboarding>
    </doc-section>
  `,
})
export class OnboardingDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-onboarding'];

  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Te damos la bienvenida', 'Configura tus preferencias'];
  protected readonly flowSteps = ['Welcome aboard', 'Secure your account', 'Start banking'];
  protected readonly importCode = `import { CbOnboarding } from '@caribeng/ui/caribe/onboarding';`;
  protected readonly exampleCode = `<cb-onboarding [steps]="steps" />`;
  protected readonly composedCode = `<cb-onboarding [steps]="steps">
  <cb-illustration name="transfer-success" size="120px" />
  <p>Manage your money securely from anywhere, anytime.</p>
</cb-onboarding>`;
}
