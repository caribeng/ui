import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbImage } from '@caribeng/ui/image';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-image-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbImage, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Multimedia" title="Image" lead="Componente de imagen con visor lightbox y zoom integrado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Con Preview" [code]="basicCode">
      <cb-image
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"
        alt="Playa del Caribe"
        width="280px"
        [preview]="true"
      />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class ImageDocComponent {
  protected readonly docApi = DOC_API['cb-image'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbImage } from '@caribeng/ui/image';`;
  protected readonly basicCode = `<cb-image src="..." alt="Playa" width="280px" [preview]="true" />`;
}
