import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbAvatarGroupComponent } from '@caribeng/ui/avatargroup';
import { CbAvatarComponent } from '@caribeng/ui/avatar';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-avatargroup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbAvatarGroupComponent,
    CbAvatarComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Media" title="AvatarGroup" lead="Agrupa múltiples avatares superpuestos." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-avatar-group>
        <cb-avatar label="OZ" severity="primary" />
        <cb-avatar label="CL" severity="info" />
        <cb-avatar label="CX" severity="success" />
        <cb-avatar label="+3" severity="secondary" />
      </cb-avatar-group>
    </doc-section>
  `,
})
export class AvatargroupDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly importCode = `import { CbAvatarGroupComponent } from '@caribeng/ui/avatargroup';`;
  protected readonly basicCode = `<cb-avatar-group>
  <cb-avatar label="OZ" severity="primary" />
  <cb-avatar label="CL" severity="info" />
</cb-avatar-group>`;
}
