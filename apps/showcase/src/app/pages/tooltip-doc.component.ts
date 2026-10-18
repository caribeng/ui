import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTooltipDirective } from '@caribeng/ui/tooltip';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-tooltip-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbTooltipDirective,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Overlay" title="Tooltip" lead="Texto flotante al pasar el cursor o enfocar. Directiva [cbTooltip] sobre cualquier elemento." />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="Añade cbTooltip a cualquier elemento interactivo." [code]="basicCode">
      <cb-button cbTooltip="Guarda los cambios">Guardar</cb-button>
    </doc-section>

    <doc-section id="positions" title="Posiciones" description="cbTooltipPosition: top · bottom · left · right." [code]="posCode">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap">
        <cb-button variant="outlined" cbTooltip="Arriba" cbTooltipPosition="top">Top</cb-button>
        <cb-button variant="outlined" cbTooltip="Abajo" cbTooltipPosition="bottom">Bottom</cb-button>
        <cb-button variant="outlined" cbTooltip="Izquierda" cbTooltipPosition="left">Left</cb-button>
        <cb-button variant="outlined" cbTooltip="Derecha" cbTooltipPosition="right">Right</cb-button>
      </div>
    </doc-section>
  `,
})
export class TooltipDocComponent {
  protected readonly docApi = DOC_API['cb-tooltip-content'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbTooltipDirective } from '@caribeng/ui/tooltip';`;
  protected readonly basicCode = `<cb-button cbTooltip="Guarda los cambios">Guardar</cb-button>`;
  protected readonly posCode = `<cb-button cbTooltip="Derecha" cbTooltipPosition="right">Right</cb-button>`;
}
