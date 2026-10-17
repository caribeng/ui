import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbIconFieldComponent, CbInputIconComponent } from '@caribeng/ui/iconfield';
import { CbInputComponent } from '@caribeng/ui/input';
import { CbIconComponent } from '@caribeng/ui/icon';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-iconfield-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIconFieldComponent,
    CbInputIconComponent,
    CbInputComponent,
    CbIconComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Form" title="IconField" lead="Integra iconos informativos a la izquierda o derecha de un campo de entrada." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="width: 280px">
        <cb-icon-field iconPosition="left">
          <cb-input-icon><cb-icon name="search" [size]="15" /></cb-input-icon>
          <cb-input placeholder="Buscar…" />
        </cb-icon-field>
      </div>
    </doc-section>
  `,
})
export class IconfieldDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbIconFieldComponent, CbInputIconComponent } from '@caribeng/ui/iconfield';`;
  protected readonly basicCode = `<cb-icon-field iconPosition="left">
  <cb-input-icon><cb-icon name="search" [size]="15" /></cb-input-icon>
  <cb-input placeholder="Buscar…" />
</cb-icon-field>`;
}
