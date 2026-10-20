import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbScrollPanel } from '@caribeng/ui/scrollpanel';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-scrollpanel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbScrollPanel,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Paneles"
      title="ScrollPanel"
      lead="Contenedor de desplazamiento accesible con barras estilizadas mediante tokens CSS."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-scroll-panel width="100%" height="180px" ariaLabel="Notas de versión" style="width: 100%">
        <p style="margin-top: 0">
          <strong>CaribeNG Design System</strong> ofrece componentes modulares e independientes construidos sobre Angular 22, Signals y CSS Custom Properties.
        </p>
        <p>
          Cada entrada se publica como un secondary entry point de <code>&#64;caribeng/ui</code>, garantizando un tree-shaking óptimo en aplicaciones empresariales.
        </p>
        <p>
          El contenedor incluye <code>role="region"</code> y <code>tabindex="0"</code> para permitir desplazamiento directo mediante teclado (flechas arriba/abajo y PageUp/PageDown).
        </p>
        <p style="margin-bottom: 0">
          Las barras de desplazamiento heredan automáticamente el color primario activo del tema claro u oscuro.
        </p>
      </cb-scroll-panel>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class ScrollpanelDocComponent {
  protected readonly docApi = DOC_API['cb-scroll-panel'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbScrollPanel } from '@caribeng/ui/scrollpanel';`;
  protected readonly basicCode = `<cb-scroll-panel width="100%" height="180px" ariaLabel="Notas de versión">
  <p>Contenido extenso…</p>
</cb-scroll-panel>`;
}
