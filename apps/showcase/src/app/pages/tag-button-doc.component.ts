import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTagButton } from '@caribeng/ui/caribe/tag-button';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-tag-button-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbTagButton],
  template: `
    <cb-doc-page
      category="Caribe Design · Acciones"
      title="TagButton"
      subtitle="Píldora interactiva seleccionable para filtros rápidos y categorías."
      importCode="import { CbTagButton } from '@caribeng/ui/caribe/tag-button';"
      [api]="api"
    >
      <cb-doc-example title="Filtros seleccionables" code='<cb-tag-button label="Transferencias" [(selected)]="active" />'>
        <div style="display: flex; gap: 0.5rem">
          <cb-tag-button label="Transferencias" [(selected)]="active" />
          <cb-tag-button label="Pagos QR" />
        </div>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class TagButtonDocComponent {
  protected readonly docApi = DOC_API['cb-tag-button'];

  protected readonly active = signal(true);
  protected readonly api: CbDocApiRow[] = [
    { name: 'label', type: 'string', default: "'Filtro'", description: 'Texto visible del tag.' },
    { name: 'selected', type: 'boolean (model)', default: 'false', description: 'Estado activo/presionado.' },
  ];
}
