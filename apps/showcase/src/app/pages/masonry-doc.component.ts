import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbInfiniteScroll } from '@caribeng/ui/infinite-scroll';
import { CbMasonry } from '@caribeng/ui/masonry';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Foto {
  id: number;
  alto: number;
  titulo: string;
}

const LUGARES = ['Cartagena', 'Valle de Cocora', 'Tayrona', 'Villa de Leyva', 'Guatapé', 'San Andrés', 'Salento', 'Barichara', 'Desierto de la Tatacoa', 'Caño Cristales'];

function fotos(desde: number, n: number): Foto[] {
  return Array.from({ length: n }, (_, i) => {
    const id = desde + i;
    return { id, alto: [260, 340, 200, 420, 300, 240][id % 6], titulo: LUGARES[id % LUGARES.length] };
  });
}

@Component({
  selector: 'doc-masonry-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbMasonry, CbInfiniteScroll, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Panel"
      title="Masonry"
      lead="Rejilla de columnas con elementos de alturas distintas y sin huecos, como un tablero de Pinterest. Usa CSS Grid y mide el alto de cada elemento (también cuando carga una imagen), así que el orden del DOM —el que siguen el teclado y los lectores de pantalla— coincide con el orden visual por filas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="gallery"
      title="Galería con scroll infinito"
      description="Con minColumnWidth caben tantas columnas como permita el ancho (cambia el tamaño de la ventana). Cada foto ocupa las filas que pide su alto; las nuevas que llegan con cb-infinite-scroll se colocan solas. role=&quot;list&quot; y role=&quot;listitem&quot; le dan semántica de lista."
      [code]="galleryCode"
    >
      <div style="width: 100%">
        <cb-infinite-scroll scrollable height="30rem" [autoLimit]="3" [loading]="cargando()" [hasMore]="galeria().length < 60" [count]="galeria().length" itemSelector="figure" (loadMore)="cargar()">
          <cb-masonry minColumnWidth="12rem" gap="12px" role="list" aria-label="Destinos">
            @for (f of galeria(); track f.id) {
              <figure class="ms-card" role="listitem">
                <img [src]="'https://picsum.photos/seed/caribeng-' + f.id + '/400/' + f.alto" [alt]="f.titulo" loading="lazy" [style.aspect-ratio]="'400 / ' + f.alto" />
                <figcaption>{{ f.titulo }}</figcaption>
              </figure>
            }
          </cb-masonry>
        </cb-infinite-scroll>
      </div>
    </doc-section>

    <doc-section
      id="columns"
      title="Columnas fijas y tarjetas de texto"
      description="columns fija el número de columnas aunque cambie el ancho; gap acepta cualquier longitud CSS. Sirve igual para tarjetas de texto de distinto largo: el orden de lectura es 1, 2, 3… por filas."
      [code]="columnsCode"
    >
      <cb-masonry [columns]="3" gap="1rem" role="list" aria-label="Notas" style="width: 100%">
        @for (n of notas; track $index) {
          <article class="ms-note" role="listitem">
            <strong>{{ $index + 1 }}. {{ n.titulo }}</strong>
            <p>{{ n.texto }}</p>
          </article>
        }
      </cb-masonry>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .ms-card {
        margin: 0;
        overflow: hidden;
        border: 1px solid var(--cb-color-border);
        border-radius: 10px;
        background: var(--cb-color-surface-raised);
      }
      .ms-card img {
        display: block;
        width: 100%;
        height: auto;
        background: var(--cb-color-surface-hover);
      }
      .ms-card figcaption {
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 500;
      }
      .ms-note {
        padding: 0.875rem 1rem;
        border: 1px solid var(--cb-color-border);
        border-radius: 10px;
        background: var(--cb-color-surface-raised);
      }
      .ms-note p {
        margin: 0.375rem 0 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class MasonryDocComponent {
  protected readonly docApi = DOC_API['cb-masonry'];
  protected readonly a11y = DOC_A11Y['cb-masonry'];

  protected readonly galeria = signal<Foto[]>(fotos(0, 18));
  protected readonly cargando = signal(false);

  protected readonly notas = [
    { titulo: 'Revisión trimestral', texto: 'Revisar la morosidad por segmento y preparar el resumen para el comité.' },
    { titulo: 'Llamar a Luis', texto: 'Confirmar fecha.' },
    { titulo: 'Plan de lanzamiento', texto: 'Definir el mensaje de la campaña, el presupuesto por canal, las fechas de cada fase y quién aprueba cada pieza antes de publicarla.' },
    { titulo: 'Compras', texto: 'Licencias de diseño y dos monitores.' },
    { titulo: 'Ideas para el portal', texto: 'Simulador de crédito, pagos programados, notificaciones por correo y un panel con el resumen de gastos del mes.' },
    { titulo: 'Pendiente', texto: 'Firmar el contrato de arrendamiento.' },
  ];

  protected cargar(): void {
    this.cargando.set(true);
    setTimeout(() => {
      this.galeria.update((l) => [...l, ...fotos(l.length, Math.min(12, 60 - l.length))]);
      this.cargando.set(false);
    }, 600);
  }

  protected readonly importCode = `import { CbMasonry } from '@caribeng/ui/masonry';`;
  protected readonly galleryCode = `<cb-infinite-scroll scrollable height="30rem" [autoLimit]="3" [loading]="cargando()" [hasMore]="galeria().length < 60" [count]="galeria().length" itemSelector="figure" (loadMore)="cargar()">
  <cb-masonry minColumnWidth="12rem" gap="12px" role="list" aria-label="Destinos">
    @for (f of galeria(); track f.id) {
      <figure class="ms-card" role="listitem">
        <img [src]="'https://picsum.photos/seed/caribeng-' + f.id + '/400/' + f.alto" [alt]="f.titulo" loading="lazy" [style.aspect-ratio]="'400 / ' + f.alto" />
        <figcaption>{{ f.titulo }}</figcaption>
      </figure>
    }
  </cb-masonry>
</cb-infinite-scroll>`;
  protected readonly columnsCode = `<cb-masonry [columns]="3" gap="1rem" role="list" aria-label="Notas" style="width: 100%">
  @for (n of notas; track $index) {
    <article class="ms-note" role="listitem">
      <strong>{{ $index + 1 }}. {{ n.titulo }}</strong>
      <p>{{ n.texto }}</p>
    </article>
  }
</cb-masonry>`;

  constructor() {
    inject(TocService).reset();
  }
}
