import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbMegaMenuComponent, type CbMegaMenuItem } from '@caribeng/ui/megamenu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-megamenu-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CbMegaMenuComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menu" title="MegaMenu" lead="Navegación por categorías con enlaces organizados en columnas." />
  <doc-section id="import" title="Import"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Basic" description="Pulsa una categoría para abrir o cerrar sus grupos." [code]="basicCode">
    <cb-megamenu [items]="items" (itemSelect)="selected.set($event.label)" />
    <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Selección: {{ selected() || 'ninguna' }}</p>
  </doc-section>
` })
export class MegamenuDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly selected = signal('');
  protected readonly items: CbMegaMenuItem[] = [{ label: 'Productos', icon: 'store', groups: [
    { label: 'Audio', items: [{ label: 'Auriculares', url: '#audio' }, { label: 'Altavoces' }] },
    { label: 'Computación', items: [{ label: 'Portátiles' }, { label: 'Monitores', url: '#monitores' }] },
    { label: 'Accesorios', items: [{ label: 'Cables' }, { label: 'Adaptadores' }] },
  ] }, { label: 'Servicios', groups: [{ label: 'Soporte', items: [{ label: 'Centro de ayuda' }] }] }];
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbMegaMenuComponent } from '@caribeng/ui/megamenu';`;
  protected readonly basicCode = `<cb-megamenu [items]="categories" (itemSelect)="onNavigate($event)" />`;
}
