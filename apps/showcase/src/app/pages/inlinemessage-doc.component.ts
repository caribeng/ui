import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbInlineMessageComponent } from '@caribeng/ui/inlinemessage';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-inlinemessage-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbInlineMessageComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Messages" title="InlineMessage" lead="Mensaje compacto en línea para retroalimentación inmediata de formularios." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Severidades" [code]="basicCode">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
        <cb-inline-message severity="info" text="Información" />
        <cb-inline-message severity="success" text="Guardado" />
        <cb-inline-message severity="warn" text="Revisa el formato" />
        <cb-inline-message severity="danger" text="Campo requerido" />
      </div>
    </doc-section>
  `,
})
export class InlinemessageDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbInlineMessageComponent } from '@caribeng/ui/inlinemessage';`;
  protected readonly basicCode = `<cb-inline-message severity="danger" text="Campo requerido" />`;
}
