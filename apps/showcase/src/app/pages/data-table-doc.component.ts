import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbDataTableComponent } from '@caribeng/ui/data-table';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-data-table-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDataTableComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Data Table" lead="Data Table para interfaces accesibles, con estilos basados en tokens CaribeNG." />
    <doc-section id="import" title="Import"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Uso basico" [code]="exampleCode"><cb-data-table [columns]="columns" [rows]="rows" /></doc-section>
  `,
})
export class DataTableDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly columns = ['name', 'status'];
  protected readonly rows = [{ name: 'Cuenta principal', status: 'Activa' }, { name: 'Ahorros', status: 'Activa' }];
  protected readonly importCode = `import { CbDataTableComponent } from '@caribeng/ui/data-table';`;
  protected readonly exampleCode = `<cb-data-table [columns]="columns" [rows]="rows" />`;
}
