import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbScrollTop } from '@caribeng/ui/scrolltop';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-scrolltop-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    CbScrollTop,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Paneles"
      title="ScrollTop"
      lead="Botón flotante que aparece al superar un umbral de desplazamiento para volver rápidamente al inicio."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="parent"
      title="Sobre contenedor padre"
      description="Desplaza hacia abajo el contenedor para que aparezca el botón flotante en la esquina inferior derecha."
      [code]="parentCode"
    >
      <div
        style="
          width: 100%;
          height: 200px;
          overflow: auto;
          position: relative;
          padding: 1rem;
          border: 1px solid var(--cb-color-border);
          border-radius: var(--cb-radius-lg);
        "
      >
        <p style="margin-top: 0"><strong>Inicio del contenedor desplazable</strong></p>
        <p>Desplázate hacia abajo más de 60px para revelar el botón <code>&lt;cb-scroll-top&gt;</code>.</p>
        <p>Párrafo de ejemplo 1 — Arquitectura basada en Signals y OnPush.</p>
        <p>Párrafo de ejemplo 2 — Tokens CSS con soporte nativo para modo oscuro.</p>
        <p>Párrafo de ejemplo 3 — Accesibilidad WCAG 2.2 AA integrada en cada control.</p>
        <p>Párrafo de ejemplo 4 — Haz clic en el botón flotante para regresar suavemente al inicio.</p>
        <cb-scroll-top target="parent" [threshold]="60" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ScrolltopDocComponent {
  protected readonly a11y = DOC_A11Y['cb-scroll-top'];
  protected readonly docApi = DOC_API['cb-scroll-top'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbScrollTop } from '@caribeng/ui/scrolltop';`;
  protected readonly parentCode = `<div style="height: 200px; overflow: auto; position: relative">
  <p>Contenido extenso…</p>
  <cb-scroll-top target="parent" [threshold]="60" />
</div>`;
}
