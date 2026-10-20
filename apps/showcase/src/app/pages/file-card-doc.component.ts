import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbFileCard } from '@caribeng/ui/file-card';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { TocService } from '../services/toc.service';

interface Cat {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  value: string;
  valueSub: string;
}

@Component({
  selector: 'doc-file-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbFileCard, DocPageHeaderComponent, DocSectionComponent, CodeBlockComponent],
  template: `
    <doc-page-header
      eyebrow="Archivos"
      title="FileCard"
      lead="Tarjeta de categoría/almacenamiento genérica: icono con tinte, título y subtítulo, más dos valores a la derecha. Pieza base de un gestor de archivos tipo Drive."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Icono con color, título + subtítulo a la izquierda y dos valores a la derecha."
      [code]="basicCode"
    >
      <cb-file-card
        icon="image"
        color="#10b981"
        title="Imágenes"
        subtitle="17% usado"
        value="245 archivos"
        valueSub="26.4 GB"
        style="max-width: 320px"
      />
    </doc-section>

    <doc-section
      id="grid"
      title="Rejilla de categorías"
      description="Varias file-card forman la sección 'All Media' de un gestor de archivos."
      [code]="gridCode"
    >
      <div class="fc-grid">
        @for (c of cats; track c.title) {
          <cb-file-card
            [icon]="c.icon"
            [color]="c.color"
            [title]="c.title"
            [subtitle]="c.subtitle"
            [value]="c.value"
            [valueSub]="c.valueSub"
          />
        }
      </div>
    </doc-section>
  `,
  styles: [
    `
      .fc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 0.75rem;
      }
    `,
  ],
})
export class FileCardDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly cats: Cat[] = [
    { icon: 'image', color: '#10b981', title: 'Imágenes', subtitle: '17% usado', value: '245 archivos', valueSub: '26.4 GB' },
    { icon: 'play', color: '#ec4899', title: 'Videos', subtitle: '22% usado', value: '245 archivos', valueSub: '26.4 GB' },
    { icon: 'file', color: '#f59e0b', title: 'Documentos', subtitle: '10% usado', value: '78 archivos', valueSub: '5.4 GB' },
    { icon: 'download', color: '#8b5cf6', title: 'Descargas', subtitle: '16% usado', value: '245 archivos', valueSub: '26.4 GB' },
  ];

  protected readonly importCode = `import { CbFileCard } from '@caribeng/ui/file-card';`;

  protected readonly basicCode = `<cb-file-card
  icon="image" color="#10b981"
  title="Imágenes" subtitle="17% usado"
  value="245 archivos" valueSub="26.4 GB" />`;

  protected readonly gridCode = `<div class="grid">
  @for (c of cats; track c.title) {
    <cb-file-card [icon]="c.icon" [color]="c.color" [title]="c.title"
      [subtitle]="c.subtitle" [value]="c.value" [valueSub]="c.valueSub" />
  }
</div>`;
}
