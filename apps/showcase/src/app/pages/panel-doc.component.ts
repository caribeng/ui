import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPanel } from '@caribeng/ui/panel';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-panel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    CbPanel,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Paneles"
      title="Panel"
      lead="Contenedor de agrupación con encabezado, cuerpo colapsable opcional y pie proyectado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Contenedor con cabecera definida por header." [code]="basicCode">
      <cb-panel header="Resumen de cuenta" style="width: 100%">
        <p style="margin: 0">
          CaribeNG proporciona contenedores modulares con tokens CSS adaptables a modo claro y oscuro.
        </p>
      </cb-panel>
    </doc-section>

    <doc-section
      id="toggleable"
      title="Colapsable y Pie"
      description="Activa toggleable para permitir contraer/expandir el contenido y proyecta acciones con [cb-panel-footer]."
      [code]="toggleableCode"
    >
      <cb-panel
        header="Detalles del despliegue"
        toggleable
        [(collapsed)]="collapsed"
        style="width: 100%"
      >
        <p style="margin: 0">
          El paquete <code>&#64;caribeng/ui</code> compila cada componente como un secondary entry point independiente.
        </p>
        <div cb-panel-footer style="display: flex; justify-content: flex-end; gap: 0.5rem">
          <cb-button size="sm" variant="outlined" (click)="collapsed.set(true)">Contraer</cb-button>
        </div>
      </cb-panel>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class PanelDocComponent {
  protected readonly a11y = DOC_A11Y['cb-panel'];
  protected readonly docApi = DOC_API['cb-panel'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly collapsed = signal(false);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbPanel } from '@caribeng/ui/panel';`;
  protected readonly basicCode = `<cb-panel header="Resumen de cuenta">
  <p>Contenido del panel…</p>
</cb-panel>`;
  protected readonly toggleableCode = `<cb-panel header="Detalles" toggleable [(collapsed)]="collapsed">
  <p>Contenido colapsable…</p>
  <div cb-panel-footer>Pie del panel</div>
</cb-panel>`;
}
