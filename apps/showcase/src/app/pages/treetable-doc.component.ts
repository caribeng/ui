import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbTag } from '@caribeng/ui/tag';
import { CbTreeTable, CbTreeTableCellTemplate, type CbTreeTableColumn, type CbTreeTableNode } from '@caribeng/ui/treetable';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-treetable-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbTreeTable,
    CbTreeTableCellTemplate,
    CbTag,
    CbButton,
    DocPlaygroundComponent,
    DocA11yComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="TreeTable"
      lead="Tabla jerárquica: filas con hijos expandibles en niveles ilimitados, con sangría y navegación con teclado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="columns define las columnas (la primera muestra la jerarquía) y value los nodos, cada uno con data y, opcionalmente, children."
      [code]="basicCode"
    >
      <div style="width: 100%">
        <cb-treetable [value]="files" [columns]="columns" ariaLabel="Archivos del proyecto" />
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla de celda"
      description="ng-template cbTreeTableCell=&quot;campo&quot; personaliza las celdas de una columna; recibe el valor, el nodo y su nivel."
      [code]="templateCode"
    >
      <div style="width: 100%">
        <cb-treetable [value]="files" [columns]="columns" ariaLabel="Archivos del proyecto">
          <ng-template cbTreeTableCell="type" let-type>
            <cb-tag [value]="type" [severity]="type === 'Carpeta' ? 'info' : 'secondary'" />
          </ng-template>
        </cb-treetable>
      </div>
    </doc-section>

    <doc-section
      id="balances"
      title="Saldos por cuenta (rollup)"
      description="Con rollup, las filas padre muestran en las columnas con summary el total de sus descendientes: el saldo de cada cuenta mayor sale de sus auxiliares. type: 'currency' formatea los importes, los negativos van en rojo y el pie suma todas las hojas. expandAll() y collapseAll() abren y cierran todo."
      [code]="balancesCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem">
          <cb-button size="sm" variant="outlined" (click)="puc.expandAll()">Expandir todo</cb-button>
          <cb-button size="sm" variant="text" (click)="puc.collapseAll()">Contraer todo</cb-button>
        </div>
        <cb-treetable #puc [value]="cuentas" [columns]="cuentaCols" rollup ariaLabel="Balance de prueba" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class TreetableDocComponent {
  protected readonly docApi = DOC_API['cb-treetable'];
  protected readonly a11y = DOC_A11Y['cb-treetable'];

  protected readonly columns: CbTreeTableColumn[] = [
    { field: 'name', header: 'Nombre' },
    { field: 'size', header: 'Tamaño' },
    { field: 'type', header: 'Tipo' },
  ];

  protected readonly files: CbTreeTableNode[] = [
    {
      key: 'src',
      data: { name: 'src', size: '240 KB', type: 'Carpeta' },
      children: [
        {
          key: 'app',
          data: { name: 'app', size: '180 KB', type: 'Carpeta' },
          children: [
            { key: 'main', data: { name: 'main.ts', size: '2 KB', type: 'TypeScript' } },
            { key: 'routes', data: { name: 'app.routes.ts', size: '6 KB', type: 'TypeScript' } },
          ],
        },
        { key: 'styles', data: { name: 'styles.css', size: '12 KB', type: 'CSS' } },
      ],
    },
    { key: 'readme', data: { name: 'README.md', size: '4 KB', type: 'Markdown' } },
  ];

  protected readonly cuentaCols: CbTreeTableColumn[] = [
    { field: 'cuenta', header: 'Cuenta' },
    { field: 'anterior', header: 'Saldo anterior', type: 'currency', summary: 'sum' },
    { field: 'debito', header: 'Débitos', type: 'currency', summary: 'sum' },
    { field: 'credito', header: 'Créditos', type: 'currency', summary: 'sum' },
    { field: 'saldo', header: 'Nuevo saldo', type: 'currency', summary: 'sum', negative: 'parens' },
  ];

  protected readonly cuentas: CbTreeTableNode[] = [
    {
      key: '1',
      data: { cuenta: '1 Activo' },
      children: [
        {
          key: '11',
          data: { cuenta: '11 Disponible' },
          children: [
            { key: '1105', data: { cuenta: '1105 Caja', anterior: 1200000, debito: 2450000, credito: 2000000, saldo: 1650000 } },
            { key: '1110', data: { cuenta: '1110 Bancos', anterior: 18500000, debito: 2000000, credito: 1268900, saldo: 19231100 } },
          ],
        },
        { key: '13', data: { cuenta: '13 Deudores' }, children: [{ key: '1305', data: { cuenta: '1305 Clientes', anterior: 7300000, debito: 4100000, credito: 3900000, saldo: 7500000 } }] },
      ],
    },
    {
      key: '2',
      data: { cuenta: '2 Pasivo' },
      children: [
        { key: '2205', data: { cuenta: '2205 Proveedores', anterior: -9400000, debito: 1250000, credito: 3100000, saldo: -11250000 } },
        { key: '2408', data: { cuenta: '2408 IVA por pagar', anterior: -2100000, debito: 0, credito: 780000, saldo: -2880000 } },
      ],
    },
  ];

  protected readonly balancesCode = `<div style="display: flex; gap: 0.5rem">
  <cb-button size="sm" variant="outlined" (click)="puc.expandAll()">Expandir todo</cb-button>
  <cb-button size="sm" variant="text" (click)="puc.collapseAll()">Contraer todo</cb-button>
</div>
<cb-treetable #puc [value]="cuentas" [columns]="cuentaCols" rollup ariaLabel="Balance de prueba" />`;

  protected readonly importCode = `import { CbTreeTable, CbTreeTableCellTemplate } from '@caribeng/ui/treetable';`;

  protected readonly basicCode = `<cb-treetable [value]="files" [columns]="columns" ariaLabel="Archivos del proyecto" />`;

  protected readonly templateCode = `<cb-treetable [value]="files" [columns]="columns" ariaLabel="Archivos del proyecto">
  <ng-template cbTreeTableCell="type" let-type>
    <cb-tag [value]="type" [severity]="type === 'Carpeta' ? 'info' : 'secondary'" />
  </ng-template>
</cb-treetable>`;

  constructor() {
    inject(TocService).reset();
  }
}
