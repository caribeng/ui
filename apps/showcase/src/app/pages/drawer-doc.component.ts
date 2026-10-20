import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDrawer } from '@caribeng/ui/drawer';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-drawer-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbDrawer,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Overlays" title="Drawer" lead="Panel lateral que se desliza desde un borde. Trampa de foco, bloqueo de scroll y cierre con Escape/backdrop." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Controla la visibilidad con [(visible)]." [code]="basicCode">
      <cb-button (click)="open.set(true)">Abrir drawer</cb-button>
      <cb-drawer [(visible)]="open" header="Filtros" position="right">
        <p style="margin: 0 0 1rem">Ajusta los filtros del listado.</p>
        <p style="margin: 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
          Contenido de ejemplo del panel lateral.
        </p>
        <div cb-drawer-footer>
          <cb-button variant="text" severity="secondary" (click)="open.set(false)">Cancelar</cb-button>
          <cb-button (click)="open.set(false)">Aplicar</cb-button>
        </div>
      </cb-drawer>
    </doc-section>

    <doc-section id="positions" title="Posiciones" description="position: left · right · top · bottom." [code]="posCode">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
        <cb-button variant="outlined" (click)="pos.set('left'); open2.set(true)">Left</cb-button>
        <cb-button variant="outlined" (click)="pos.set('right'); open2.set(true)">Right</cb-button>
        <cb-button variant="outlined" (click)="pos.set('top'); open2.set(true)">Top</cb-button>
        <cb-button variant="outlined" (click)="pos.set('bottom'); open2.set(true)">Bottom</cb-button>
      </div>
      <cb-drawer [(visible)]="open2" [position]="pos()" header="Posición: {{ pos() }}">
        <p style="margin: 0">Drawer anclado al borde «{{ pos() }}».</p>
      </cb-drawer>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class DrawerDocComponent {
  protected readonly docApi = DOC_API['cb-drawer'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly open = signal(false);
  protected readonly open2 = signal(false);
  protected readonly pos = signal<'left' | 'right' | 'top' | 'bottom'>('left');

  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbDrawer } from '@caribeng/ui/drawer';`;
  protected readonly basicCode = `<cb-button (click)="open.set(true)">Abrir drawer</cb-button>
<cb-drawer [(visible)]="open" header="Filtros" position="right">
  <p>Contenido…</p>
  <div cb-drawer-footer>
    <cb-button (click)="open.set(false)">Aplicar</cb-button>
  </div>
</cb-drawer>`;
  protected readonly posCode = `<cb-drawer [(visible)]="open" position="left" header="Menú">…</cb-drawer>`;
}
