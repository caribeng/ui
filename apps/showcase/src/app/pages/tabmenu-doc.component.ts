import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTabMenu, type CbTabMenuItem } from '@caribeng/ui/tabmenu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-tabmenu-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [DocPlaygroundComponent, CbTabMenu, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menu" title="TabMenu" lead="Navegación entre secciones con el elemento actual resaltado." />
  <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Basic" description="El índice activo se puede enlazar con [(activeIndex)]." [code]="basicCode" [codeTs]="itemsCode">
    <cb-tabmenu [items]="items" [(activeIndex)]="active" (itemSelect)="selected.set($event.label)" />
    <p style="margin: .75rem 0 0; color: var(--cb-color-text-muted)">Actual: {{ selected() || 'Resumen' }} · índice {{ active() }}</p>
  </doc-section>
` })
export class TabmenuDocComponent {
  protected readonly docApi = DOC_API['cb-tabmenu'];

  constructor() { inject(TocService).reset(); }
  protected readonly active = signal(0);
  protected readonly selected = signal('');
  protected readonly items: CbTabMenuItem[] = [{ label: 'Resumen', icon: 'house' }, { label: 'Actividad', icon: 'clock' }, { label: 'Ajustes', icon: 'settings' }];
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbTabMenu } from '@caribeng/ui/tabmenu';`;
  protected readonly basicCode = `<cb-tabmenu [items]="items" [(activeIndex)]="activeIndex" />`;
  protected readonly itemsCode = `items: CbTabMenuItem[] = [
  { label: 'Resumen', url: '/summary' },
  { label: 'Actividad', url: '/activity' },
];`;
}
