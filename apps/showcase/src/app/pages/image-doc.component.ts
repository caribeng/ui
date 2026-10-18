import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbImage } from '@caribeng/ui/image';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-image-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbImage, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Media" title="Image" lead="Componente de imagen con visor lightbox y zoom integrado." />
    <doc-section id="import" title="Import">
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
  `,
})
export class ImageDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbImage } from '@caribeng/ui/image';`;
  protected readonly basicCode = `<cb-image src="..." alt="Playa" width="280px" [preview]="true" />`;
}
