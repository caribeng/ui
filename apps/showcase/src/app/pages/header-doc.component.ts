import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbHeader } from '@caribeng/ui/caribe/header';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-header-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbHeader, CbIconButton],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="Header"
      subtitle="Encabezado de aplicación o flujo con botón de retorno y proyección de acciones."
      importCode="import { CbHeader } from '@caribeng/ui/caribe/header';"
      [api]="api"
    >
      <cb-doc-example title="Encabezado de flujo" code='<cb-header title="Transferencias" subtitle="Paso 1 de 3" [showBack]="true" />'>
        <cb-header title="Transferencias" subtitle="Paso 1 de 3" [showBack]="true" />
      </cb-doc-example>

      <cb-doc-example
        title="App header con acciones"
        [code]="composedCode"
      >
        <div style="width: 100%; max-width: 30rem; border: 1px solid var(--cb-color-border); border-radius: var(--cb-radius-lg); overflow: hidden">
          <cb-header title="Transfers" subtitle="Savings account" [showBack]="true">
            <cb-icon-button icon="search" ariaLabel="Search" variant="ghost" />
            <cb-icon-button icon="bell" ariaLabel="Notifications" variant="ghost" />
            <cb-icon-button icon="user" ariaLabel="Profile" variant="ghost" />
          </cb-header>
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class HeaderDocComponent {
  protected readonly docApi = DOC_API['cb-header'];

  protected readonly composedCode = `<cb-header title="Transfers" subtitle="Savings account" [showBack]="true">
  <cb-icon-button icon="search" ariaLabel="Search" variant="ghost" />
  <cb-icon-button icon="bell" ariaLabel="Notifications" variant="ghost" />
  <cb-icon-button icon="user" ariaLabel="Profile" variant="ghost" />
</cb-header>`;

  protected readonly api: CbDocApiRow[] = [
    { name: 'title', type: 'string', default: "'CaribeNG'", description: 'Título principal.' },
    { name: 'subtitle', type: 'string', default: "''", description: 'Subtítulo opcional.' },
    { name: 'showBack', type: 'boolean', default: 'false', description: 'Muestra botón de regreso.' },
  ];
}
