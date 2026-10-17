import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbSpinnerComponent } from '@caribeng/ui/spinner';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-spinner-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbSpinnerComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="Spinner" lead="Indicador de carga circular." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="sizes" title="Tamaños" [code]="sizeCode">
      <div style="display: flex; gap: 1.5rem; align-items: center">
        <cb-spinner [size]="24" />
        <cb-spinner />
        <cb-spinner [size]="48" />
      </div>
    </doc-section>

    <doc-section id="severities" title="Severidades" [code]="sevCode">
      <div style="display: flex; gap: 1.5rem; align-items: center">
        <cb-spinner severity="primary" />
        <cb-spinner severity="success" />
        <cb-spinner severity="warning" />
        <cb-spinner severity="danger" />
      </div>
    </doc-section>
  `,
})
export class SpinnerDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSpinnerComponent } from '@caribeng/ui/spinner';`;
  protected readonly sizeCode = `<cb-spinner [size]="24" />
<cb-spinner [size]="48" />`;
  protected readonly sevCode = `<cb-spinner severity="success" />`;
}
