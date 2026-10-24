import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbDataGrid, type CbDataGridCellChange, type CbDataGridColumn } from '@caribeng/ui/datagrid';
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
  nombre: string | null;
  sku: string | null;
  categoria: string | null;
  precio: number | null;
  stock: number | null;
  alta: string | null;
  activo: boolean;
}

interface Contacto {
  id: number;
  nombre: string | null;
  email: string | null;
  edad: number | null;
}

interface LineaComprobante {
  id: number;
  cuenta: string | null;
  tercero: string | null;
  debito: number | null;
  credito: number | null;
}

interface Linea {
  id: number;
  articulo: string;
  cantidad: number;
  precio: number;
}

let nextId = 100;
const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

@Component({
  selector: 'doc-datagrid-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDataGrid, CbButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="Data Grid"
      lead="Tabla editable como una hoja de cálculo: celdas con tipo (texto, número, lista, fecha y casilla), validación por columna, selección de rangos, copiar y pegar con Excel o Google Sheets, deshacer y rehacer, y alta y baja de filas. Todo funciona con el teclado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="inventory"
      title="Inventario editable"
      description="Haz clic en una celda y escribe para reemplazarla, o pulsa Enter, F2 o doble clic para editarla; Enter confirma y baja, Tab confirma y pasa a la derecha y Escape cancela. Mayús + flechas (o arrastrar) selecciona un rango: Supr lo borra, Ctrl + D rellena hacia abajo y Ctrl + C / Ctrl + V lo copia y pega, también desde Excel. Las celdas cambiadas llevan una marca azul y getChanges() devuelve las filas añadidas, modificadas y eliminadas."
      [code]="inventoryCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <cb-data-grid #grid [(rows)]="productos" [columns]="columnas" [newRow]="nuevoProducto" ariaLabel="Inventario" (cellChange)="onCellChange($event)" />
        <div class="dg-actions">
          <cb-button (click)="guardar()">Guardar cambios</cb-button>
          <span class="dg-log">{{ ultimo() }}</span>
        </div>
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación"
      description="required, min y max validan cada celda, y validate añade reglas propias (aquí, el formato del correo). Las celdas con error tienen una marca roja, su mensaje en el título y aria-invalid; la barra cuenta los errores y su botón lleva al primero. Un número o una fecha que no se entienden no se confirman al editar; al pegar, se pegan y quedan marcados."
      [code]="validationCode"
    >
      <cb-data-grid [(rows)]="contactos" [columns]="columnasContacto" ariaLabel="Contactos" scrollHeight="16rem" />
    </doc-section>

    <doc-section
      id="computed"
      title="Formato propio y columnas de solo lectura"
      description="format cambia el texto de la celda sin cambiar su valor; con editable: false y sortable: false, la columna Total se calcula a partir de la fila. Sin barra ([toolbar]=&quot;false&quot;) ni números de fila ([rowNumbers]=&quot;false&quot;), el grid queda compacto; Deshacer y Rehacer siguen con Ctrl + Z / Ctrl + Y."
      [code]="computedCode"
    >
      <cb-data-grid [(rows)]="lineas" [columns]="columnasPedido" [toolbar]="false" [rowNumbers]="false" ariaLabel="Pedido" />
    </doc-section>

    <doc-section
      id="voucher"
      title="Comprobante con totales"
      description="currency: true escribe los importes con la moneda del grid o de provideCaribeNG({ currency, numberLocale }); summary suma la columna en el pie, que queda fijo abajo y se recalcula con cada edición o pegado. Con los totales se comprueba que el comprobante cuadra: aquí falta un crédito."
      [code]="voucherCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-data-grid [(rows)]="lineasComprobante" [columns]="columnasComprobante" ariaLabel="Comprobante de egreso" scrollHeight="18rem" />
        <p class="dg-log" [style.color]="diferencia() === 0 ? null : 'var(--cb-color-danger-text)'" role="status">{{ diferencia() === 0 ? 'El comprobante cuadra.' : 'Diferencia: ' + moneda.format(diferencia()) }}</p>
      </div>
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura"
      description="Con [editable]=&quot;false&quot; se sigue navegando, seleccionando rangos, ordenando y copiando, pero nada cambia: útil para revisar datos antes de aprobarlos."
      [code]="readonlyCode"
    >
      <cb-data-grid [rows]="productos()" [columns]="columnas" [editable]="false" [toolbar]="false" ariaLabel="Inventario (solo lectura)" scrollHeight="16rem" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .dg-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }
      .dg-log {
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class DatagridDocComponent {
  protected readonly docApi = DOC_API['cb-data-grid'];
  protected readonly a11y = DOC_A11Y['cb-data-grid'];
  private readonly grid = viewChild.required<CbDataGrid<Producto>>('grid');

  protected readonly ultimo = signal('');
  protected readonly moneda = formatoMoneda;

  protected readonly columnas: CbDataGridColumn<Producto>[] = [
    { field: 'nombre', header: 'Producto', width: '12rem', required: true },
    { field: 'sku', header: 'SKU', width: '7rem', validate: (v) => (/^[A-Z]{3}-\d{3}$/.test(String(v)) ? null : 'Formato AAA-000.') },
    {
      field: 'categoria',
      header: 'Categoría',
      type: 'select',
      options: [
        { label: 'Hogar', value: 'hogar' },
        { label: 'Oficina', value: 'oficina' },
        { label: 'Tecnología', value: 'tecnologia' },
        { label: 'Jardín', value: 'jardin' },
      ],
    },
    { field: 'precio', header: 'Precio', type: 'number', min: 0, decimals: 2, required: true },
    { field: 'stock', header: 'Stock', type: 'number', min: 0, width: '6rem' },
    { field: 'alta', header: 'Alta', type: 'date' },
    { field: 'activo', header: 'Activo', type: 'checkbox' },
  ];

  protected readonly productos = signal<readonly Producto[]>([
    { id: 1, nombre: 'Silla ergonómica', sku: 'OFI-101', categoria: 'oficina', precio: 189.9, stock: 24, alta: '2026-01-15', activo: true },
    { id: 2, nombre: 'Lámpara de pie', sku: 'HOG-204', categoria: 'hogar', precio: 64.5, stock: 8, alta: '2026-02-03', activo: true },
    { id: 3, nombre: 'Monitor 27"', sku: 'TEC-310', categoria: 'tecnologia', precio: 329, stock: 12, alta: '2026-03-20', activo: true },
    { id: 4, nombre: 'Escritorio elevable', sku: 'OFI-118', categoria: 'oficina', precio: 459, stock: 3, alta: '2026-04-11', activo: false },
    { id: 5, nombre: 'Maceta de cerámica', sku: 'JAR-402', categoria: 'jardin', precio: 18.75, stock: 60, alta: '2026-05-02', activo: true },
    { id: 6, nombre: 'Teclado mecánico', sku: 'TEC-322', categoria: 'tecnologia', precio: 99, stock: 0, alta: '2026-06-18', activo: false },
    { id: 7, nombre: 'Estantería', sku: 'HOG-219', categoria: 'hogar', precio: 120, stock: 5, alta: '2026-07-07', activo: true },
    { id: 8, nombre: 'Auriculares', sku: 'TEC-335', categoria: 'tecnologia', precio: 149.99, stock: 17, alta: '2026-08-25', activo: true },
  ]);

  protected readonly nuevoProducto = (): Producto => ({ id: ++nextId, nombre: null, sku: null, categoria: null, precio: null, stock: 0, alta: null, activo: true });

  protected onCellChange(change: CbDataGridCellChange<Producto>): void {
    this.ultimo.set(`«${change.row.nombre ?? 'Fila nueva'}» · ${change.field}: ${String(change.previous ?? '—')} → ${String(change.value ?? '—')}`);
  }

  protected guardar(): void {
    const grid = this.grid();
    if (!grid.isValid()) {
      this.ultimo.set(`Corrige los errores antes de guardar (${grid.errors().length}).`);
      return;
    }
    const { added, updated, removed } = grid.getChanges();
    this.ultimo.set(`Guardado: ${added.length} nuevas, ${updated.length} modificadas y ${removed.length} eliminadas.`);
    grid.markClean();
  }

  protected readonly columnasContacto: CbDataGridColumn<Contacto>[] = [
    { field: 'nombre', header: 'Nombre', width: '12rem', required: true },
    { field: 'email', header: 'Correo', width: '16rem', required: true, validate: (v) => (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(v)) ? null : 'Correo no válido.') },
    { field: 'edad', header: 'Edad', type: 'number', min: 18, max: 99 },
  ];

  protected readonly contactos = signal<readonly Contacto[]>([
    { id: 1, nombre: 'Ana Ruiz', email: 'ana@caribe.co', edad: 34 },
    { id: 2, nombre: 'Leo Mora', email: 'leo.mora', edad: 41 },
    { id: 3, nombre: null, email: 'sin.nombre@caribe.co', edad: 16 },
    { id: 4, nombre: 'Marta Gil', email: 'marta@caribe.co', edad: 120 },
  ]);

  protected readonly columnasPedido: CbDataGridColumn<Linea>[] = [
    { field: 'articulo', header: 'Artículo', width: '14rem', required: true },
    { field: 'cantidad', header: 'Cantidad', type: 'number', min: 1, width: '7rem' },
    { field: 'precio', header: 'Precio', type: 'number', min: 0, format: (v) => formatoMoneda.format(Number(v)) },
    { field: 'total', header: 'Total', editable: false, sortable: false, align: 'end', format: (_, l) => formatoMoneda.format(l.cantidad * l.precio) },
  ];

  protected readonly lineas = signal<readonly Linea[]>([
    { id: 1, articulo: 'Café de origen 500 g', cantidad: 3, precio: 32000 },
    { id: 2, articulo: 'Panela orgánica', cantidad: 10, precio: 4500 },
    { id: 3, articulo: 'Cacao en polvo', cantidad: 2, precio: 18500 },
  ]);

  protected readonly columnasComprobante: CbDataGridColumn<LineaComprobante>[] = [
    { field: 'cuenta', header: 'Cuenta', width: '13rem', required: true },
    { field: 'tercero', header: 'Tercero', width: '11rem' },
    { field: 'debito', header: 'Débito', type: 'number', min: 0, currency: true, summary: 'sum', width: '10rem' },
    { field: 'credito', header: 'Crédito', type: 'number', min: 0, currency: true, summary: 'sum', width: '10rem' },
  ];

  protected readonly lineasComprobante = signal<readonly LineaComprobante[]>([
    { id: 1, cuenta: '5135 Servicios', tercero: 'Energía del Caribe', debito: 845000, credito: null },
    { id: 2, cuenta: '2408 IVA descontable', tercero: 'Energía del Caribe', debito: 160550, credito: null },
    { id: 3, cuenta: '2365 Retención en la fuente', tercero: 'DIAN', debito: null, credito: 33800 },
    { id: 4, cuenta: '1110 Bancos', tercero: 'Banco de Bogotá', debito: null, credito: 900000 },
  ]);

  protected readonly diferencia = computed(() => {
    const suma = (campo: 'debito' | 'credito') => this.lineasComprobante().reduce((t, l) => t + (l[campo] ?? 0), 0);
    return Math.round((suma('debito') - suma('credito')) * 100) / 100;
  });

  protected readonly voucherCode = `<div style="display: grid; gap: 0.5rem; width: 100%">
  <cb-data-grid [(rows)]="lineasComprobante" [columns]="columnasComprobante" ariaLabel="Comprobante de egreso" scrollHeight="18rem" />
  <p class="dg-log" [style.color]="diferencia() === 0 ? null : 'var(--cb-color-danger-text)'" role="status">{{ diferencia() === 0 ? 'El comprobante cuadra.' : 'Diferencia: ' + moneda.format(diferencia()) }}</p>
</div>`;

  protected readonly importCode = `import { CbDataGrid, type CbDataGridColumn } from '@caribeng/ui/datagrid';`;
  protected readonly inventoryCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <cb-data-grid #grid [(rows)]="productos" [columns]="columnas" [newRow]="nuevoProducto" ariaLabel="Inventario" (cellChange)="onCellChange($event)" />
  <div class="dg-actions">
    <cb-button (click)="guardar()">Guardar cambios</cb-button>
    <span class="dg-log">{{ ultimo() }}</span>
  </div>
</div>`;
  protected readonly validationCode = `<cb-data-grid [(rows)]="contactos" [columns]="columnasContacto" ariaLabel="Contactos" scrollHeight="16rem" />`;
  protected readonly computedCode = `<cb-data-grid [(rows)]="lineas" [columns]="columnasPedido" [toolbar]="false" [rowNumbers]="false" ariaLabel="Pedido" />`;
  protected readonly readonlyCode = `<cb-data-grid [rows]="productos()" [columns]="columnas" [editable]="false" [toolbar]="false" ariaLabel="Inventario (solo lectura)" scrollHeight="16rem" />`;

  constructor() {
    inject(TocService).reset();
  }
}
