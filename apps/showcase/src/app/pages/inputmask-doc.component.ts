import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInputMask } from '@caribeng/ui/inputmask';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-inputmask-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbInputMask, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="InputMask" lead="Campo de texto con máscara de formato (9 numérico, a alfabético, * alfanumérico)." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="width: 280px">
        <cb-input-mask mask="(999) 999-9999" [(value)]="phone" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class InputmaskDocComponent {
  protected readonly docApi = DOC_API['cb-input-mask'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly phone = signal('');
  protected readonly importCode = `import { CbInputMask } from '@caribeng/ui/inputmask';`;
  protected readonly basicCode = `<cb-input-mask mask="(999) 999-9999" [(value)]="phone" />`;
}
