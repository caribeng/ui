import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbTrackerComponent } from '@caribeng/ui/tracker';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-tracker-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbTrackerComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Tracker" lead="Tracker para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-tracker [steps]="steps" [currentIndex]="1" /></doc-section>
  `,
})
export class TrackerDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly steps = ['Solicitud', 'Validaci?n', 'Finalizado'];
  protected readonly importCode = `import { CbTrackerComponent } from '@caribeng/ui/tracker';`;
  protected readonly exampleCode = `<cb-tracker [steps]="steps" [currentIndex]="1" />`;
}
