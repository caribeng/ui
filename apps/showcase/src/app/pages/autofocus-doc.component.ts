import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbAutoFocusDirective } from '@caribeng/ui/autofocus';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

const BASIC_CODE = `<input cbAutoFocus placeholder="Recibe foco al montar" />`;

@Component({
  selector: 'cb-autofocus-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, CbDocPageComponent, CbDocExampleComponent, CbAutoFocusDirective],
  template: `
    <cb-doc-page
      category="Varios"
      title="AutoFocus"
      subtitle="Directiva que enfoca automáticamente el elemento anfitrión al montarse en la vista."
      importCode="import { CbAutoFocusDirective } from '@caribeng/ui/autofocus';"
      [api]="api"
    >
      <cb-doc-example
        title="Campo con enfoque inicial"
        description="Puedes pasar un booleano a [cbAutoFocus] para controlar si el enfoque automático está activo."
        [code]="basicCode"
      >
        <input
          [cbAutoFocus]="false"
          placeholder="Ejemplo con [cbAutoFocus]"
          style="padding: 0.45rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--cb-border-color, #cbd5e1)"
        />
      </cb-doc-example>
      <doc-a11y [data]="a11y" />
    </cb-doc-page>
  `,
})
export class AutofocusDocComponent {
  protected readonly a11y = DOC_A11Y['[cbAutoFocus]'];
  protected readonly basicCode = BASIC_CODE;

  protected readonly api: CbDocApiRow[] = [
    { name: 'cbAutoFocus', type: 'boolean', default: 'true', description: 'Activa o desactiva el enfoque automático al montar.' },
  ];
}
