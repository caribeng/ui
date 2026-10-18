import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbInputToken } from '@caribeng/ui/caribe/input-token';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-token-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbInputToken],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputToken"
      subtitle="Captura segura de clave dinámica / OTP tokenizado con enmascaramiento opcional."
      importCode="import { CbInputToken } from '@caribeng/ui/caribe/input-token';"
      [api]="api"
    >
      <cb-doc-example title="Clave dinámica de 6 dígitos" code='<cb-input-token [(value)]="token" [numInputs]="6" [unmasked]="true" />'>
        <cb-input-token [(value)]="token" [numInputs]="6" [unmasked]="true" helpText="Ingresa la clave dinámica de tu App" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class InputTokenDocComponent {
  protected readonly token = signal('482910');
  protected readonly api: CbDocApiRow[] = [
    { name: 'numInputs', type: 'number', default: '6', description: 'Número de dígitos del código token (3 a 8).' },
    { name: 'unmasked', type: 'boolean', default: 'false', description: 'Si es true, muestra los dígitos en lugar de ocultarlos.' },
    { name: 'helpText', type: 'string', default: "''", description: 'Texto de ayuda inferior.' },
  ];
}
