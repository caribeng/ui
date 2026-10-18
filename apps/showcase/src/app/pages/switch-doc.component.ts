import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbSwitchComponent } from '@caribeng/ui/switch';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-switch-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbSwitchComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="Switch"
      subtitle="Interruptor binario con rol ARIA switch e integración CVA."
      importCode="import { CbSwitchComponent } from '@caribeng/ui/switch';"
      [api]="api"
    >
      <cb-doc-example title="Interruptor con etiqueta" code='<cb-switch label="Notificaciones push" [(checked)]="enabled" />'>
        <cb-switch label="Notificaciones push" [(checked)]="enabled" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class SwitchDocComponent {
  protected readonly enabled = signal(true);
  protected readonly api: CbDocApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Etiqueta del interruptor.' },
    { name: 'checked', type: 'boolean (model)', default: 'false', description: 'Estado encendido/apagado.' },
  ];
}
