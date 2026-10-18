import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-menu-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbMenu, CbButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Menu" title="Menu" lead="Menú emergente de acciones con iconos, separadores y atajos de teclado." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="Pulsa el botón para abrir el menú; Escape o un clic fuera lo cierra." [code]="basicCode" [codeTs]="itemsCode">
      <div style="display: flex; align-items: center; gap: 1rem">
        <cb-button (click)="menu.toggle($event)">Acciones</cb-button>
        <span style="color: var(--cb-color-text-muted); font-size: 0.875rem">{{ selected() || 'Sin selección' }}</span>
      </div>
      <cb-menu #menu [items]="items" ariaLabel="Acciones de producto" (itemSelect)="selected.set($event.label)" />
    </doc-section>
  `,
})
export class MenuDocComponent {
  constructor() { inject(TocService).reset(); }

  protected readonly selected = signal('');
  protected readonly items: CbMenuItem[] = [
    { label: 'Editar', icon: 'pencil' },
    { label: 'Duplicar', icon: 'copy' },
    { label: 'Archivar', icon: 'folder', disabled: true },
    { label: '', separator: true },
    { label: 'Ver detalles', icon: 'external-link', url: '#details' },
  ];

  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbMenu, CbMenuItem } from '@caribeng/ui/menu';`;
  protected readonly basicCode = `<cb-button label="Acciones" (click)="menu.toggle($event)" />
<cb-menu #menu [items]="items" (itemSelect)="onSelect($event)" />`;
  protected readonly itemsCode = `items: CbMenuItem[] = [
  { label: 'Editar', icon: 'pencil' },
  { label: 'Archivar', icon: 'folder', disabled: true },
  { label: '', separator: true },
  { label: 'Ver detalles', url: '/details' },
];`;
}
