import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-coachmark-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCoachmark, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Coachmark" lead="Coachmark para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-coachmark [steps]="steps" /></doc-section>
  `,
})
export class CoachmarkDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Consulta tus productos aqui', 'Revisa tus movimientos'];
  protected readonly importCode = `import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';`;
  protected readonly exampleCode = `<cb-coachmark [steps]="steps" />`;
}
