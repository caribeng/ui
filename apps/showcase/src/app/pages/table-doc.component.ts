import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbTableCellDirective, CbTable, type CbTableColumn } from '@caribeng/ui/table';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

@Component({
  selector: 'doc-table-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbTable, CbTableCellDirective, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Data" title="Table" lead="Tabla de datos con columnas declarativas, ordenación, paginación y selección." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="Columnas con field/header; striped y ordenación por columna." [code]="basicCode" [codeTs]="dataTs">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" striped size="sm" />
    </doc-section>

    <doc-section id="paginator" title="Con paginación" description="paginator + rows + rowsPerPageOptions." [code]="pagCode">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" [paginator]="true" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" striped />
    </doc-section>

    <doc-section id="selection" title="Selección múltiple" description="selectionMode + [(selection)]; usa dataKey para identidad." [code]="selCode">
      <cb-table
        style="width: 100%"
        [value]="productos"
        [columns]="columns"
        selectionMode="multiple"
        dataKey="id"
        [(selection)]="seleccion"
        striped
      />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Seleccionados: {{ seleccion().length }}
      </p>
    </doc-section>

    <doc-section id="templates" title="Plantillas de celda" description="Usa cbTableCell con el nombre del field. La plantilla recibe la fila, su valor y la columna." [code]="templateCode">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" striped>
        <ng-template cbTableCell="nombre" let-row let-value="value" let-col="col">
          <strong>{{ value }}</strong>
          <small style="display:block;color:var(--cb-color-text-muted)">{{ row.categoria }} · {{ col.header }}</small>
        </ng-template>
      </cb-table>
    </doc-section>
  `,
})
export class TableDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly columns: CbTableColumn[] = [
    { field: 'nombre', header: 'Producto', sortable: true },
    { field: 'categoria', header: 'Categoría', sortable: true },
    { field: 'precio', header: 'Precio', sortable: true, align: 'right' },
    { field: 'stock', header: 'Stock', sortable: true, align: 'right' },
  ];

  protected readonly productos: Producto[] = [
    { id: 1, nombre: 'Teclado mecánico', categoria: 'Periféricos', precio: 120, stock: 34 },
    { id: 2, nombre: 'Mouse inalámbrico', categoria: 'Periféricos', precio: 60, stock: 120 },
    { id: 3, nombre: 'Monitor 27"', categoria: 'Pantallas', precio: 300, stock: 12 },
    { id: 4, nombre: 'Webcam HD', categoria: 'Video', precio: 85, stock: 48 },
    { id: 5, nombre: 'Auriculares', categoria: 'Audio', precio: 150, stock: 7 },
    { id: 6, nombre: 'Base USB-C', categoria: 'Accesorios', precio: 95, stock: 61 },
  ];

  protected readonly seleccion = signal<Producto[]>([]);

  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbTable, CbTableColumn } from '@caribeng/ui/table';`;
  protected readonly dataTs = `columns: CbTableColumn[] = [
  { field: 'nombre', header: 'Producto', sortable: true },
  { field: 'precio', header: 'Precio', sortable: true, align: 'right' },
];`;
  protected readonly basicCode = `<cb-table [value]="productos" [columns]="columns" striped />`;
  protected readonly pagCode = `<cb-table [value]="productos" [columns]="columns"
  [paginator]="true" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" />`;
  protected readonly selCode = `<cb-table [value]="productos" [columns]="columns"
  selectionMode="multiple" dataKey="id" [(selection)]="seleccion" />`;
  protected readonly templateCode = `<cb-table [value]="productos" [columns]="columns">
  <ng-template cbTableCell="nombre" let-row let-value="value" let-col="col">
    <strong>{{ value }}</strong>
    <small>{{ row.categoria }} · {{ col.header }}</small>
  </ng-template>
</cb-table>`;
}
