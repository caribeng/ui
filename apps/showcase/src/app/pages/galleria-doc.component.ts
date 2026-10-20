import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbGalleria, CbGalleriaItem } from '@caribeng/ui/galleria';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-galleria-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbGalleria, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Multimedia" title="Galleria" lead="Galería fotográfica con visor principal y tira de miniaturas." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-galleria [value]="images" style="width: 100%; max-width: 520px" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class GalleriaDocComponent {
  protected readonly docApi = DOC_API['cb-galleria'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly images: CbGalleriaItem[] = [
    {
      itemImageSrc: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      title: 'Costa Caribeña',
    },
    {
      itemImageSrc: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
      title: 'Atardecer Tropical',
    },
  ];
  protected readonly importCode = `import { CbGalleria } from '@caribeng/ui/galleria';`;
  protected readonly basicCode = `<cb-galleria [value]="images" />`;
}
