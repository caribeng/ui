import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFabMenu } from '@caribeng/ui/caribe/fab-menu';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-fab-menu-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFabMenu],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="FabMenu"
      subtitle="Botón de acción flotante (FAB) con menú desplegable de atajos."
      importCode="import { CbFabMenu } from '@caribeng/ui/caribe/fab-menu';"
      [api]="api"
    >
      <cb-doc-example title="FAB interactivo" code='<cb-fab-menu [items]="items" />'>
        <cb-fab-menu [items]="items" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class FabMenuDocComponent {
  protected readonly docApi = DOC_API['cb-fab-menu'];

  protected readonly items = [
    { id: 'qr', label: 'Pagar con QR' },
    { id: 'tx', label: 'Transferir plata' },
  ];
  protected readonly api: CbDocApiRow[] = [
    { name: 'items', type: 'readonly CbFabMenuItem[]', default: '[]', description: 'Acciones del menú.' },
    { name: 'open', type: 'boolean (model)', default: 'false', description: 'Estado de apertura.' },
  ];
}
