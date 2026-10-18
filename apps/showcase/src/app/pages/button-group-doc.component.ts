import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbButtonGroup } from '@caribeng/ui/caribe/button-group';
import { CbButton } from '@caribeng/ui/button';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-button-group-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbButtonGroup, CbButton],
  template: `
    <cb-doc-page
      category="Caribe Design · Acciones"
      title="ButtonGroup"
      subtitle="Agrupador accesible de botones con orientación horizontal o vertical."
      importCode="import { CbButtonGroup } from '@caribeng/ui/caribe/button-group';"
      [api]="api"
    >
      <cb-doc-example title="Grupo horizontal" code='<cb-button-group><cb-button size="sm">Día</cb-button><cb-button size="sm" variant="outlined">Mes</cb-button></cb-button-group>'>
        <cb-button-group>
          <cb-button size="sm">Día</cb-button>
          <cb-button size="sm" variant="outlined">Mes</cb-button>
          <cb-button size="sm" variant="outlined">Año</cb-button>
        </cb-button-group>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class ButtonGroupDocComponent {
  protected readonly docApi = DOC_API['cb-button-group'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Dirección del grupo de botones.' },
    { name: 'ariaLabel', type: 'string', default: "'Grupo de acciones'", description: 'Nombre accesible del grupo.' },
  ];
}
