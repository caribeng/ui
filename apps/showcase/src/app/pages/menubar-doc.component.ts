import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbMenubar, type CbMenubarItem } from '@caribeng/ui/menubar';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-menubar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbMenubar, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Menús" title="Menubar" lead="Barra horizontal de navegación con submenús y soporte de teclado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Usa las flechas para recorrer la barra y abrir un submenú." [code]="basicCode" [codeTs]="itemsCode">
      <cb-menubar [items]="items" ariaLabel="Navegación de la tienda" (itemSelect)="selected.set($event.label)" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">Selección: {{ selected() || 'ninguna' }}</p>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class MenubarDocComponent {
  protected readonly a11y = DOC_A11Y['cb-menubar'];
  protected readonly docApi = DOC_API['cb-menubar'];

  constructor() { inject(TocService).reset(); }

  protected readonly selected = signal('');
  protected readonly items: CbMenubarItem[] = [
    { label: 'Inicio', url: '#inicio', icon: 'house' },
    { label: 'Productos', icon: 'store', items: [
      { label: 'Todos los productos', url: '#productos' },
      { label: 'Novedades', url: '#novedades' },
      { label: 'Añadir producto' },
    ] },
    { label: 'Ayuda', url: '#ayuda' },
  ];

  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbMenubar, CbMenubarItem } from '@caribeng/ui/menubar';`;
  protected readonly basicCode = `<cb-menubar [items]="items" ariaLabel="Navegación principal" />`;
  protected readonly itemsCode = `items: CbMenubarItem[] = [
  { label: 'Inicio', url: '/' },
  { label: 'Productos', items: [
    { label: 'Todos', url: '/products' },
    { label: 'Añadir producto' },
  ] },
];`;
}
