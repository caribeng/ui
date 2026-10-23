import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbIconField, CbInputIcon } from '@caribeng/ui/iconfield';
import { CbInput } from '@caribeng/ui/input';
import { CbIcon } from '@caribeng/ui/icon';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-iconfield-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbIconField,
    CbInputIcon,
    CbInput,
    CbIcon,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Formulario" title="IconField" lead="Integra iconos informativos a la izquierda o derecha de un campo de entrada." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Coloca un icono dentro del campo; iconPosition indica el lado." [code]="basicCode">
      <div style="width: 280px">
        <cb-icon-field iconPosition="left">
          <cb-input-icon><cb-icon name="search" [size]="15" /></cb-input-icon>
          <cb-input placeholder="Buscar…" />
        </cb-icon-field>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class IconfieldDocComponent {
  protected readonly a11y = DOC_A11Y['cb-icon-field'];
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
