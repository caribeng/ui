import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbBreadcrumbComponent, type CbBreadcrumbItem } from '@caribeng/ui/breadcrumb';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-breadcrumb-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbBreadcrumbComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Menu" title="Breadcrumb" lead="Rastro de navegación jerárquica. El último elemento es la página actual." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" [code]="basicCode" [codeTs]="basicTs">
      <cb-breadcrumb [items]="items" />
    </doc-section>

    <doc-section id="icons" title="Con iconos" [code]="iconsCode">
      <cb-breadcrumb [items]="withIcons" />
    </doc-section>
  `,
})
export class BreadcrumbDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly items: CbBreadcrumbItem[] = [
    { label: 'Inicio', url: '#' },
    { label: 'Productos', url: '#' },
    { label: 'Audio', url: '#' },
    { label: 'Auriculares' },
  ];

  protected readonly withIcons: CbBreadcrumbItem[] = [
    { label: 'Inicio', url: '#', icon: 'house' },
    { label: 'Ajustes', url: '#', icon: 'settings' },
    { label: 'Perfil', icon: 'user' },
  ];

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbBreadcrumbComponent } from '@caribeng/ui/breadcrumb';`;
  protected readonly basicCode = `<cb-breadcrumb [items]="items" />`;
  protected readonly basicTs = `items = [
  { label: 'Inicio', url: '/' },
  { label: 'Productos', url: '/productos' },
  { label: 'Auriculares' },
];`;
  protected readonly iconsCode = `<cb-breadcrumb [items]="[
  { label: 'Inicio', url: '/', icon: 'house' },
  { label: 'Perfil', icon: 'user' }
]" />`;
}
