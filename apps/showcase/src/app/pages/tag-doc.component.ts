import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTag } from '@caribeng/ui/tag';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-tag-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbTag, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Mensajes" title="Tag" lead="Etiqueta para categorizar o marcar estado, con icono opcional." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="severities" title="Severidades" [code]="sevCode">
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center">
        <cb-tag value="Primary" />
        <cb-tag value="Secondary" severity="secondary" />
        <cb-tag value="Success" severity="success" />
        <cb-tag value="Info" severity="info" />
        <cb-tag value="Warning" severity="warning" />
        <cb-tag value="Danger" severity="danger" />
        <cb-tag value="Help" severity="help" />
        <cb-tag value="Contrast" severity="contrast" />
      </div>
    </doc-section>

    <doc-section id="icon" title="Con icono" [code]="iconCode">
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center">
        <cb-tag value="Verificado" severity="success" icon="circle-check" />
        <cb-tag value="Pendiente" severity="warning" icon="clock" />
        <cb-tag value="Error" severity="danger" icon="circle-x" />
      </div>
    </doc-section>

    <doc-section id="rounded" title="Redondeado (pill)" [code]="roundedCode">
      <div style="display: flex; gap: 0.5rem; align-items: center">
        <cb-tag value="Activo" severity="success" rounded />
        <cb-tag value="Beta" severity="info" rounded />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class TagDocComponent {
  protected readonly docApi = DOC_API['cb-tag'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbTag } from '@caribeng/ui/tag';`;
  protected readonly sevCode = `<cb-tag value="Success" severity="success" />
<cb-tag value="Danger" severity="danger" />`;
  protected readonly iconCode = `<cb-tag value="Verificado" severity="success" icon="circle-check" />`;
  protected readonly roundedCode = `<cb-tag value="Activo" severity="success" rounded />`;
}
