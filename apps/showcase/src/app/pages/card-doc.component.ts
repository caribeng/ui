import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbCard,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Panel" title="Card" lead="Contenedor con encabezado opcional, cuerpo y pie." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" [code]="basicCode">
      <div style="max-width: 360px">
        <cb-card header="Plan Pro" subtitle="Facturación mensual">
          <p style="margin: 0; color: var(--cb-color-text-muted)">
            Acceso completo a todos los componentes y soporte prioritario.
          </p>
        </cb-card>
      </div>
    </doc-section>

    <doc-section id="footer" title="Con pie (footer)" description="Proyecta acciones con el atributo cb-card-footer." [code]="footerCode">
      <div style="max-width: 360px">
        <cb-card header="¿Eliminar proyecto?" subtitle="Esta acción no se puede deshacer">
          <p style="margin: 0; color: var(--cb-color-text-muted)">
            Se borrarán todos los datos asociados de forma permanente.
          </p>
          <div cb-card-footer>
            <cb-button variant="text" severity="secondary">Cancelar</cb-button>
            <cb-button severity="danger">Eliminar</cb-button>
          </div>
        </cb-card>
      </div>
    </doc-section>

    <doc-section id="plain" title="Sin encabezado" [code]="plainCode">
      <div style="max-width: 360px">
        <cb-card>
          <p style="margin: 0">Una tarjeta simple, solo con contenido.</p>
        </cb-card>
      </div>
    </doc-section>
  `,
})
export class CardDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbCard } from '@caribeng/ui/card';`;
  protected readonly basicCode = `<cb-card header="Plan Pro" subtitle="Facturación mensual">
  <p>Acceso completo a todos los componentes.</p>
</cb-card>`;
  protected readonly footerCode = `<cb-card header="¿Eliminar proyecto?">
  <p>Se borrarán todos los datos.</p>
  <div cb-card-footer>
    <cb-button variant="text" severity="secondary">Cancelar</cb-button>
    <cb-button severity="danger">Eliminar</cb-button>
  </div>
</cb-card>`;
  protected readonly plainCode = `<cb-card>
  <p>Una tarjeta simple, solo con contenido.</p>
</cb-card>`;
}
