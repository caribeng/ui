import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbRippleDirective } from '@caribeng/ui/ripple';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-ripple-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbRippleDirective, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="Ripple" lead="Directiva [cbRipple] para efecto visual de onda al hacer clic." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <button
        type="button"
        cbRipple
        style="
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--cb-color-primary-500);
          border-radius: var(--cb-radius-md);
          background: var(--cb-color-surface);
          color: var(--cb-color-primary-500);
          font-weight: 600;
          cursor: pointer;
        "
      >
        Haz clic aquí para ver la onda
      </button>
    </doc-section>
  `,
})
export class RippleDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbRippleDirective } from '@caribeng/ui/ripple';`;
  protected readonly basicCode = `<button type="button" cbRipple>Haz clic aquí</button>`;
}
