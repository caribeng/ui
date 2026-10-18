import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInputSearch } from '@caribeng/ui/caribe/input-search';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-search-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbInputSearch],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputSearch"
      subtitle="Campo de búsqueda con botón de limpieza rápida e integración CVA."
      importCode="import { CbInputSearch } from '@caribeng/ui/caribe/input-search';"
      [api]="api"
    >
      <cb-doc-example title="Búsqueda reactiva" code='<cb-input-search [(value)]="query" placeholder="Buscar transacción…" />'>
        <cb-input-search [(value)]="query" placeholder="Buscar transacción…" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class InputSearchDocComponent {
  protected readonly docApi = DOC_API['cb-input-search'];

  protected readonly query = signal('');
  protected readonly api: CbDocApiRow[] = [
    { name: 'value', type: 'string (model)', default: "''", description: 'Texto actual de búsqueda.' },
    { name: 'placeholder', type: 'string', default: "'Buscar…'", description: 'Texto guía.' },
    { name: 'clearable', type: 'boolean', default: 'true', description: 'Muestra botón para limpiar el texto.' },
  ];
}
