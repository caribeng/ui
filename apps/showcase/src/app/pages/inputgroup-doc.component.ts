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

@Component({
  selector: 'doc-inputgroup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbInputGroup,
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
      eyebrow="Form"
      title="InputGroup"
      lead="Agrupa un control con addons (texto o icono) y botones, uniéndolos visualmente."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="Addon de texto o icono antes del control." [code]="basicCode">
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

    <doc-section id="both" title="Addons a ambos lados" [code]="bothCode">
      <div style="max-width: 300px">
        <cb-input-group>
          <cb-input-group-addon>$</cb-input-group-addon>
          <cb-input placeholder="0.00" />
          <cb-input-group-addon>.00</cb-input-group-addon>
        </cb-input-group>
      </div>
    </doc-section>
  `,
})
export class InputgroupDocComponent {
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
