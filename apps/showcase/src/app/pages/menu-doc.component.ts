import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbButton } from '@caribeng/ui/button';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-menu-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbMenu, CbButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Menús" title="Menu" lead="Menú emergente de acciones con iconos, separadores y atajos de teclado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Pulsa el botón para abrir el menú; Escape o un clic fuera lo cierra." [code]="basicCode" [codeTs]="itemsCode">
      <div style="display: flex; align-items: center; gap: 1rem">
        <cb-button (click)="menu.toggle($event)">Acciones</cb-button>
        <span style="color: var(--cb-color-text-muted); font-size: 0.875rem">{{ selected() || 'Sin selección' }}</span>
      </div>
      <cb-menu #menu [items]="items" ariaLabel="Acciones de producto" (itemSelect)="selected.set($event.label)" />
    </doc-section>

    <doc-section
      id="command"
      title="Acciones en el item"
      description="command se ejecuta al elegir el item (además de itemSelect) y visible: false lo oculta, como en el MenuItem de PrimeNG."
      [code]="commandCode"
      [codeTs]="commandItemsCode"
    >
      <div style="display: flex; align-items: center; gap: 1rem">
        <cb-button variant="outlined" (click)="pedido.toggle($event)">Pedido #1042</cb-button>
        <span style="color: var(--cb-color-text-muted); font-size: 0.875rem">{{ log() || 'Sin acciones' }}</span>
      </div>
      <cb-menu #pedido [items]="commandItems" ariaLabel="Acciones del pedido" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class MenuDocComponent {
  protected readonly a11y = DOC_A11Y['cb-menu'];
  protected readonly docApi = DOC_API['cb-menu'];

  constructor() { inject(TocService).reset(); }

  protected readonly selected = signal('');
  protected readonly items: CbMenuItem[] = [
    { label: 'Editar', icon: 'pencil' },
    { label: 'Duplicar', icon: 'copy' },
    { label: 'Archivar', icon: 'folder', disabled: true },
    { label: '', separator: true },
    { label: 'Ver detalles', icon: 'external-link', url: '#details' },
  ];

  protected readonly log = signal('');
  protected readonly esAdmin = false;
  protected readonly commandItems: CbMenuItem[] = [
    { label: 'Aprobar', icon: 'check', command: () => this.log.set('Pedido aprobado') },
    { label: 'Reembolsar', icon: 'undo', visible: this.esAdmin, command: () => this.log.set('Reembolso enviado') },
    { label: '', separator: true },
    { label: 'Cancelar', icon: 'x', command: ({ item }) => this.log.set(`Elegiste "${item.label}"`) },
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
  protected readonly commandCode = `<cb-button variant="outlined" (click)="pedido.toggle($event)">Pedido #1042</cb-button>
<cb-menu #pedido [items]="commandItems" ariaLabel="Acciones del pedido" />`;
  protected readonly commandItemsCode = `commandItems: CbMenuItem[] = [
  { label: 'Aprobar', icon: 'check', command: () => this.aprobar() },
  { label: 'Reembolsar', icon: 'undo', visible: this.esAdmin, command: () => this.reembolsar() },
  { label: '', separator: true },
  // command recibe { item, originalEvent }
  { label: 'Cancelar', icon: 'x', command: ({ item }) => this.cancelar(item) },
];`;
}
