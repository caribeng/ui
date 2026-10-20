import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbSwitch } from '@caribeng/ui/caribe/switch';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import type { DocApi } from '../components/doc-api.model';

@Component({
  selector: 'cb-switch-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbDocPageComponent,
    CbDocExampleComponent,
    DocPlaygroundComponent,
    CbSwitch,
  ],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="Switch"
      subtitle="Interruptor binario con rol ARIA switch e integración CVA."
      importCode="import { CbSwitch } from '@caribeng/ui/caribe/switch';"
    >
      <cb-doc-example title="Interruptor con etiqueta" description="label define la etiqueta y el estado se enlaza con [(checked)]." code='<cb-switch label="Notificaciones push" [(checked)]="enabled" />'>
        <cb-switch label="Notificaciones push" [(checked)]="enabled" />
      </cb-doc-example>

      <doc-playground [api]="playground" />
    </cb-doc-page>
  `,
})
export class SwitchDocComponent {
  protected readonly enabled = signal(true);

  protected readonly playground: DocApi = {
    component: CbSwitch,
    selector: 'cb-switch',
    props: [
      {
        name: 'label',
        kind: 'string',
        type: 'string',
        default: 'Notificaciones',
        description: 'Etiqueta del interruptor.',
      },
      {
        name: 'checked',
        kind: 'boolean',
        type: 'boolean (model)',
        default: false,
        description: 'Estado encendido/apagado.',
      },
      {
        name: 'leftLabel',
        kind: 'boolean',
        type: 'boolean',
        default: false,
        description: 'Coloca la etiqueta a la izquierda.',
      },
      {
        name: 'required',
        kind: 'boolean',
        type: 'boolean',
        default: false,
        description: 'Marca el control como requerido (aria-required).',
      },
      {
        name: 'disabled',
        kind: 'boolean',
        type: 'boolean',
        default: false,
        description: 'Deshabilita la interacción.',
      },
      {
        name: 'inputId',
        kind: 'string',
        type: 'string',
        default: '',
        description: 'Id del input; se genera uno estable si no se provee.',
        control: false,
      },
    ],
    events: [
      {
        name: 'changed',
        type: 'boolean',
        description: 'Emite el nuevo estado al cambiar.',
      },
    ],
  };
}
