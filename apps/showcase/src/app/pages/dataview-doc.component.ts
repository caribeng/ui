import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbDataView, CbDataViewHeader, CbDataViewItemTemplate, type CbDataViewLayout } from '@caribeng/ui/dataview';
import { CbTag } from '@caribeng/ui/tag';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  disponible: boolean;
}

@Component({
  selector: 'doc-dataview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    CbDataView,
    CbDataViewItemTemplate,
    CbDataViewHeader,
    CbButton,
    CbTag,
    DocPlaygroundComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="DataView"
      lead="Muestra una colección en lista o cuadrícula con la plantilla que definas, paginación y cambio de vista."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Sin plantilla, cada elemento (con id, title, category y description) se muestra como tarjeta con un botón de selección."
      [code]="basicCode"
    >
      <div style="width: 100%">
        <cb-dataview [value]="cards" />
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla, vistas y paginación"
      description="cbDataViewItem define cada elemento y recibe la vista activa; showLayoutToggle añade los botones lista/cuadrícula y rows activa el paginador."
      [code]="templateCode"
    >
      <div style="width: 100%">
        <cb-dataview [value]="productos" [(layout)]="layout" [rows]="4" showLayoutToggle>
          <strong cbDataViewHeader>Catálogo ({{ productos.length }})</strong>
          <ng-template cbDataViewItem let-producto let-vista="layout">
            <article class="producto" [class.producto--lista]="vista === 'list'">
              <div>
                <strong>{{ producto.nombre }}</strong>
                <cb-tag [value]="producto.categoria" severity="secondary" />
              </div>
              <span class="producto__precio">{{ producto.precio | number }} COP</span>
              <cb-button size="sm" [disabled]="!producto.disponible">
                {{ producto.disponible ? 'Agregar' : 'Agotado' }}
              </cb-button>
            </article>
          </ng-template>
        </cb-dataview>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [`
    .producto { height: 100%; box-sizing: border-box; display: grid; gap: .5rem; padding: 1rem; border: 1px solid var(--cb-color-border); border-radius: var(--cb-radius-lg, .75rem); background: var(--cb-color-surface-raised); }
    .producto div { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
    .producto--lista { grid-template-columns: 1fr auto auto; align-items: center; }
    .producto__precio { font-weight: 600; color: var(--cb-color-text-strong); }
  `],
})
export class DataviewDocComponent {
  protected readonly docApi = DOC_API['cb-dataview'];

  protected readonly layout = signal<CbDataViewLayout>('grid');

  protected readonly cards = [
    { id: 1, title: 'Cuenta de ahorros', category: 'Ahorro', description: 'Sin cuota de manejo y con retiros gratis.' },
    { id: 2, title: 'Tarjeta de crédito', category: 'Crédito', description: 'Compra en cuotas y acumula puntos.' },
    { id: 3, title: 'CDT', category: 'Inversión', description: 'Rentabilidad fija a 90, 180 o 360 días.' },
  ];

  protected readonly productos: Producto[] = [
    { id: 1, nombre: 'Auriculares', categoria: 'Audio', precio: 189000, disponible: true },
    { id: 2, nombre: 'Parlante', categoria: 'Audio', precio: 249000, disponible: true },
    { id: 3, nombre: 'Monitor 27"', categoria: 'Video', precio: 1290000, disponible: false },
    { id: 4, nombre: 'Teclado', categoria: 'Accesorios', precio: 159000, disponible: true },
    { id: 5, nombre: 'Mouse', categoria: 'Accesorios', precio: 89000, disponible: true },
    { id: 6, nombre: 'Cámara web', categoria: 'Video', precio: 219000, disponible: true },
  ];

  protected readonly importCode = `import { CbDataView, CbDataViewItemTemplate, CbDataViewHeader } from '@caribeng/ui/dataview';`;

  protected readonly basicCode = `<cb-dataview [value]="cards" />`;

  protected readonly templateCode = `<cb-dataview [value]="productos" [(layout)]="layout" [rows]="4" showLayoutToggle>
  <strong cbDataViewHeader>Catálogo ({{ productos.length }})</strong>
  <ng-template cbDataViewItem let-producto let-vista="layout">
    <article class="producto" [class.producto--lista]="vista === 'list'">
      <strong>{{ producto.nombre }}</strong>
      <cb-tag [value]="producto.categoria" severity="secondary" />
      <span>{{ producto.precio | number }} COP</span>
      <cb-button size="sm" [disabled]="!producto.disponible">
        {{ producto.disponible ? 'Agregar' : 'Agotado' }}
      </cb-button>
    </article>
  </ng-template>
</cb-dataview>`;

  constructor() {
    inject(TocService).reset();
  }
}
