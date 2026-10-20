import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbStyleClassDirective } from '@caribeng/ui/styleclass';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

const BASIC_CODE = `<button type="button" cbStyleClass="@next" toggleClass="cb-hidden">
  Alternar panel
</button>
<div>Contenido controlado por cbStyleClass</div>`;

@Component({
  selector: 'cb-styleclass-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbStyleClassDirective],
  template: `
    <cb-doc-page
      category="Varios"
      title="StyleClass"
      subtitle="Directiva declarativa para alternar clases CSS sobre elementos relativos (@next, @prev, @parent) o selectores."
      importCode="import { CbStyleClassDirective } from '@caribeng/ui/styleclass';"
      [api]="api"
    >
      <cb-doc-example
        title="Alternar visibilidad sin código TypeScript"
        description="Haz clic en el botón para alternar la clase sobre el elemento @next."
        [code]="basicCode"
      >
        <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start">
          <button
            type="button"
            cbStyleClass="@next"
            toggleClass="cb-hidden"
            style="padding: 0.45rem 0.9rem; border-radius: 0.375rem; border: 1px solid #0077b6; background: #0077b6; color: #fff; cursor: pointer"
          >
            Alternar bloque siguiente
          </button>
          <div style="padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid var(--cb-border-subtle, #e2e8f0)">
            Panel objetivo controlado por <code>cbStyleClass="@next"</code>.
          </div>
        </div>
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class StyleclassDocComponent {
  protected readonly basicCode = BASIC_CODE;

  protected readonly api: CbDocApiRow[] = [
    { name: 'cbStyleClass', type: "'@next' | '@prev' | '@parent' | string", default: "'@next'", description: 'Selector del elemento objetivo.' },
    { name: 'toggleClass', type: 'string', default: "''", description: 'Clase(s) a alternar en cada clic.' },
    { name: 'enterClass', type: 'string', default: "''", description: 'Clase(s) a añadir al activar.' },
    { name: 'leaveClass', type: 'string', default: "''", description: 'Clase(s) a aplicar al desactivar.' },
  ];
}
