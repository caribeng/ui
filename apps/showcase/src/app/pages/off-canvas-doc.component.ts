import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbOffCanvas } from '@caribeng/ui/caribe/off-canvas';
import { CbButton } from '@caribeng/ui/button';
import { CbInputSearch } from '@caribeng/ui/caribe/input-search';
import { CbTagButton } from '@caribeng/ui/caribe/tag-button';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-off-canvas-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbOffCanvas, CbButton, CbInputSearch, CbTagButton],
  template: `
    <cb-doc-page
      category="Caribe Design · Paneles"
      title="OffCanvas"
      subtitle="Panel lateral deslizable para filtros, menús contextuales y formularios secundarios."
      importCode="import { CbOffCanvas } from '@caribeng/ui/caribe/off-canvas';"
    >
      <cb-doc-example title="Panel lateral" description="Panel que se desliza desde un lateral, controlado con [(open)]." code='<cb-off-canvas title="Filtros avanzados" [(open)]="visible">Contenido</cb-off-canvas>'>
        <div style="display: flex; flex-direction: column; gap: 0.75rem">
          <cb-button size="sm" (click)="visible.set(!visible())">Alternar OffCanvas</cb-button>
          <cb-off-canvas title="Filtros avanzados" [(open)]="visible">
            Selecciona el rango de fechas y tipo de movimiento.
          </cb-off-canvas>
        </div>
      </cb-doc-example>

      <cb-doc-example title="Panel de filtros" description="Un botón abre el panel con controles de filtro." [code]="composedCode">
        <div style="display: flex; flex-direction: column; gap: 0.75rem">
          <cb-button size="sm" (click)="filters.set(true)">Open filters</cb-button>
          <cb-off-canvas title="Filters" [(open)]="filters">
            <div style="display: flex; flex-direction: column; gap: 0.9rem">
              <cb-input-search placeholder="Search movements" />
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem">
                <cb-tag-button label="All" />
                <cb-tag-button label="Income" />
                <cb-tag-button label="Expenses" />
                <cb-tag-button label="Transfers" />
              </div>
              <cb-button size="sm" (click)="filters.set(false)">Apply</cb-button>
            </div>
          </cb-off-canvas>
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class OffCanvasDocComponent {
  protected readonly docApi = DOC_API['cb-off-canvas'];

  protected readonly visible = signal(true);
  protected readonly filters = signal(false);
  protected readonly composedCode = `<cb-button (click)="filters.set(true)">Open filters</cb-button>

<cb-off-canvas title="Filters" [(open)]="filters">
  <cb-input-search placeholder="Search movements" />
  <cb-tag-button label="All" />
  <cb-tag-button label="Income" />
  <cb-tag-button label="Expenses" />
  <cb-button (click)="filters.set(false)">Apply</cb-button>
</cb-off-canvas>`;
}
