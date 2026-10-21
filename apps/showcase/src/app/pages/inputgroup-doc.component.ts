import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CbInputGroup,
  CbInputGroupAddon,
} from '@caribeng/ui/inputgroup';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';

@Component({
  selector: 'doc-inputgroup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbInputGroup,
    CbInputGroupAddon,
    CbInput,
    CbButton,
    CbIcon,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="InputGroup"
      lead="Agrupa un control con addons (texto o icono) y botones, uniéndolos visualmente."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Addon de texto o icono antes del control." [code]="basicCode">
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 340px">
        <cb-input-group>
          <cb-input-group-addon>&#64;</cb-input-group-addon>
          <cb-input placeholder="usuario" />
        </cb-input-group>
        <cb-input-group>
          <cb-input-group-addon><cb-icon name="search" [size]="16" /></cb-input-group-addon>
          <cb-input placeholder="Buscar…" />
        </cb-input-group>
      </div>
    </doc-section>

    <doc-section id="button" title="Con botón" description="Combina input y botón en un mismo grupo." [code]="buttonCode">
      <div style="max-width: 360px">
        <cb-input-group>
          <cb-input placeholder="Correo electrónico" />
          <cb-button>Suscribir</cb-button>
        </cb-input-group>
      </div>
    </doc-section>

    <doc-section id="both" title="Addons a ambos lados" description="Coloca cb-input-group-addon antes y después del campo." [code]="bothCode">
      <div style="max-width: 300px">
        <cb-input-group>
          <cb-input-group-addon>$</cb-input-group-addon>
          <cb-input placeholder="0.00" />
          <cb-input-group-addon>.00</cb-input-group-addon>
        </cb-input-group>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class InputgroupDocComponent {
  protected readonly docApi = DOC_API['cb-input-group'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbInputGroup, CbInputGroupAddon } from '@caribeng/ui/inputgroup';`;
  protected readonly basicCode = `<cb-input-group>
  <cb-input-group-addon>@</cb-input-group-addon>
  <cb-input placeholder="usuario" />
</cb-input-group>`;
  protected readonly buttonCode = `<cb-input-group>
  <cb-input placeholder="Correo electrónico" />
  <cb-button>Suscribir</cb-button>
</cb-input-group>`;
  protected readonly bothCode = `<cb-input-group>
  <cb-input-group-addon>$</cb-input-group-addon>
  <cb-input placeholder="0.00" />
  <cb-input-group-addon>.00</cb-input-group-addon>
</cb-input-group>`;
}
