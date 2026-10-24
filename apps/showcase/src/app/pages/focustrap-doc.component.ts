import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbFocusTrapDirective } from '@caribeng/ui/focustrap';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

const BASIC_CODE = `<div cbFocusTrap>
  <input placeholder="Nombre" />
  <button type="button">Guardar</button>
</div>`;

@Component({
  selector: 'cb-focustrap-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, CbDocPageComponent, CbDocExampleComponent, CbFocusTrapDirective],
  template: `
    <cb-doc-page
      category="Varios"
      title="FocusTrap"
      subtitle="Directiva que confina el ciclo de navegación por teclado (Tab y Shift+Tab) dentro del contenedor anfitrión."
      importCode="import { CbFocusTrapDirective } from '@caribeng/ui/focustrap';"
      [api]="api"
    >
      <cb-doc-example
        title="Contenedor con foco confinado"
        description="Pulsa Tab dentro del recuadro para comprobar cómo el foco cicla entre sus elementos."
        [code]="basicCode"
      >
        <div
          cbFocusTrap
          style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; padding: 1rem; border: 1px dashed var(--cb-border-color, #cbd5e1); border-radius: 0.5rem"
        >
          <input placeholder="Primer campo" style="padding: 0.4rem 0.65rem; border-radius: 0.375rem; border: 1px solid #cbd5e1" />
          <input placeholder="Segundo campo" style="padding: 0.4rem 0.65rem; border-radius: 0.375rem; border: 1px solid #cbd5e1" />
          <button type="button" style="padding: 0.4rem 0.85rem; border-radius: 0.375rem; border: 1px solid #0077b6; background: #0077b6; color: #fff">Confirmar</button>
        </div>
      </cb-doc-example>
      <doc-a11y [data]="a11y" />
    </cb-doc-page>
  `,
})
export class FocustrapDocComponent {
  protected readonly a11y = DOC_A11Y['[cbFocusTrap]'];
  protected readonly basicCode = BASIC_CODE;

  protected readonly api: CbDocApiRow[] = [
    { name: 'cbFocusTrapDisabled', type: 'boolean', default: 'false', description: 'Desactiva temporalmente la captura de foco.' },
  ];
}
