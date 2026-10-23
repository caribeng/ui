import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbProgressBar } from '@caribeng/ui/progressbar';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-progressbar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbProgressBar, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Varios" title="ProgressBar" lead="Barra de progreso determinada o indeterminada." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="value define el porcentaje y showValue lo muestra dentro de la barra." [code]="basicCode">
      <div style="width: 100%; display: flex; flex-direction: column; gap: 1rem">
        <cb-progressbar [value]="35" />
        <cb-progressbar [value]="70" showValue />
      </div>
    </doc-section>

    <doc-section id="indeterminate" title="Indeterminada" description="value=null anima sin un valor fijo." [code]="indCode">
      <div style="width: 100%">
        <cb-progressbar [value]="null" />
      </div>
    </doc-section>

    <doc-section id="severities" title="Severidades y tamaños" description="severity cambia el color y size el grosor de la barra." [code]="sevCode">
      <div style="width: 100%; display: flex; flex-direction: column; gap: 1rem">
        <cb-progressbar [value]="60" severity="success" size="sm" />
        <cb-progressbar [value]="60" severity="warning" />
        <cb-progressbar [value]="60" severity="danger" size="lg" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ProgressbarDocComponent {
  protected readonly a11y = DOC_A11Y['cb-progressbar'];
  protected readonly docApi = DOC_API['cb-progressbar'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbProgressBar } from '@caribeng/ui/progressbar';`;
  protected readonly basicCode = `<cb-progressbar [value]="35" />
<cb-progressbar [value]="70" showValue />`;
  protected readonly indCode = `<cb-progressbar [value]="null" />`;
  protected readonly sevCode = `<cb-progressbar [value]="60" severity="success" size="sm" />
<cb-progressbar [value]="60" severity="danger" size="lg" />`;
}
