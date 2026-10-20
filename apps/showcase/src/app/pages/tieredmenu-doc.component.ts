import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTieredMenu, type CbTieredMenuItem } from '@caribeng/ui/tieredmenu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-tieredmenu-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [DocPlaygroundComponent, CbTieredMenu, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menús" title="TieredMenu" lead="Menú emergente con submenús en cascada." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Básico" description="Abre el menú y pasa sobre una categoría para ver las opciones anidadas." [code]="basicCode">
    <cb-tieredmenu [items]="items" triggerLabel="Archivo" (itemSelect)="selected.set($event.label)" />
    <span style="margin-left:.75rem;color:var(--cb-color-text-muted)">{{ selected() || 'sin acción' }}</span>
  </doc-section>

  <doc-playground [api]="docApi" />
` })
export class TieredmenuDocComponent {
  protected readonly docApi = DOC_API['cb-tieredmenu'];

  constructor() { inject(TocService).reset(); }
  protected readonly selected = signal('');
  protected readonly items: CbTieredMenuItem[] = [
    { label: 'Nuevo', icon: 'file', items: [{ label: 'Proyecto', items: [{ label: 'Angular' }, { label: 'Biblioteca' }] }, { label: 'Archivo' }] },
    { label: 'Abrir', icon: 'folder' },
    { label: 'Guardar', icon: 'save' },
  ];
  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbTieredMenu } from '@caribeng/ui/tieredmenu';`;
  protected readonly basicCode = `<cb-tieredmenu [items]="items" triggerLabel="Archivo" />`;
}
