import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInplace } from '@caribeng/ui/inplace';
import { CbInput } from '@caribeng/ui/input';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-inplace-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbInplace, CbInput, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="Inplace" lead="Edición in-situ que alterna entre vista de lectura y control interactivo." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-inplace [closable]="true">
        <span cb-inplace-display>Haz clic para editar el nombre</span>
        <cb-input cb-inplace-content value="CaribeNG v1.0" />
      </cb-inplace>
    </doc-section>
  `,
})
export class InplaceDocComponent {
  protected readonly docApi = DOC_API['cb-inplace'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbInplace } from '@caribeng/ui/inplace';`;
  protected readonly basicCode = `<cb-inplace [closable]="true">
  <span cb-inplace-display>Haz clic para editar</span>
  <cb-input cb-inplace-content value="CaribeNG" />
</cb-inplace>`;
}
