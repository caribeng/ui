import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInlineMessage } from '@caribeng/ui/inlinemessage';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-inlinemessage-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbInlineMessage, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Mensajes" title="InlineMessage" lead="Mensaje compacto en línea para retroalimentación inmediata de formularios." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Severidades" description="Mensaje breve en línea; severity define el color." [code]="basicCode">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
        <cb-inline-message severity="info" text="Información" />
        <cb-inline-message severity="success" text="Guardado" />
        <cb-inline-message severity="warn" text="Revisa el formato" />
        <cb-inline-message severity="danger" text="Campo requerido" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class InlinemessageDocComponent {
  protected readonly a11y = DOC_A11Y['cb-inline-message'];
  protected readonly docApi = DOC_API['cb-inline-message'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbInlineMessage } from '@caribeng/ui/inlinemessage';`;
  protected readonly basicCode = `<cb-inline-message severity="danger" text="Campo requerido" />`;
}
