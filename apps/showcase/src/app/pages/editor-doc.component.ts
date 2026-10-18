import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbEditor } from '@caribeng/ui/editor';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbEditor, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="Editor" lead="Editor de texto enriquecido ligero con barra de formato e integración CVA." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-editor [(value)]="content" style="width: 100%" />
    </doc-section>
  `,
})
export class EditorDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly content = signal('<p>Bienvenido a <strong>CaribeNG</strong>.</p>');
  protected readonly importCode = `import { CbEditor } from '@caribeng/ui/editor';`;
  protected readonly basicCode = `<cb-editor [(value)]="content" />`;
}
