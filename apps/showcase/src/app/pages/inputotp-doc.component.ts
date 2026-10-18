import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInputOtp } from '@caribeng/ui/inputotp';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-inputotp-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbInputOtp, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="InputOTP" lead="Entrada de código de verificación en casillas individuales con avance automático." />
    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-input-otp [length]="6" [integerOnly]="true" [(value)]="code" />
    </doc-section>
  `,
})
export class InputotpDocComponent {
  protected readonly docApi = DOC_API['cb-input-otp'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly code = signal('');
  protected readonly importCode = `import { CbInputOtp } from '@caribeng/ui/inputotp';`;
  protected readonly basicCode = `<cb-input-otp [length]="6" [integerOnly]="true" [(value)]="code" />`;
}
