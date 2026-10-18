import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbSplitter, CbSplitterPanel } from '@caribeng/ui/splitter';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-splitter-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbSplitter,
    CbSplitterPanel,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Panel"
      title="Splitter"
      lead="Divide un contenedor en múltiples paneles redimensionables mediante arrastre o teclado."
    />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="horizontal"
      title="Horizontal"
      description="Arrastra el separador central o enfócalo con Tab y usa las flechas izquierda/derecha."
      [code]="horizontalCode"
    >
      <cb-splitter style="width: 100%; height: 180px">
        <cb-splitter-panel [size]="35" [minSize]="15">
          <div>
            <strong>Explorador (35%)</strong>
            <p style="margin: 0.25rem 0 0; opacity: 0.75">Árbol de navegación</p>
          </div>
        </cb-splitter-panel>
        <cb-splitter-panel [size]="65" [minSize]="20">
          <div>
            <strong>Editor principal (65%)</strong>
            <p style="margin: 0.25rem 0 0; opacity: 0.75">Zona de contenido</p>
          </div>
        </cb-splitter-panel>
      </cb-splitter>
    </doc-section>

    <doc-section id="vertical" title="Vertical" [code]="verticalCode">
      <cb-splitter layout="vertical" style="width: 100%; height: 220px">
        <cb-splitter-panel [size]="55">
          <strong>Vista superior</strong>
        </cb-splitter-panel>
        <cb-splitter-panel [size]="45">
          <strong>Consola inferior</strong>
        </cb-splitter-panel>
      </cb-splitter>
    </doc-section>
  `,
})
export class SplitterDocComponent {
  protected readonly docApi = DOC_API['cb-splitter'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSplitter, CbSplitterPanel } from '@caribeng/ui/splitter';`;
  protected readonly horizontalCode = `<cb-splitter style="height: 180px">
  <cb-splitter-panel [size]="35">Panel izquierdo</cb-splitter-panel>
  <cb-splitter-panel [size]="65">Panel derecho</cb-splitter-panel>
</cb-splitter>`;
  protected readonly verticalCode = `<cb-splitter layout="vertical" style="height: 220px">
  <cb-splitter-panel [size]="55">Superior</cb-splitter-panel>
  <cb-splitter-panel [size]="45">Inferior</cb-splitter-panel>
</cb-splitter>`;
}
