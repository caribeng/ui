import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbLogo } from '@caribeng/ui/caribe/logo';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-logo-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbLogo],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="Logo"
      subtitle="Logotipo vectorial escalable con soporte de versión positiva/negativa y tamaño personalizable."
      importCode="import { CbLogo } from '@caribeng/ui/caribe/logo';"
      [api]="api"
    >
      <cb-doc-example title="Tamaños y variantes" code='<cb-logo name="caribe-horizontal" size="180px" />'>
        <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap">
          <cb-logo name="caribe-horizontal" size="150px" />
          <div style="background: #0f172a; padding: 0.5rem 1rem; border-radius: 0.5rem">
            <cb-logo name="caribe-horizontal" size="150px" [negative]="true" />
          </div>
        </div>
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class LogoDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'name', type: 'string', default: "'caribe-horizontal'", description: 'Identificador del logotipo.' },
    { name: 'size', type: 'string', default: "'160px'", description: 'Ancho CSS del logotipo (px, rem, em, %).' },
    { name: 'negative', type: 'boolean', default: 'false', description: 'Activa la variante clara para fondos oscuros.' },
    { name: 'alt', type: 'string', default: "'Logo Caribe'", description: 'Texto alternativo para lectores de pantalla.' },
  ];
}
