import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPopOver } from '@caribeng/ui/caribe/pop-over';
import { CbStatus } from '@caribeng/ui/caribe/status';
import { CbLink } from '@caribeng/ui/caribe/link';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-pop-over-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbPopOver, CbStatus, CbLink, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Pop Over" lead="Pop Over para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-pop-over triggerLabel="Ver informacion">Informacion adicional sobre la opci?n.</cb-pop-over></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Pop-over con contenido rico', 'Pop-over with rich content')"
      [description]="
        i18n.t(
          'Composición de alto nivel: el pop-over integra un chip de status, texto y un enlace de Caribe.',
          'High-level composition: the pop-over integrates a status chip, text and a Caribe link.'
        )
      "
      [code]="composedCode"
    >
      <cb-pop-over triggerLabel="Account status">
        <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem">
          <cb-status status="success" text="Active" />
          <p style="margin: 0">Your account is active and fully verified.</p>
          <cb-link href="#" [external]="true">View full report</cb-link>
        </div>
      </cb-pop-over>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class PopOverDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-pop-over'];

  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbPopOver } from '@caribeng/ui/caribe/pop-over';`;
  protected readonly exampleCode = `<cb-pop-over triggerLabel="Ver informacion">Informacion adicional sobre la opci?n.</cb-pop-over>`;
  protected readonly composedCode = `<cb-pop-over triggerLabel="Account status">
  <cb-status status="success" text="Active" />
  <p>Your account is active and fully verified.</p>
  <cb-link href="#" [external]="true">View full report</cb-link>
</cb-pop-over>`;
}
