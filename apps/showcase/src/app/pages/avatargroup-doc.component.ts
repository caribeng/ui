import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbAvatarGroup } from '@caribeng/ui/avatargroup';
import { CbAvatar } from '@caribeng/ui/avatar';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-avatargroup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbAvatarGroup,
    CbAvatar,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Multimedia" title="AvatarGroup" lead="Agrupa múltiples avatares superpuestos." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Agrupa varios cb-avatar superpuestos, ideal para mostrar participantes." [code]="basicCode">
      <cb-avatar-group>
        <cb-avatar label="OZ" severity="primary" />
        <cb-avatar label="CL" severity="info" />
        <cb-avatar label="CX" severity="success" />
        <cb-avatar label="+3" severity="secondary" />
      </cb-avatar-group>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class AvatargroupDocComponent {
  protected readonly docApi = DOC_API['cb-avatar-group'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbAvatarGroup } from '@caribeng/ui/avatargroup';`;
  protected readonly basicCode = `<cb-avatar-group>
  <cb-avatar label="OZ" severity="primary" />
  <cb-avatar label="CL" severity="info" />
</cb-avatar-group>`;
}
