import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { CbEditor } from '@caribeng/ui/editor';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbEditor, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="Editor" lead="Editor de texto enriquecido ligero con barra de formato e integración CVA." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Editor de texto enriquecido; el HTML resultante se enlaza con [(value)]." [code]="basicCode">
      <cb-editor [(value)]="content" style="width: 100%" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class EditorDocComponent {
  protected readonly docApi = DOC_API['cb-editor'];
  protected readonly a11y = DOC_A11Y['cb-editor'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly content = signal('<p>Bienvenido a <strong>CaribeNG</strong>.</p>');
  protected readonly importCode = `import { CbEditor } from '@caribeng/ui/editor';`;
  protected readonly basicCode = `<cb-editor [(value)]="content" />`;
}
