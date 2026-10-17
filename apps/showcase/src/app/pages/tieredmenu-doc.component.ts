import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbTieredMenuComponent, type CbTieredMenuItem } from '@caribeng/ui/tieredmenu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-tieredmenu-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CbTieredMenuComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menu" title="TieredMenu" lead="Menú emergente con submenús en cascada." />
  <doc-section id="import" title="Import"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Basic" description="Abre el menú y pasa sobre una categoría para ver las opciones anidadas." [code]="basicCode">
    <cb-tieredmenu [items]="items" triggerLabel="Archivo" (itemSelect)="selected.set($event.label)" />
    <span style="margin-left:.75rem;color:var(--cb-color-text-muted)">{{ selected() || 'sin acción' }}</span>
  </doc-section>
` })
export class TieredmenuDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly selected = signal('');
  protected readonly items: CbTieredMenuItem[] = [
    { label: 'Nuevo', icon: 'file', items: [{ label: 'Proyecto', items: [{ label: 'Angular' }, { label: 'Biblioteca' }] }, { label: 'Archivo' }] },
    { label: 'Abrir', icon: 'folder' },
    { label: 'Guardar', icon: 'save' },
  ];
  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbTieredMenuComponent } from '@caribeng/ui/tieredmenu';`;
  protected readonly basicCode = `<cb-tieredmenu [items]="items" triggerLabel="Archivo" />`;
}
