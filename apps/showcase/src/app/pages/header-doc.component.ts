import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbHeader } from '@caribeng/ui/caribe/header';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-header-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbHeader],
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
    </cb-doc-page>
  `,
})
export class HeaderDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'title', type: 'string', default: "'CaribeNG'", description: 'Título principal.' },
    { name: 'subtitle', type: 'string', default: "''", description: 'Subtítulo opcional.' },
    { name: 'showBack', type: 'boolean', default: 'false', description: 'Muestra botón de regreso.' },
  ];
}
