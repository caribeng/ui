import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDock, type CbDockItem } from '@caribeng/ui/dock';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-dock-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [DocPlaygroundComponent, CbDock, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menu" title="Dock" lead="Lanzador compacto de acciones con orientación configurable." />
  <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Basic" description="La orientación también puede ser top, left o right." [code]="basicCode">
    <cb-dock style="width:100%" [items]="items" position="bottom" (itemSelect)="selected.set($event.label)" />
    <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Acción: {{ selected() || 'ninguna' }}</p>
  </doc-section>
` })
export class DockDocComponent {
  protected readonly docApi = DOC_API['cb-dock'];

  constructor() { inject(TocService).reset(); }
  protected readonly selected = signal('');
  protected readonly items: CbDockItem[] = [{ label: 'Inicio', icon: 'house' }, { label: 'Buscar', icon: 'search' }, { label: 'Ajustes', icon: 'settings' }, { label: 'Ayuda', icon: 'external-link' }];
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbDock } from '@caribeng/ui/dock';`;
  protected readonly basicCode = `<cb-dock [items]="items" position="bottom" />`;
}
