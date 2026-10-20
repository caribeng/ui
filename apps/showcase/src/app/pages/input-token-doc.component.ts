import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInputToken } from '@caribeng/ui/caribe/input-token';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-token-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbInputToken],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputToken"
      subtitle="Captura segura de clave dinámica / OTP tokenizado con enmascaramiento opcional."
      importCode="import { CbInputToken } from '@caribeng/ui/caribe/input-token';"
    >
      <cb-doc-example title="Clave dinámica de 6 dígitos" code='<cb-input-token [(value)]="token" [numInputs]="6" [unmasked]="true" />'>
        <cb-input-token [(value)]="token" [numInputs]="6" [unmasked]="true" helpText="Ingresa la clave dinámica de tu App" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class InputTokenDocComponent {
  protected readonly docApi = DOC_API['cb-input-token'];

  protected readonly token = signal('482910');
}
