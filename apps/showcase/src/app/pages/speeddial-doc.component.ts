import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbSpeedDial, type CbSpeedDialItem } from '@caribeng/ui/speeddial';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-speeddial-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbSpeedDial, CodeBlockComponent, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header eyebrow="Menús" title="SpeedDial" lead="Acciones rápidas que se despliegan desde un botón flotante." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Pulsa el botón para desplegar acciones; elegir una acción cierra el menú." [code]="basicCode">
      <div style="display:flex;justify-content:center;align-items:center;min-height:14rem;width:100%">
        <cb-speed-dial [items]="items" direction="up" (itemSelect)="selected.set($event.label)" />
      </div>
      <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Acción: {{ selected() || 'ninguna' }}</p>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class SpeedDialDocComponent {
  protected readonly docApi = DOC_API['cb-speed-dial'];

  constructor() { inject(TocService).reset(); }

  protected readonly items: CbSpeedDialItem[] = [
    { label: 'Crear', icon: 'plus' },
    { label: 'Compartir', icon: 'share-2' },
    { label: 'Guardar', icon: 'bookmark' },
  ];
  protected readonly selected = signal('');
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSpeedDial } from '@caribeng/ui/speeddial';`;
  protected readonly basicCode = `<cb-speed-dial
  [items]="items"
  direction="up"
  (itemSelect)="handleAction($event)"
/>`;
}
