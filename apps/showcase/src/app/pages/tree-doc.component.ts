import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbTree, CbTreeNodeTemplate, type CbTreeNode } from '@caribeng/ui/tree';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-tree-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbTree,
    CbTreeNodeTemplate,
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
      title="Tree"
      lead="Estructura jerárquica con niveles ilimitados, selección y navegación completa con teclado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="value recibe los nodos raíz; cada nodo puede tener children con más niveles. El nodo elegido se enlaza con [(selection)]."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-tree [value]="files" [(selection)]="selected" ariaLabel="Archivos" />
        <p style="margin: 0.75rem 0 0; font-size: 0.875rem">Seleccionado: {{ selected()?.label ?? '—' }}</p>
      </div>
    </doc-section>

    <doc-section
      id="icons"
      title="Iconos y nodos deshabilitados"
      description="icon muestra un icono junto al nodo y disabled impide seleccionarlo (sí se puede expandir)."
      [code]="iconsCode"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-tree [value]="withIcons" ariaLabel="Proyecto" />
      </div>
    </doc-section>

    <doc-section
      id="expand-all"
      title="Expandir y contraer todo"
      description="expandAll() y collapseAll() se llaman a través de una referencia de plantilla."
      [code]="expandCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 360px">
        <div style="display: flex; gap: 0.5rem">
          <cb-button size="sm" variant="outlined" (click)="tree.expandAll()">Expandir todo</cb-button>
          <cb-button size="sm" variant="text" (click)="tree.collapseAll()">Contraer todo</cb-button>
        </div>
        <cb-tree #tree [value]="files" ariaLabel="Archivos" />
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla de nodo"
      description="Con ng-template cbTreeNode personalizas el contenido de cada nodo; recibe el nodo, su nivel y si está expandido o seleccionado."
      [code]="templateCode"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-tree [value]="files" ariaLabel="Archivos">
          <ng-template cbTreeNode let-node let-level="level">
            <span style="display: flex; justify-content: space-between; gap: 1rem">
              {{ node.label }}
              @if (node.children?.length) {
                <small style="opacity: 0.7">{{ node.children.length }} elementos</small>
              }
            </span>
          </ng-template>
        </cb-tree>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class TreeDocComponent {
  protected readonly docApi = DOC_API['cb-tree'];
  protected readonly a11y = DOC_A11Y['cb-tree'];

  protected readonly selected = signal<CbTreeNode | null>(null);

  protected readonly files: CbTreeNode[] = [
    {
      key: 'docs',
      label: 'Documentos',
      children: [
        {
          key: 'work',
          label: 'Trabajo',
          children: [
            { key: 'cv', label: 'Hoja de vida.pdf' },
            { key: 'report', label: 'Informe anual.docx' },
          ],
        },
        { key: 'home', label: 'Casa', children: [{ key: 'bills', label: 'Facturas.xlsx' }] },
      ],
    },
    { key: 'pics', label: 'Imágenes', children: [{ key: 'trip', label: 'Viaje.jpg' }] },
    { key: 'notes', label: 'Notas.txt' },
  ];

  protected readonly withIcons: CbTreeNode[] = [
    {
      key: 'src',
      label: 'src',
      icon: 'folder',
      children: [
        { key: 'app', label: 'app.component.ts', icon: 'file' },
        { key: 'env', label: '.env (protegido)', icon: 'lock', disabled: true },
      ],
    },
    { key: 'pkg', label: 'package.json', icon: 'file' },
  ];

  protected readonly importCode = `import { CbTree, CbTreeNodeTemplate, type CbTreeNode } from '@caribeng/ui/tree';`;

  protected readonly basicCode = `<cb-tree [value]="files" [(selection)]="selected" ariaLabel="Archivos" />`;

  protected readonly iconsCode = `<cb-tree [value]="withIcons" ariaLabel="Proyecto" />`;

  protected readonly expandCode = `<cb-button size="sm" variant="outlined" (click)="tree.expandAll()">Expandir todo</cb-button>
<cb-button size="sm" variant="text" (click)="tree.collapseAll()">Contraer todo</cb-button>
<cb-tree #tree [value]="files" ariaLabel="Archivos" />`;

  protected readonly templateCode = `<cb-tree [value]="files" ariaLabel="Archivos">
  <ng-template cbTreeNode let-node let-level="level">
    {{ node.label }}
    @if (node.children?.length) {
      <small>{{ node.children.length }} elementos</small>
    }
  </ng-template>
</cb-tree>`;

  constructor() {
    inject(TocService).reset();
  }
}
