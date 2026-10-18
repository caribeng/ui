import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbTabs, CbTab } from '@caribeng/ui/tabs';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-tabs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbTabs,
    CbTab,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Panel" title="Tabs" lead="Interfaz por pestañas con navegación por teclado (flechas, Home/End)." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" [code]="basicCode">
      <cb-tabs style="width: 100%">
        <cb-tab label="Resumen">
          <p style="margin: 0">Vista general del proyecto y sus métricas principales.</p>
        </cb-tab>
        <cb-tab label="Actividad">
          <p style="margin: 0">Historial de cambios recientes del equipo.</p>
        </cb-tab>
        <cb-tab label="Ajustes">
          <p style="margin: 0">Configuración del espacio de trabajo.</p>
        </cb-tab>
      </cb-tabs>
    </doc-section>

    <doc-section id="disabled" title="Pestaña deshabilitada" [code]="disabledCode">
      <cb-tabs style="width: 100%">
        <cb-tab label="Disponible"><p style="margin: 0">Contenido disponible.</p></cb-tab>
        <cb-tab label="Bloqueada" disabled><p style="margin: 0">No accesible.</p></cb-tab>
        <cb-tab label="Otra"><p style="margin: 0">Más contenido.</p></cb-tab>
      </cb-tabs>
    </doc-section>
  `,
})
export class TabsDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbTabs, CbTab } from '@caribeng/ui/tabs';`;
  protected readonly basicCode = `<cb-tabs>
  <cb-tab label="Resumen">…</cb-tab>
  <cb-tab label="Actividad">…</cb-tab>
  <cb-tab label="Ajustes">…</cb-tab>
</cb-tabs>`;
  protected readonly disabledCode = `<cb-tab label="Bloqueada" disabled>…</cb-tab>`;
}
