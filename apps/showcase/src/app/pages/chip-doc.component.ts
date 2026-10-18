import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbChip } from '@caribeng/ui/chip';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-chip-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbChip, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="Chip" lead="Píldora compacta para etiquetas individuales con icono o botón de cierre." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
        <cb-chip label="Angular 22" icon="zap" />
        <cb-chip label="Signals" [removable]="true" />
      </div>
    </doc-section>
  `,
})
export class ChipDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbChip } from '@caribeng/ui/chip';`;
  protected readonly basicCode = `<cb-chip label="Angular 22" icon="zap" />
<cb-chip label="Signals" [removable]="true" />`;
}
