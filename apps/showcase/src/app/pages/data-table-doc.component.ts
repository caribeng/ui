import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDataTable } from '@caribeng/ui/caribe/data-table';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-data-table-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDataTable, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Data Table" lead="Data Table para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-data-table [columns]="columns" [rows]="rows" /></doc-section>
  `,
})
export class DataTableDocComponent {
  protected readonly docApi = DOC_API['cb-data-table'];

  constructor() { inject(TocService).reset(); }
  protected readonly columns = ['name', 'status'];
  protected readonly rows = [{ name: 'Cuenta principal', status: 'Activa' }, { name: 'Ahorros', status: 'Activa' }];
  protected readonly importCode = `import { CbDataTable } from '@caribeng/ui/caribe/data-table';`;
  protected readonly exampleCode = `<cb-data-table [columns]="columns" [rows]="rows" />`;
}
