import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbBadge } from '@caribeng/ui/badge';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-badge-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbBadge, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Mensajes" title="Badge" lead="Indicador compacto de conteo o estado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="severities" title="Severidades" description="value acepta números o texto corto; severity define el color." [code]="sevCode">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center">
        <cb-badge [value]="8" />
        <cb-badge [value]="3" severity="secondary" />
        <cb-badge [value]="12" severity="success" />
        <cb-badge [value]="5" severity="info" />
        <cb-badge [value]="9" severity="warning" />
        <cb-badge [value]="99" severity="danger" />
        <cb-badge [value]="7" severity="help" />
        <cb-badge value="new" severity="contrast" />
      </div>
    </doc-section>

    <doc-section id="sizes" title="Tamaños" description="Tres tamaños con size: sm, md (por defecto) y lg." [code]="sizeCode">
      <div style="display: flex; gap: 1rem; align-items: center">
        <cb-badge [value]="8" size="sm" severity="danger" />
        <cb-badge [value]="8" severity="danger" />
        <cb-badge [value]="8" size="lg" severity="danger" />
      </div>
    </doc-section>

    <doc-section id="dot" title="Punto (dot)" description="Sin texto, útil como indicador de estado." [code]="dotCode">
      <div style="display: flex; gap: 1rem; align-items: center">
        <cb-badge dot severity="success" />
        <cb-badge dot severity="warning" />
        <cb-badge dot severity="danger" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class BadgeDocComponent {
  protected readonly docApi = DOC_API['cb-badge'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbBadge } from '@caribeng/ui/badge';`;
  protected readonly sevCode = `<cb-badge [value]="8" />
<cb-badge [value]="99" severity="danger" />
<cb-badge value="new" severity="contrast" />`;
  protected readonly sizeCode = `<cb-badge [value]="8" size="sm" />
<cb-badge [value]="8" />
<cb-badge [value]="8" size="lg" />`;
  protected readonly dotCode = `<cb-badge dot severity="success" />`;
}
