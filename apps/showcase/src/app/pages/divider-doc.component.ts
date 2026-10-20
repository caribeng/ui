import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDivider } from '@caribeng/ui/divider';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-divider-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDivider, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Paneles" title="Divider" lead="Separador horizontal o vertical, con etiqueta opcional." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Separa contenido con una línea horizontal." [code]="basicCode">
      <p style="margin: 0">Sección uno.</p>
      <cb-divider />
      <p style="margin: 0">Sección dos.</p>
    </doc-section>

    <doc-section id="label" title="Con etiqueta" description="align: start · center · end." [code]="labelCode">
      <cb-divider align="start">Inicio</cb-divider>
      <cb-divider align="center">o</cb-divider>
      <cb-divider align="end">Fin</cb-divider>
    </doc-section>

    <doc-section id="types" title="Estilos de línea" description="type cambia el estilo de la línea: solid (por defecto), dashed o dotted." [code]="typesCode">
      <cb-divider type="solid" />
      <cb-divider type="dashed" />
      <cb-divider type="dotted" />
    </doc-section>

    <doc-section id="vertical" title="Vertical" description="Con orientation=vertical separa elementos dispuestos en fila." [code]="verticalCode">
      <div style="display: flex; align-items: center; height: 2rem">
        <span>Inicio</span>
        <cb-divider orientation="vertical" />
        <span>Perfil</span>
        <cb-divider orientation="vertical" />
        <span>Ajustes</span>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class DividerDocComponent {
  protected readonly docApi = DOC_API['cb-divider'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbDivider } from '@caribeng/ui/divider';`;
  protected readonly basicCode = `<p>Sección uno.</p>
<cb-divider />
<p>Sección dos.</p>`;
  protected readonly labelCode = `<cb-divider align="start">Inicio</cb-divider>
<cb-divider align="center">o</cb-divider>
<cb-divider align="end">Fin</cb-divider>`;
  protected readonly typesCode = `<cb-divider type="dashed" />
<cb-divider type="dotted" />`;
  protected readonly verticalCode = `<cb-divider orientation="vertical" />`;
}
