import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbFloatLabelComponent } from '@caribeng/ui/floatlabel';
import { CbInputComponent } from '@caribeng/ui/input';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-floatlabel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbFloatLabelComponent, CbInputComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="FloatLabel" lead="Etiqueta flotante reactiva al foco y al contenido del control." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="width: 280px">
        <cb-float-label>
          <cb-input />
          <label>Nombre de usuario</label>
        </cb-float-label>
      </div>
    </doc-section>
  `,
})
export class FloatlabelDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbFloatLabelComponent } from '@caribeng/ui/floatlabel';`;
  protected readonly basicCode = `<cb-float-label>
  <cb-input />
  <label>Nombre de usuario</label>
</cb-float-label>`;
}
