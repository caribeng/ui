import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDataTable } from '@caribeng/ui/caribe/data-table';
import { CbInputSearch } from '@caribeng/ui/caribe/input-search';
import { CbTagButton } from '@caribeng/ui/caribe/tag-button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-data-table-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDataTable, CbInputSearch, CbTagButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Data Table" lead="Data Table para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" description="columns define las columnas y rows los datos de cada fila." [code]="exampleCode"><cb-data-table [columns]="columns" [rows]="rows" /></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Panel de movimientos', 'Movements panel')"
      [description]="
        i18n.t(
          'Composición de alto nivel: una barra con buscador y filtros (tag-buttons) sobre la tabla de datos.',
          'High-level composition: a toolbar with a search box and filters (tag-buttons) above the data table.'
        )
      "
      [code]="composedCode"
    >
      <div class="table-panel">
        <div class="table-panel__toolbar">
          <cb-input-search placeholder="Search accounts" />
          <div class="table-panel__filters">
            <cb-tag-button label="All" />
            <cb-tag-button label="Active" />
            <cb-tag-button label="Closed" />
          </div>
        </div>
        <cb-data-table [columns]="advColumns" [rows]="advRows" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .table-panel {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-3, 0.75rem);
        width: 100%;
      }
      .table-panel__toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--cb-space-3, 0.75rem);
      }
      .table-panel__filters {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cb-space-2, 0.5rem);
      }
    `,
  ],
})
export class DataTableDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-data-table'];

  constructor() { inject(TocService).reset(); }
  protected readonly columns = ['name', 'status'];
  protected readonly rows = [{ name: 'Cuenta principal', status: 'Activa' }, { name: 'Ahorros', status: 'Activa' }];
  protected readonly advColumns = ['account', 'type', 'balance'];
  protected readonly advRows = [
    { account: 'Savings', type: 'Deposit', balance: '$ 2,500' },
    { account: 'Checking', type: 'Deposit', balance: '$ 840' },
    { account: 'Credit card', type: 'Credit', balance: '-$ 320' },
  ];
  protected readonly importCode = `import { CbDataTable } from '@caribeng/ui/caribe/data-table';`;
  protected readonly exampleCode = `<cb-data-table [columns]="columns" [rows]="rows" />`;
  protected readonly composedCode = `<div class="toolbar">
  <cb-input-search placeholder="Search accounts" />
  <cb-tag-button label="All" />
  <cb-tag-button label="Active" />
  <cb-tag-button label="Closed" />
</div>
<cb-data-table [columns]="columns" [rows]="rows" />`;
}
