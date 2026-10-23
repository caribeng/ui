import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbBreadcrumb, type CbBreadcrumbItem } from '@caribeng/ui/breadcrumb';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-breadcrumb-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbBreadcrumb, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Menús" title="Breadcrumb" lead="Rastro de navegación jerárquica. El último elemento es la página actual." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Se alimenta con un arreglo items; cada elemento puede tener label y url." [code]="basicCode" [codeTs]="basicTs">
      <cb-breadcrumb [items]="items" />
    </doc-section>

    <doc-section id="icons" title="Con iconos" description="Añade icon a cualquier elemento para mostrar un icono junto a su texto." [code]="iconsCode">
      <cb-breadcrumb [items]="withIcons" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class BreadcrumbDocComponent {
  protected readonly a11y = DOC_A11Y['cb-breadcrumb'];
  protected readonly docApi = DOC_API['cb-breadcrumb'];

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
  protected readonly importCode = `import { CbBreadcrumb } from '@caribeng/ui/breadcrumb';`;
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
