import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCarousel, CbCarouselItem } from '@caribeng/ui/carousel';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-carousel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCarousel, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Multimedia" title="Carousel" lead="Carrusel accesible de contenido con navegación e indicadores." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Recorre el arreglo items con navegación por flechas e indicadores." [code]="basicCode">
      <cb-carousel [items]="items" style="width: 100%" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class CarouselDocComponent {
  protected readonly docApi = DOC_API['cb-carousel'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly items: CbCarouselItem[] = [
    { badge: 'v0.16', title: 'Reactividad con Signals', description: 'Componentes standalone con ChangeDetectionStrategy.OnPush.' },
    { badge: 'Aura', title: 'Tokens CSS y Dark Mode', description: 'Paleta esmeralda adaptable sin dependencias externas.' },
    { badge: 'WCAG 2.2', title: 'Accesibilidad nativa', description: 'Navegación por teclado y roles ARIA en todo el catálogo.' },
  ];
  protected readonly importCode = `import { CbCarousel } from '@caribeng/ui/carousel';`;
  protected readonly basicCode = `<cb-carousel [items]="items" />`;
}
