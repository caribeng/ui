import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbContextMenu, type CbContextMenuItem } from '@caribeng/ui/contextmenu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-contextmenu-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [DocPlaygroundComponent, CbContextMenu, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menús" title="ContextMenu" lead="Menú de acciones situado en el punto donde se hace clic derecho." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Básico" description="Haz clic derecho dentro de la superficie; Escape o un clic fuera cierra el menú." [code]="basicCode">
    <cb-contextmenu [items]="items" (itemSelect)="selected.set($event.label)">
      <div style="display:grid;place-items:center;min-height:9rem;border:1px dashed var(--cb-color-border-strong);border-radius:var(--cb-radius-md);background:var(--cb-color-surface)">Clic derecho aquí · {{ selected() || 'sin acción' }}</div>
    </cb-contextmenu>
  </doc-section>

  <doc-playground [api]="docApi" />
` })
export class ContextmenuDocComponent {
  protected readonly docApi = DOC_API['cb-contextmenu'];

  constructor() { inject(TocService).reset(); }
  protected readonly selected = signal('');
  protected readonly items: CbContextMenuItem[] = [{ label: 'Copiar', icon: 'copy' }, { label: 'Compartir', icon: 'external-link' }, { label: '', separator: true }, { label: 'Eliminar', disabled: true }];
  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbContextMenu } from '@caribeng/ui/contextmenu';`;
  protected readonly basicCode = `<cb-contextmenu [items]="items" (itemSelect)="onAction($event)">
  <div>Haz clic derecho aquí</div>
</cb-contextmenu>`;
}
