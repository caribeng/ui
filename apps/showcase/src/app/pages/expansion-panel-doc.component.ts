import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbExpansionPanel } from '@caribeng/ui/caribe/expansion-panel';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-expansion-panel-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbExpansionPanel],
  template: `
    <cb-doc-page
      category="Caribe Design · Paneles"
      title="ExpansionPanel"
      subtitle="Panel desplegable para mostrar u ocultar detalles adicionales."
      importCode="import { CbExpansionPanel } from '@caribeng/ui/caribe/expansion-panel';"
      [api]="api"
    >
      <cb-doc-example title="Panel desplegable" code='<cb-expansion-panel title="Condiciones del producto" [expanded]="true">Sin cuota de manejo.</cb-expansion-panel>'>
        <cb-expansion-panel title="Condiciones del producto" [expanded]="true">
          Exento de cuota de manejo durante los primeros 12 meses.
        </cb-expansion-panel>
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class ExpansionPanelDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'title', type: 'string', default: "'Detalles'", description: 'Título del encabezado.' },
    { name: 'expanded', type: 'boolean (model)', default: 'false', description: 'Estado desplegado.' },
  ];
}
