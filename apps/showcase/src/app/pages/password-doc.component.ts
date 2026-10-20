import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPassword } from '@caribeng/ui/password';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

const BASIC_CODE = `<cb-password [(value)]="secret" placeholder="Introduce tu contraseña" />`;

@Component({
  selector: 'cb-password-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbPassword],
  template: `
    <cb-doc-page
      category="Formulario"
      title="Password"
      subtitle="Campo de contraseña con alternancia de visibilidad, medidor de fortaleza e integración CVA."
      importCode="import { CbPassword } from '@caribeng/ui/password';"
    >
      <cb-doc-example
        title="Con medidor de fortaleza y máscara"
        description="Escribe para evaluar la complejidad de la contraseña en tiempo real."
        [code]="basicCode"
      >
        <div style="max-width: 320px; width: 100%">
          <cb-password [(value)]="secret" placeholder="Introduce tu contraseña" />
        </div>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class PasswordDocComponent {
  protected readonly docApi = DOC_API['cb-password'];

  protected readonly basicCode = BASIC_CODE;
  protected readonly secret = signal('Caribe2026!');

}
