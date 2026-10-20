import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTreeSelect, CbTreeSelectNode } from '@caribeng/ui/treeselect';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-treeselect-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbTreeSelect, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="TreeSelect" lead="Selector desplegable con estructura jerárquica de árbol." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Selector desplegable con árbol de nodos; el valor se enlaza con [(value)]." [code]="basicCode">
      <div style="width: 280px">
        <cb-tree-select [nodes]="nodes" [(value)]="selected" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class TreeselectDocComponent {
  protected readonly docApi = DOC_API['cb-tree-select'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly selected = signal<string | null>(null);
  protected readonly nodes: CbTreeSelectNode[] = [
    {
      key: 'docs',
      label: 'Documentación',
      icon: 'folder',
      children: [
        { key: 'spec', label: 'SPEC.md', icon: 'file-text' },
        { key: 'progreso', label: 'PROGRESO.md', icon: 'file-text' },
      ],
    },
  ];
  protected readonly importCode = `import { CbTreeSelect } from '@caribeng/ui/treeselect';`;
  protected readonly basicCode = `<cb-tree-select [nodes]="nodes" [(value)]="selected" />`;
}
