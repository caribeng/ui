import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbModal } from '@caribeng/ui/caribe/modal';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-modal-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbModal, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Modal" lead="Modal para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-modal title="Confirmar operacion" [visible]="true">Deseas continuar?</cb-modal></doc-section>
  `,
})
export class ModalDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbModal } from '@caribeng/ui/caribe/modal';`;
  protected readonly exampleCode = `<cb-modal title="Confirmar operacion" [visible]="true">Deseas continuar?</cb-modal>`;
}
