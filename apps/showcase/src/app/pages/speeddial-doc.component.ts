import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbSpeedDialComponent, type CbSpeedDialItem } from '@caribeng/ui/speeddial';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-speeddial-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbSpeedDialComponent, CodeBlockComponent, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header eyebrow="Menu" title="SpeedDial" lead="Acciones rápidas que se despliegan desde un botón flotante." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Basic" description="Pulsa el botón para desplegar acciones; elegir una acción cierra el menú." [code]="basicCode">
      <div style="display:flex;justify-content:center;align-items:center;min-height:14rem;width:100%">
        <cb-speed-dial [items]="items" direction="up" (itemSelect)="selected.set($event.label)" />
      </div>
      <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Acción: {{ selected() || 'ninguna' }}</p>
    </doc-section>
  `,
})
export class SpeedDialDocComponent {
  constructor() { inject(TocService).reset(); }

  protected readonly items: CbSpeedDialItem[] = [
    { label: 'Crear', icon: 'plus' },
    { label: 'Compartir', icon: 'share-2' },
    { label: 'Guardar', icon: 'bookmark' },
  ];
  protected readonly selected = signal('');
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSpeedDialComponent } from '@caribeng/ui/speeddial';`;
  protected readonly basicCode = `<cb-speed-dial
  [items]="items"
  direction="up"
  (itemSelect)="handleAction($event)"
/>`;
}
