import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbIconField, CbInputIcon } from '@caribeng/ui/iconfield';
import { CbInput } from '@caribeng/ui/input';
import { CbIcon } from '@caribeng/ui/icon';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-iconfield-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbIconField,
    CbInputIcon,
    CbInput,
    CbIcon,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Form" title="IconField" lead="Integra iconos informativos a la izquierda o derecha de un campo de entrada." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="width: 280px">
        <cb-icon-field iconPosition="left">
          <cb-input-icon><cb-icon name="search" [size]="15" /></cb-input-icon>
          <cb-input placeholder="Buscar…" />
        </cb-icon-field>
      </div>
    </doc-section>
  `,
})
export class IconfieldDocComponent {
  protected readonly docApi = DOC_API['cb-icon-field'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbIconField, CbInputIcon } from '@caribeng/ui/iconfield';`;
  protected readonly basicCode = `<cb-icon-field iconPosition="left">
  <cb-input-icon><cb-icon name="search" [size]="15" /></cb-input-icon>
  <cb-input placeholder="Buscar…" />
</cb-icon-field>`;
}
