import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbEmpty } from '@caribeng/ui/empty';
import { CbTable, type CbTableColumn } from '@caribeng/ui/table';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-empty-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbEmpty, CbButton, CbTable, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Messages" title="Empty" lead="Estado vacío: qué pasa cuando una lista, búsqueda o tabla no tiene datos, y qué puede hacer el usuario." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="title, description y las acciones proyectadas como contenido." [code]="basicCode">
      <cb-empty style="width: 100%" icon="file" title="Aún no tienes movimientos" description="Cuando hagas tu primera compra o transferencia aparecerá aquí.">
        <cb-button size="sm">Hacer una transferencia</cb-button>
      </cb-empty>
    </doc-section>

    <doc-section
      id="table"
      title="Dentro de una tabla"
      description="size=&quot;sm&quot; para tablas y paneles. Sin title usa &quot;Sin datos&quot; del idioma activo."
      [code]="tableCode"
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <cb-empty size="sm" icon="search" title="Ningún resultado para «nómina 2019»" description="Prueba con otras palabras o quita algún filtro." />
        <cb-table [value]="[]" [columns]="cols" size="sm" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class EmptyDocComponent {
  protected readonly docApi = DOC_API['cb-empty'];
  protected readonly a11y = DOC_A11Y['cb-empty'];
  protected readonly cols: CbTableColumn[] = [
    { field: 'fecha', header: 'Fecha' },
    { field: 'valor', header: 'Valor' },
  ];

  protected readonly importCode = `import { CbEmpty } from '@caribeng/ui/empty';`;
  protected readonly basicCode = `<cb-empty icon="file" title="Aún no tienes movimientos" description="Cuando hagas tu primera compra o transferencia aparecerá aquí.">
  <cb-button size="sm">Hacer una transferencia</cb-button>
</cb-empty>`;
  protected readonly tableCode = `<cb-empty size="sm" icon="search" title="Ningún resultado para «nómina 2019»" description="Prueba con otras palabras o quita algún filtro." />`;

  constructor() {
    inject(TocService).reset();
  }
}
