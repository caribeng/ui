import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-coachmark-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCoachmark, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Coachmark" lead="Coachmark para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-coachmark [steps]="steps" /></doc-section>
  `,
})
export class CoachmarkDocComponent {
  protected readonly docApi = DOC_API['cb-coachmark'];

  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Consulta tus productos aqui', 'Revisa tus movimientos'];
  protected readonly importCode = `import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';`;
  protected readonly exampleCode = `<cb-coachmark [steps]="steps" />`;
}
