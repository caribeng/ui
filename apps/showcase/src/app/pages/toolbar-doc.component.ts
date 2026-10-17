import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbToolbarComponent } from '@caribeng/ui/toolbar';
import { CbButtonComponent } from '@caribeng/ui/button';
import { CbIconComponent } from '@caribeng/ui/icon';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-toolbar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbToolbarComponent,
    CbButtonComponent,
    CbIconComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Panel"
      title="Toolbar"
      lead="Barra horizontal accesible (role='toolbar') para organizar acciones en inicio, centro y fin."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-toolbar ariaLabel="Acciones del proyecto" style="width: 100%">
        <div cb-toolbar-start style="display: inline-flex; gap: 0.5rem">
          <cb-button size="sm"><cb-icon name="plus" [size]="14" /> Nuevo</cb-button>
          <cb-button size="sm" variant="outlined"><cb-icon name="upload" [size]="14" /> Importar</cb-button>
        </div>
        <div cb-toolbar-center>
          <span style="font-size: 0.875rem; opacity: 0.8">CaribeNG v0.13</span>
        </div>
        <div cb-toolbar-end style="display: inline-flex; gap: 0.5rem">
          <cb-button size="sm" variant="text"><cb-icon name="settings" [size]="15" /></cb-button>
          <cb-button size="sm" severity="secondary"><cb-icon name="download" [size]="14" /> Exportar</cb-button>
        </div>
      </cb-toolbar>
    </doc-section>
  `,
})
export class ToolbarDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbToolbarComponent } from '@caribeng/ui/toolbar';`;
  protected readonly basicCode = `<cb-toolbar ariaLabel="Acciones del proyecto">
  <div cb-toolbar-start>
    <cb-button size="sm">Nuevo</cb-button>
  </div>
  <div cb-toolbar-center>
    <span>CaribeNG</span>
  </div>
  <div cb-toolbar-end>
    <cb-button size="sm" variant="outlined">Exportar</cb-button>
  </div>
</cb-toolbar>`;
}
