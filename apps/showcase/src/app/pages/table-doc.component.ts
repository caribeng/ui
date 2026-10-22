import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  CbTableCellDirective,
  CbTable,
  CbTableGroupHeader,
  CbTableRowExpansion,
  type CbTableColumn,
  type CbTableLazyLoadEvent,
} from '@caribeng/ui/table';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbTag } from '@caribeng/ui/tag';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';
import type { CbSeverity } from '@caribeng/ui';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
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

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  iniciales: string;
  rol: string;
  estado: string;
  severity: CbSeverity;
}

@Component({
  selector: 'doc-table-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbTable,
    CbTableCellDirective,
    CbTableRowExpansion,
    CbTableGroupHeader,
    CbAvatar,
    CbTag,
    CbButton,
    CbIcon,
    CbIconButton,
    DocA11yComponent,
    DocPlaygroundComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Datos" title="Table" lead="Tabla de datos con columnas declarativas, ordenación, filtros, paginación, selección, columnas redimensionables y fijas, filas expandibles y agrupadas, exportación a CSV y carga desde el servidor." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Columnas con field/header; striped y ordenación por columna." [code]="basicCode" [codeTs]="dataTs">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" striped size="sm" />
    </doc-section>

    <doc-section id="paginator" title="Con paginación" description="paginator + rows + rowsPerPageOptions." [code]="pagCode">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" [paginator]="true" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" striped />
    </doc-section>

    <doc-section id="selection" title="Selección múltiple" description="selectionMode + [(selection)]; usa dataKey para identidad." [code]="selCode">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" selectionMode="multiple" dataKey="id" [(selection)]="seleccion" striped />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Seleccionados: {{ seleccion().length }}
      </p>
    </doc-section>

    <doc-section
      id="single"
      title="Selección simple"
      description="Con selectionMode=&quot;single&quot; cada fila tiene un radio; elegir otra fila reemplaza la selección."
      [code]="singleCode"
    >
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" selectionMode="single" dataKey="id" [(selection)]="elegido" size="sm" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Elegido: {{ elegido()?.nombre ?? 'ninguno' }}
      </p>
    </doc-section>

    <doc-section
      id="global-filter"
      title="Filtro global"
      description="[globalFilter] busca en todas las columnas (o en globalFilterFields) sin distinguir mayúsculas ni tildes. El campo de búsqueda es tuyo: colócalo donde quieras."
      [code]="globalFilterCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <input
          type="search"
          class="tbl-filter-input"
          placeholder="Buscar producto o categoría…"
          aria-label="Buscar productos"
          [value]="busqueda()"
          (input)="busqueda.set($any($event.target).value)"
        />
        <cb-table [value]="productos" [columns]="columns" [globalFilter]="busqueda()" emptyMessage="Ningún producto coincide" size="sm" />
      </div>
    </doc-section>

    <doc-section
      id="column-filter"
      title="Filtro por columna"
      description="filter: true en la columna añade un campo bajo el encabezado; filterMatchMode elige entre contains, startsWith y equals."
      [code]="columnFilterCode"
      [codeTs]="columnFilterTs"
    >
      <cb-table style="width: 100%" [value]="productos" [columns]="filterColumns" size="sm" />
    </doc-section>

    <doc-section
      id="resizable"
      title="Columnas redimensionables"
      description="resizableColumns añade un separador en cada encabezado: arrástralo o enfócalo y usa las flechas (Mayús para pasos grandes)."
      [code]="resizableCode"
    >
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" resizableColumns (columnResize)="ancho.set($event.field + ': ' + $event.width + ' px')" size="sm" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">Último cambio: {{ ancho() }}</p>
    </doc-section>

    <doc-section
      id="expansion"
      title="Filas expandibles"
      description="La plantilla cbTableRowExpansion añade un botón por fila que muestra su detalle; [(expandedRowKeys)] guarda las filas abiertas (por dataKey)."
      [code]="expansionCode"
    >
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" dataKey="id" [(expandedRowKeys)]="expandidas" size="sm">
        <ng-template cbTableRowExpansion let-producto>
          <dl class="tbl-detail">
            <dt>Categoría</dt>
            <dd>{{ producto.categoria }}</dd>
            <dt>Valor en inventario</dt>
            <dd>{{ producto.precio * producto.stock }}</dd>
          </dl>
        </ng-template>
      </cb-table>
    </doc-section>

    <doc-section id="templates" title="Plantillas de celda" description="Usa cbTableCell con el nombre del field. La plantilla recibe la fila, su valor y la columna." [code]="templateCode">
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" striped>
        <ng-template cbTableCell="nombre" let-row let-value="value" let-col="col">
          <strong>{{ value }}</strong>
          <small style="display:block;color:var(--cb-color-text-muted)">{{ row.categoria }} · {{ col.header }}</small>
        </ng-template>
      </cb-table>
    </doc-section>

    <doc-section id="avatars" title="Con avatares y estados" description="Celda de usuario con cb-avatar (imagen/iniciales) + nombre y correo, y estado con cb-tag coloreado por severidad." [code]="avatarsCode">
      <cb-table style="width: 100%" [value]="usuarios" [columns]="userCols" striped>
        <ng-template cbTableCell="nombre" let-row>
          <div class="tbl-user">
            <cb-avatar [label]="row.iniciales" size="sm" [ariaLabel]="row.nombre" />
            <div>
              <div class="tbl-user-name">{{ row.nombre }}</div>
              <div class="tbl-user-mail">{{ row.email }}</div>
            </div>
          </div>
        </ng-template>
        <ng-template cbTableCell="estado" let-row>
          <cb-tag [value]="row.estado" [severity]="row.severity" />
        </ng-template>
      </cb-table>
    </doc-section>

    <doc-section id="actions" title="Con acciones (botones de icono)" description="Columna de acciones con cb-icon-button (ver / editar / eliminar) usando plantilla de celda." [code]="actionsCode">
      <cb-table style="width: 100%" [value]="usuarios" [columns]="userColsActions" striped>
        <ng-template cbTableCell="nombre" let-row>
          <div class="tbl-user">
            <cb-avatar [label]="row.iniciales" size="sm" [ariaLabel]="row.nombre" />
            <span class="tbl-user-name">{{ row.nombre }}</span>
          </div>
        </ng-template>
        <ng-template cbTableCell="estado" let-row>
          <cb-tag [value]="row.estado" [severity]="row.severity" />
        </ng-template>
        <ng-template cbTableCell="acciones" let-row>
          <div class="tbl-actions">
            <cb-icon-button icon="eye" variant="ghost" ariaLabel="Ver" />
            <cb-icon-button icon="pencil" variant="ghost" ariaLabel="Editar" />
            <cb-icon-button icon="trash" variant="ghost" ariaLabel="Eliminar" />
          </div>
        </ng-template>
      </cb-table>
    </doc-section>

    <doc-section
      id="lazy"
      title="Datos desde el servidor (lazy)"
      description="Con lazy la tabla no filtra, ordena ni pagina: emite lazyLoad con la página, el orden y los filtros, y muestra en value la página que devuelva tu API. totalRecords alimenta el paginador y loading muestra la capa de carga. Aquí, un servidor simulado con 57 movimientos."
      [code]="lazyCode"
      [codeTs]="lazyTs"
    >
      <cb-table
        style="width: 100%"
        [value]="paginaServidor()"
        [columns]="movCols"
        lazy
        [totalRecords]="totalServidor()"
        [loading]="cargando()"
        [paginator]="true"
        [rows]="5"
        size="sm"
        (lazyLoad)="cargarPagina($event)"
      />
    </doc-section>

    <doc-section
      id="frozen"
      title="Cabecera y columnas fijas"
      description="scrollHeight limita el alto y deja la cabecera fija; frozen: true ancla una columna a la izquierda al desplazarse en horizontal (las fijas se muestran primero)."
      [code]="frozenCode"
      [codeTs]="frozenTs"
    >
      <cb-table style="width: 100%" [value]="movimientos" [columns]="anchas" scrollHeight="260px" size="sm" />
    </doc-section>

    <doc-section
      id="group"
      title="Agrupación"
      description="groupRowsBy agrupa las filas por un campo y añade una cabecera por grupo con su recuento; la plantilla cbTableGroupHeader la personaliza."
      [code]="groupCode"
    >
      <cb-table style="width: 100%" [value]="primerosMovimientos" [columns]="movCols" groupRowsBy="tipo" size="sm">
        <ng-template cbTableGroupHeader let-tipo let-count="count">
          <span style="display: inline-flex; align-items: center; gap: 0.5rem">
            <cb-tag [value]="tipo" [severity]="tipo === 'Ingreso' ? 'success' : 'danger'" />
            {{ count }} movimientos
          </span>
        </ng-template>
      </cb-table>
    </doc-section>

    <doc-section
      id="export"
      title="Exportar a CSV"
      description="exportCSV() descarga las filas filtradas y ordenadas (todas, no solo la página) con BOM para que Excel respete tildes; toCSV() devuelve el texto. exportable: false excluye una columna y selectionOnly exporta solo lo seleccionado."
      [code]="exportCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div>
          <cb-button size="sm" variant="outlined" (click)="tablaCsv.exportCSV('movimientos')">
            <cb-icon name="download" [size]="15" aria-hidden="true" /> Exportar CSV
          </cb-button>
        </div>
        <cb-table #tablaCsv style="width: 100%" [value]="movimientos" [columns]="movCols" [paginator]="true" [rows]="4" size="sm" />
      </div>
    </doc-section>

    <doc-section id="pro" title="Completo (PRO) · con header/toolbar" description="Tabla con cabecera (título, contador, búsqueda y acción), avatares, estados, acciones y paginación. Composición lista para producción." [code]="proCode">
      <div class="tbl-pro">
        <div class="tbl-header">
          <div class="tbl-header-title">
            <h4>Usuarios <span class="tbl-count">{{ filtered().length }}</span></h4>
            <p>Gestiona los miembros de tu equipo</p>
          </div>
          <div class="tbl-header-actions">
            <span class="tbl-search">
              <cb-icon name="search" [size]="15" aria-hidden="true" />
              <input type="search" placeholder="Buscar usuario…" [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Buscar" />
            </span>
            <cb-button size="sm"><cb-icon name="plus" [size]="15" aria-hidden="true" /> Nuevo</cb-button>
          </div>
        </div>
        <cb-table style="width: 100%" [value]="filtered()" [columns]="userColsActions" [paginator]="true" [rows]="4" [rowsPerPageOptions]="[4, 8]" rowHover emptyMessage="Sin usuarios que coincidan">
          <ng-template cbTableCell="nombre" let-row>
            <div class="tbl-user">
              <cb-avatar [label]="row.iniciales" size="sm" [ariaLabel]="row.nombre" />
              <div>
                <div class="tbl-user-name">{{ row.nombre }}</div>
                <div class="tbl-user-mail">{{ row.email }}</div>
              </div>
            </div>
          </ng-template>
          <ng-template cbTableCell="estado" let-row>
            <cb-tag [value]="row.estado" [severity]="row.severity" />
          </ng-template>
          <ng-template cbTableCell="acciones" let-row>
            <div class="tbl-actions">
              <cb-icon-button icon="eye" variant="ghost" ariaLabel="Ver" />
              <cb-icon-button icon="pencil" variant="ghost" ariaLabel="Editar" />
              <cb-icon-button icon="trash" variant="ghost" ariaLabel="Eliminar" />
            </div>
          </ng-template>
        </cb-table>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .tbl-user {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .tbl-user-name {
        font-weight: 600;
      }
      .tbl-user-mail {
        font-size: 0.78rem;
        color: var(--cb-color-text-muted);
      }
      .tbl-actions {
        display: inline-flex;
        gap: 0.25rem;
        justify-content: flex-end;
      }
      .tbl-pro {
        width: 100%;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 14px);
        overflow: hidden;
        background: var(--cb-color-surface);
      }
      .tbl-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .tbl-header-title h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        font-size: 1.05rem;
      }
      .tbl-count {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.1rem 0.5rem;
        border-radius: 999px;
        background: var(--cb-color-primary-50, #ecfdf5);
        color: var(--cb-color-primary-700, #047857);
      }
      .tbl-header-title p {
        margin: 0.2rem 0 0;
        font-size: 0.82rem;
        color: var(--cb-color-text-muted);
      }
      .tbl-header-actions {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .tbl-search {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.4rem 0.7rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
        color: var(--cb-color-text-muted);
      }
      .tbl-search input {
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
        width: 11rem;
        max-width: 40vw;
      }
      .tbl-filter-input {
        box-sizing: border-box;
        width: 100%;
        max-width: 22rem;
        padding: 0.45rem 0.7rem;
        font: inherit;
        color: var(--cb-color-text);
        background: var(--cb-color-surface-0);
        border: 1px solid var(--cb-color-border-strong);
        border-radius: var(--cb-radius-md);
      }
      .tbl-detail {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.25rem 1rem;
        margin: 0;
        font-size: 0.875rem;
      }
      .tbl-detail dt {
        color: var(--cb-color-text-muted);
      }
      .tbl-detail dd {
        margin: 0;
        font-weight: 600;
      }
      .tbl-pro cb-table {
        display: block;
        padding: 0 0.5rem;
      }
    `,
  ],
})
export class TableDocComponent {
  protected readonly docApi = DOC_API['cb-table'];
  protected readonly a11y = DOC_A11Y['cb-table'];

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

  // --- Nivel 2: lazy, fijas, grupos y CSV ---
  protected readonly movCols: CbTableColumn[] = [
    { field: 'fecha', header: 'Fecha', sortable: true },
    { field: 'descripcion', header: 'Descripción', sortable: true, filter: true },
    { field: 'tipo', header: 'Tipo' },
    { field: 'valor', header: 'Valor', sortable: true, align: 'right' },
  ];
  protected readonly anchas: CbTableColumn[] = [
    { field: 'fecha', header: 'Fecha', frozen: true, width: '120px' },
    { field: 'descripcion', header: 'Descripción', width: '260px' },
    { field: 'tipo', header: 'Tipo', width: '140px' },
    { field: 'canal', header: 'Canal', width: '180px' },
    { field: 'referencia', header: 'Referencia', width: '200px' },
    { field: 'valor', header: 'Valor', align: 'right', width: '140px' },
  ];
  protected readonly movimientos = Array.from({ length: 57 }, (_, i) => {
    const ingreso = i % 3 === 0;
    return {
      id: i + 1,
      fecha: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`,
      descripcion: ingreso ? `Abono nómina ${i + 1}` : `Compra comercio ${i + 1}`,
      tipo: ingreso ? 'Ingreso' : 'Gasto',
      canal: ['App', 'Web', 'Oficina'][i % 3],
      referencia: `REF-${100200 + i}`,
      valor: ingreso ? 2_500_000 + i * 1000 : -(35_000 + i * 2500),
    };
  });

  protected readonly primerosMovimientos = this.movimientos.slice(0, 8);
  protected readonly paginaServidor = signal<unknown[]>([]);
  protected readonly totalServidor = signal(0);
  protected readonly cargando = signal(false);

  /** Simula una API: filtra, ordena y pagina "en el servidor" con 400 ms de latencia. */
  protected cargarPagina(e: CbTableLazyLoadEvent): void {
    this.cargando.set(true);
    setTimeout(() => {
      const texto = (e.filters['descripcion'] ?? '').toLowerCase();
      let datos = this.movimientos.filter((m) => m.descripcion.toLowerCase().includes(texto));
      if (e.sortField) {
        const campo = e.sortField as keyof (typeof datos)[number];
        datos = [...datos].sort((a, b) => (a[campo] > b[campo] ? 1 : a[campo] < b[campo] ? -1 : 0) * e.sortOrder);
      }
      this.totalServidor.set(datos.length);
      this.paginaServidor.set(datos.slice(e.first, e.first + e.rows));
      this.cargando.set(false);
    }, 400);
  }

  protected readonly lazyCode = `<cb-table
  [value]="paginaServidor()"
  [columns]="movCols"
  lazy
  [totalRecords]="totalServidor()"
  [loading]="cargando()"
  [paginator]="true"
  [rows]="5"
  (lazyLoad)="cargarPagina($event)"
/>`;
  protected readonly lazyTs = `cargarPagina(e: CbTableLazyLoadEvent): void {
  this.cargando.set(true);
  this.api.movimientos({ first: e.first, rows: e.rows, sort: e.sortField, order: e.sortOrder, filters: e.filters })
    .subscribe(({ items, total }) => {
      this.pagina.set(items);
      this.total.set(total);
      this.cargando.set(false);
    });
}`;
  protected readonly frozenCode = `<cb-table [value]="movimientos" [columns]="anchas" scrollHeight="260px" size="sm" />`;
  protected readonly frozenTs = `anchas: CbTableColumn[] = [
  { field: 'fecha', header: 'Fecha', frozen: true, width: '120px' },
  { field: 'descripcion', header: 'Descripción', width: '260px' },
  // …más columnas anchas que obligan a desplazarse en horizontal
];`;
  protected readonly groupCode = `<cb-table [value]="movimientos" [columns]="movCols" groupRowsBy="tipo" size="sm">
  <ng-template cbTableGroupHeader let-tipo let-count="count">
    <cb-tag [value]="tipo" [severity]="tipo === 'Ingreso' ? 'success' : 'danger'" />
    {{ count }} movimientos
  </ng-template>
</cb-table>`;
  protected readonly exportCode = `<cb-button size="sm" variant="outlined" (click)="tablaCsv.exportCSV('movimientos')">Exportar CSV</cb-button>
<cb-table #tablaCsv [value]="movimientos" [columns]="movCols" [paginator]="true" [rows]="4" size="sm" />`;
  protected readonly elegido = signal<Producto | null>(null);
  protected readonly busqueda = signal('');
  protected readonly ancho = signal('—');
  protected readonly expandidas = signal<readonly unknown[]>([3]);

  protected readonly filterColumns: CbTableColumn[] = [
    { field: 'nombre', header: 'Producto', filter: true, filterPlaceholder: 'Contiene…' },
    { field: 'categoria', header: 'Categoría', filter: true, filterMatchMode: 'startsWith', filterPlaceholder: 'Empieza por…' },
    { field: 'precio', header: 'Precio', align: 'right', filter: true, filterMatchMode: 'equals', filterPlaceholder: 'Igual a…' },
  ];

  // --- Usuarios (avatares / estados / acciones) ---
  protected readonly userCols: CbTableColumn[] = [
    { field: 'nombre', header: 'Usuario', sortable: true },
    { field: 'rol', header: 'Rol', sortable: true },
    { field: 'estado', header: 'Estado' },
  ];

  protected readonly userColsActions: CbTableColumn[] = [
    ...this.userCols,
    { field: 'acciones', header: 'Acciones', align: 'right', width: '140px' },
  ];

  protected readonly usuarios: Usuario[] = [
    { id: 1, nombre: 'María Álvarez', email: 'maria@ejemplo.com', iniciales: 'MA', rol: 'Admin', estado: 'Activo', severity: 'success' },
    { id: 2, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', iniciales: 'JP', rol: 'Editor', estado: 'Pendiente', severity: 'warning' },
    { id: 3, nombre: 'Lucía Gómez', email: 'lucia@ejemplo.com', iniciales: 'LG', rol: 'Viewer', estado: 'Inactivo', severity: 'secondary' },
    { id: 4, nombre: 'Carlos Ruiz', email: 'carlos@ejemplo.com', iniciales: 'CR', rol: 'Editor', estado: 'Activo', severity: 'success' },
    { id: 5, nombre: 'Ana Torres', email: 'ana@ejemplo.com', iniciales: 'AT', rol: 'Admin', estado: 'Activo', severity: 'success' },
    { id: 6, nombre: 'Diego Mora', email: 'diego@ejemplo.com', iniciales: 'DM', rol: 'Viewer', estado: 'Suspendido', severity: 'danger' },
  ];

  protected readonly query = signal('');
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q
      ? this.usuarios.filter((u) => (u.nombre + ' ' + u.email + ' ' + u.rol).toLowerCase().includes(q))
      : this.usuarios;
  });

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbTable, CbTableColumn, CbTableCellDirective, CbTableRowExpansion } from '@caribeng/ui/table';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbTag } from '@caribeng/ui/tag';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';`;
  protected readonly dataTs = `columns: CbTableColumn[] = [
  { field: 'nombre', header: 'Producto', sortable: true },
  { field: 'precio', header: 'Precio', sortable: true, align: 'right' },
];`;
  protected readonly basicCode = `<cb-table [value]="productos" [columns]="columns" striped />`;
  protected readonly pagCode = `<cb-table [value]="productos" [columns]="columns"
  [paginator]="true" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" />`;
  protected readonly selCode = `<cb-table [value]="productos" [columns]="columns"
  selectionMode="multiple" dataKey="id" [(selection)]="seleccion" />`;
  protected readonly singleCode = `<cb-table [value]="productos" [columns]="columns" selectionMode="single" dataKey="id" [(selection)]="elegido" size="sm" />
<p>Elegido: {{ elegido()?.nombre ?? 'ninguno' }}</p>`;
  protected readonly globalFilterCode = `<input
  type="search"
  class="tbl-filter-input"
  placeholder="Buscar producto o categoría…"
  aria-label="Buscar productos"
  [value]="busqueda()"
  (input)="busqueda.set($any($event.target).value)"
/>
<cb-table [value]="productos" [columns]="columns" [globalFilter]="busqueda()" emptyMessage="Ningún producto coincide" size="sm" />`;
  protected readonly columnFilterCode = `<cb-table [value]="productos" [columns]="filterColumns" size="sm" />`;
  protected readonly columnFilterTs = `filterColumns: CbTableColumn[] = [
  { field: 'nombre', header: 'Producto', filter: true, filterPlaceholder: 'Contiene…' },
  { field: 'categoria', header: 'Categoría', filter: true, filterMatchMode: 'startsWith' },
  { field: 'precio', header: 'Precio', align: 'right', filter: true, filterMatchMode: 'equals' },
];`;
  protected readonly resizableCode = `<cb-table [value]="productos" [columns]="columns" resizableColumns (columnResize)="ancho.set($event.field + ': ' + $event.width + ' px')" size="sm" />
<p>Último cambio: {{ ancho() }}</p>`;
  protected readonly expansionCode = `<cb-table [value]="productos" [columns]="columns" dataKey="id" [(expandedRowKeys)]="expandidas" size="sm">
  <ng-template cbTableRowExpansion let-producto>
    <dl class="tbl-detail">
      <dt>Categoría</dt>
      <dd>{{ producto.categoria }}</dd>
      <dt>Valor en inventario</dt>
      <dd>{{ producto.precio * producto.stock }}</dd>
    </dl>
  </ng-template>
</cb-table>`;
  protected readonly templateCode = `<cb-table [value]="productos" [columns]="columns">
  <ng-template cbTableCell="nombre" let-row let-value="value" let-col="col">
    <strong>{{ value }}</strong>
    <small>{{ row.categoria }} · {{ col.header }}</small>
  </ng-template>
</cb-table>`;

  protected readonly avatarsCode = `<cb-table [value]="usuarios" [columns]="userCols" striped>
  <ng-template cbTableCell="nombre" let-row>
    <div class="user">
      <cb-avatar [label]="row.iniciales" size="sm" [ariaLabel]="row.nombre" />
      <div>
        <div class="name">{{ row.nombre }}</div>
        <div class="mail">{{ row.email }}</div>
      </div>
    </div>
  </ng-template>
  <ng-template cbTableCell="estado" let-row>
    <cb-tag [value]="row.estado" [severity]="row.severity" />
  </ng-template>
</cb-table>`;

  protected readonly actionsCode = `<cb-table [value]="usuarios" [columns]="userColsActions" striped>
  <!-- … celdas de usuario y estado … -->
  <ng-template cbTableCell="acciones" let-row>
    <div class="actions">
      <cb-icon-button icon="eye" variant="ghost" ariaLabel="Ver" />
      <cb-icon-button icon="pencil" variant="ghost" ariaLabel="Editar" />
      <cb-icon-button icon="trash" variant="ghost" ariaLabel="Eliminar" />
    </div>
  </ng-template>
</cb-table>

// userColsActions = [...userCols, { field: 'acciones', header: 'Acciones', align: 'right' }]`;

  protected readonly proCode = `<div class="tbl-pro">
  <!-- Header / toolbar de la tabla -->
  <div class="tbl-header">
    <div>
      <h4>Usuarios <span class="count">{{ filtered().length }}</span></h4>
      <p>Gestiona los miembros de tu equipo</p>
    </div>
    <div class="actions">
      <span class="search"><cb-icon name="search" [size]="15" />
        <input placeholder="Buscar usuario…" [value]="query()" (input)="query.set($any($event.target).value)" /></span>
      <cb-button size="sm"><cb-icon name="plus" [size]="15" /> Nuevo</cb-button>
    </div>
  </div>

  <cb-table [value]="filtered()" [columns]="userColsActions"
            [paginator]="true" [rows]="4" [rowsPerPageOptions]="[4, 8]">
    <!-- celdas: usuario (avatar), estado (tag) y acciones (icon-button) -->
  </cb-table>
</div>`;
}
