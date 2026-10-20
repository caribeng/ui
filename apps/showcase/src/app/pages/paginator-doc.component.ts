import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPaginator } from '@caribeng/ui/paginator';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-paginator-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbPaginator, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Datos" title="Paginator" lead="Control de paginación reutilizable. first y rows son two-way." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-paginator [totalRecords]="120" [(first)]="first" [(rows)]="rows" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        first: {{ first() }} · rows: {{ rows() }}
      </p>
    </doc-section>

    <doc-section id="rows" title="Registros por página" description="rowsPerPageOptions añade el selector." [code]="rowsCode">
      <cb-paginator [totalRecords]="248" [(first)]="first2" [(rows)]="rows2" [rowsPerPageOptions]="[10, 20, 50]" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class PaginatorDocComponent {
  protected readonly docApi = DOC_API['cb-paginator'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly first = signal(0);
  protected readonly rows = signal(10);
  protected readonly first2 = signal(0);
  protected readonly rows2 = signal(10);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbPaginator } from '@caribeng/ui/paginator';`;
  protected readonly basicCode = `<cb-paginator [totalRecords]="120" [(first)]="first" [(rows)]="rows" />`;
  protected readonly rowsCode = `<cb-paginator [totalRecords]="248" [(first)]="first" [(rows)]="rows"
  [rowsPerPageOptions]="[10, 20, 50]" />`;
}
