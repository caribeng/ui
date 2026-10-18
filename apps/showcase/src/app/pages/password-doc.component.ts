import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPassword } from '@caribeng/ui/password';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

const BASIC_CODE = `<cb-password [(value)]="secret" placeholder="Introduce tu contraseña" />`;

@Component({
  selector: 'cb-password-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbPassword],
  template: `
    <cb-doc-page
      category="Form"
      title="Password"
      subtitle="Campo de contraseña con alternancia de visibilidad, medidor de fortaleza e integración CVA."
      importCode="import { CbPassword } from '@caribeng/ui/password';"
      [api]="api"
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

  protected readonly api: CbDocApiRow[] = [
    { name: 'value', type: 'string (model)', default: "''", description: 'Valor actual del campo de contraseña.' },
    { name: 'toggleMask', type: 'boolean', default: 'true', description: 'Muestra el botón para alternar visibilidad.' },
    { name: 'feedback', type: 'boolean', default: 'true', description: 'Muestra la barra e indicador de fortaleza.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Tamaño del control.' },
  ];
}
