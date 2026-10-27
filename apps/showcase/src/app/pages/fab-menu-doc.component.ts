import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFabMenu } from '@caribeng/ui/fab-menu';
import { CbCardPrimary } from '@caribeng/ui/card-primary';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-fab-menu-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFabMenu, CbCardPrimary],
  template: `
    <cb-doc-page
      category="Button"
      title="FabMenu"
      subtitle="Botón de acción flotante (FAB) con menú desplegable de atajos."
      importCode="import { CbFabMenu } from '@caribeng/ui/fab-menu';"
    >
      <cb-doc-example title="FAB interactivo" description="Botón flotante que despliega las acciones definidas en items." code='<cb-fab-menu [items]="items" />'>
        <cb-fab-menu [items]="items" />
      </cb-doc-example>

      <cb-doc-example title="Acciones rápidas sobre una tarjeta" description="Posicionado sobre una tarjeta, ofrece acciones rápidas sin ocupar espacio fijo." [code]="composedCode">
        <div style="position: relative; width: 100%; max-width: 22rem">
          <cb-card-primary title="Savings account" subtitle="**** 4829" value="$ 4,250,000" />
          <div style="position: absolute; bottom: 1rem; right: 1rem">
            <cb-fab-menu triggerLabel="Quick actions" [items]="actions" />
          </div>
        </div>
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
  protected readonly actions = [
    { id: 'transfer', label: 'Transfer' },
    { id: 'pay', label: 'Pay a bill' },
    { id: 'topup', label: 'Top up' },
  ];
  protected readonly composedCode = `<div style="position: relative">
  <cb-card-primary title="Savings account" subtitle="**** 4829" value="$ 4,250,000" />
  <div style="position: absolute; bottom: 1rem; right: 1rem">
    <cb-fab-menu triggerLabel="Quick actions" [items]="actions" />
  </div>
</div>`;
}
