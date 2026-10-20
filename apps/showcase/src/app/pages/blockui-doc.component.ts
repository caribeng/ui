import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbBlockUi } from '@caribeng/ui/blockui';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-blockui-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbBlockUi,
    CbCard,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Varios" title="BlockUI" lead="Bloquea temporalmente un contenedor con una máscara accesible." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Mientras blocked es true, el contenido queda cubierto por una capa que impide interactuar con él." [code]="basicCode">
      <div style="width: 100%; display: flex; flex-direction: column; gap: 0.75rem">
        <div>
          <cb-button size="sm" (click)="blocked.set(!blocked())">
            {{ blocked() ? 'Desbloquear' : 'Bloquear panel' }}
          </cb-button>
        </div>
        <cb-block-ui [blocked]="blocked()">
          <cb-card header="Transacción en proceso">
            <p style="margin: 0">Los controles internos quedan protegidos mientras dura la operación.</p>
          </cb-card>
        </cb-block-ui>
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class BlockuiDocComponent {
  protected readonly docApi = DOC_API['cb-block-ui'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly blocked = signal(false);
  protected readonly importCode = `import { CbBlockUi } from '@caribeng/ui/blockui';`;
  protected readonly basicCode = `<cb-block-ui [blocked]="blocked()">
  <cb-card header="Panel">…</cb-card>
</cb-block-ui>`;
}
