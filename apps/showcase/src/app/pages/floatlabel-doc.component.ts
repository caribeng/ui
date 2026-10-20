import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFloatLabel } from '@caribeng/ui/floatlabel';
import { CbInput } from '@caribeng/ui/input';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-floatlabel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbFloatLabel, CbInput, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="FloatLabel" lead="Etiqueta flotante reactiva al foco y al contenido del control." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="width: 280px">
        <cb-float-label>
          <cb-input />
          <label>Nombre de usuario</label>
        </cb-float-label>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class FloatlabelDocComponent {
  protected readonly docApi = DOC_API['cb-float-label'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbFloatLabel } from '@caribeng/ui/floatlabel';`;
  protected readonly basicCode = `<cb-float-label>
  <cb-input />
  <label>Nombre de usuario</label>
</cb-float-label>`;
}
