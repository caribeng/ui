import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbTableCellDirective, CbTable, type CbTableColumn } from '@caribeng/ui/table';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbTag } from '@caribeng/ui/tag';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';
import type { CbSeverity } from '@caribeng/ui';
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
    CbAvatar,
    CbTag,
    CbButton,
    CbIcon,
    CbIconButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Data" title="Table" lead="Tabla de datos con columnas declarativas, ordenación, paginación, selección y celdas personalizadas (avatares, estados y acciones)." />

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
      <cb-table style="width: 100%" [value]="productos" [columns]="columns" selectionMode="multiple" dataKey="id" [(selection)]="seleccion" striped />
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
      .tbl-pro cb-table {
        display: block;
        padding: 0 0.5rem;
      }
    `,
  ],
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

  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbTable, CbTableColumn, CbTableCellDirective } from '@caribeng/ui/table';
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
