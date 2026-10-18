import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPreloader } from '@caribeng/ui/caribe/preloader';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-preloader-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbPreloader],
  template: `
    <cb-doc-page
      category="Caribe Design · Loaders"
      title="Preloader"
      subtitle="Pantalla o bloque de precarga inicial para flujos transaccionales."
      importCode="import { CbPreloader } from '@caribeng/ui/caribe/preloader';"
      [api]="api"
    >
      <cb-doc-example title="Preloader activo" code='<cb-preloader [active]="true" label="Preparando tu sesión…" />'>
        <cb-preloader [active]="true" label="Preparando tu sesión…" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class PreloaderDocComponent {
  protected readonly docApi = DOC_API['cb-preloader'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'active', type: 'boolean', default: 'true', description: 'Controla si el preloader es visible.' },
    { name: 'title', type: 'string', default: "'CaribeNG'", description: 'Encabezado principal.' },
    { name: 'label', type: 'string', default: "'Preparando tu sesión segura…'", description: 'Subtítulo informativo.' },
  ];
}
