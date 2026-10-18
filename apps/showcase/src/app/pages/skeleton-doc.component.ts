import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbSkeleton } from '@caribeng/ui/skeleton';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-skeleton-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbSkeleton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="Skeleton" lead="Marcador de posición animado mientras cargan los datos." />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="shapes" title="Formas" [code]="shapesCode">
      <div style="width: 100%; display: flex; flex-direction: column; gap: 0.75rem; max-width: 24rem">
        <cb-skeleton width="60%" />
        <cb-skeleton />
        <cb-skeleton width="80%" />
        <cb-skeleton shape="rect" height="6rem" />
      </div>
    </doc-section>

    <doc-section id="media" title="Composición (perfil)" description="Combina formas para prefigurar el contenido." [code]="mediaCode">
      <div style="display: flex; gap: 1rem; align-items: center; width: 100%; max-width: 24rem">
        <cb-skeleton shape="circle" width="3.5rem" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem">
          <cb-skeleton width="50%" />
          <cb-skeleton width="80%" />
        </div>
      </div>
    </doc-section>
  `,
})
export class SkeletonDocComponent {
  protected readonly docApi = DOC_API['cb-skeleton'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSkeleton } from '@caribeng/ui/skeleton';`;
  protected readonly shapesCode = `<cb-skeleton width="60%" />
<cb-skeleton shape="rect" height="6rem" />
<cb-skeleton shape="circle" width="3rem" />`;
  protected readonly mediaCode = `<cb-skeleton shape="circle" width="3.5rem" />
<cb-skeleton width="50%" />
<cb-skeleton width="80%" />`;
}
