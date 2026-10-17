import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCarouselComponent, CbCarouselItem } from '@caribeng/ui/carousel';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-carousel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCarouselComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Media" title="Carousel" lead="Carrusel accesible de contenido con navegación e indicadores." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-carousel [items]="items" style="width: 100%" />
    </doc-section>
  `,
})
export class CarouselDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly items: CbCarouselItem[] = [
    { badge: 'v0.16', title: 'Reactividad con Signals', description: 'Componentes standalone con ChangeDetectionStrategy.OnPush.' },
    { badge: 'Aura', title: 'Tokens CSS y Dark Mode', description: 'Paleta esmeralda adaptable sin dependencias externas.' },
    { badge: 'WCAG 2.2', title: 'Accesibilidad nativa', description: 'Navegación por teclado y roles ARIA en todo el catálogo.' },
  ];
  protected readonly importCode = `import { CbCarouselComponent } from '@caribeng/ui/carousel';`;
  protected readonly basicCode = `<cb-carousel [items]="items" />`;
}
