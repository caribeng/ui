import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbLogo } from '@caribeng/ui/logo';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-logo-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbLogo],
  template: `
    <cb-doc-page
      category="Multimedia"
      title="Logo"
      subtitle="Identidad corporativa vectorial de CaribeNG en múltiples formatos (Horizontal, Isotipo/Escudo, Vertical, Monocromático y Negativo), inspirada en PrimeNG y NG-ZORRO."
      importCode="import { CbLogo } from '@caribeng/ui/logo';"
    >
      <cb-doc-example
        title="Formatos del Logo Corporativo"
        description="Soporta versión horizontal completa, isotipo (escudo Angular-Caribe para favicons y barras compactas), vertical apilada y monocromática."
        code='<cb-logo name="caribe-horizontal" size="180px" />
<cb-logo name="caribe-icon" size="48px" />
<cb-logo name="caribe-vertical" size="110px" />
<cb-logo name="caribe-mono" size="180px" />'
      >
        <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem">
            <cb-logo name="caribe-horizontal" size="170px" />
            <small style="color: var(--cb-color-text-muted)">caribe-horizontal</small>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem">
            <cb-logo name="caribe-icon" size="48px" />
            <small style="color: var(--cb-color-text-muted)">caribe-icon (Isotipo / Favicon)</small>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem">
            <cb-logo name="caribe-vertical" size="105px" />
            <small style="color: var(--cb-color-text-muted)">caribe-vertical</small>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem">
            <cb-logo name="caribe-mono" size="170px" />
            <small style="color: var(--cb-color-text-muted)">caribe-mono</small>
          </div>
        </div>
      </cb-doc-example>

      <cb-doc-example
        title="Versión Negativa (Fondos Oscuros)"
        description="Con negative el logo se adapta a fondos oscuros."
        code='<cb-logo name="caribe-horizontal" size="170px" [negative]="true" />
<cb-logo name="caribe-mono" size="170px" [negative]="true" />'
      >
        <div
          style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap; background: #0f172a; padding: 1.25rem 1.5rem; border-radius: 0.75rem"
        >
          <cb-logo name="caribe-horizontal" size="170px" [negative]="true" />
          <cb-logo name="caribe-vertical" size="100px" [negative]="true" />
          <cb-logo name="caribe-mono" size="170px" [negative]="true" />
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class LogoDocComponent {
  protected readonly docApi = DOC_API['cb-logo'];

}
