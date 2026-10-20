import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbMegaMenu, type CbMegaMenuItem } from '@caribeng/ui/megamenu';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-megamenu-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbMegaMenu,
    DocA11yComponent,
    DocPlaygroundComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Menús"
      title="MegaMenu"
      lead="Navegación por categorías con enlaces organizados en columnas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Cada categoría agrupa enlaces en columnas (groups). itemSelect emite el enlace elegido; ariaLabel nombra la navegación."
      [code]="basicCode"
    >
      <div style="width: 100%">
        <cb-megamenu [items]="items" ariaLabel="Catálogo" (itemSelect)="selected.set($event.label)" />
        <p style="margin: 0.75rem 0 0; font-size: 0.875rem">Selección: {{ selected() || 'ninguna' }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class MegamenuDocComponent {
  protected readonly docApi = DOC_API['cb-megamenu'];
  protected readonly a11y = DOC_A11Y['cb-megamenu'];

  protected readonly selected = signal('');
  protected readonly items: CbMegaMenuItem[] = [
    {
      label: 'Productos',
      icon: 'store',
      groups: [
        { label: 'Audio', items: [{ label: 'Auriculares', url: '#audio' }, { label: 'Altavoces' }] },
        { label: 'Computación', items: [{ label: 'Portátiles' }, { label: 'Monitores', url: '#monitores' }] },
        { label: 'Accesorios', items: [{ label: 'Cables' }, { label: 'Adaptadores' }] },
      ],
    },
    { label: 'Servicios', groups: [{ label: 'Soporte', items: [{ label: 'Centro de ayuda' }] }] },
  ];

  protected readonly importCode = `import { CbMegaMenu, type CbMegaMenuItem } from '@caribeng/ui/megamenu';`;

  protected readonly basicCode = `<cb-megamenu [items]="items" ariaLabel="Catálogo" (itemSelect)="selected.set($event.label)" />
<p>Selección: {{ selected() || 'ninguna' }}</p>`;

  constructor() {
    inject(TocService).reset();
  }
}
