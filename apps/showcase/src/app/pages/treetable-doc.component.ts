import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
