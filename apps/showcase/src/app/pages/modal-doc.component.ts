import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbModal } from '@caribeng/ui/caribe/modal';
import { CbButton } from '@caribeng/ui/button';
import { CbInlineAlert } from '@caribeng/ui/caribe/inline-alert';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-modal-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbModal, CbButton, CbInlineAlert, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Modal" lead="Modal para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-modal title="Confirmar operacion" [visible]="true">Deseas continuar?</cb-modal></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Diálogo de confirmación', 'Confirmation dialog')"
      [description]="
        i18n.t(
          'Composición de alto nivel: un botón dispara el modal, que integra un inline-alert de advertencia y las acciones de confirmar/cancelar.',
          'High-level composition: a button opens the modal, which integrates a warning inline-alert and the confirm/cancel actions.'
        )
      "
      [code]="composedCode"
    >
      <cb-button severity="danger" (click)="confirmOpen.set(true)">Delete account</cb-button>
      <cb-modal
        title="Delete account"
        confirmLabel="Yes, delete"
        [(visible)]="confirmOpen"
        (confirm)="confirmOpen.set(false)"
      >
        <cb-inline-alert status="warning" [closable]="false" title="This action is permanent">
          You will lose access to your transaction history and saved payees.
        </cb-inline-alert>
      </cb-modal>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class ModalDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-modal'];
  protected readonly confirmOpen = signal(false);

  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbModal } from '@caribeng/ui/caribe/modal';`;
  protected readonly exampleCode = `<cb-modal title="Confirmar operacion" [visible]="true">Deseas continuar?</cb-modal>`;
  protected readonly composedCode = `<cb-button severity="danger" (click)="confirmOpen.set(true)">Delete account</cb-button>

<cb-modal title="Delete account" confirmLabel="Yes, delete"
  [(visible)]="confirmOpen" (confirm)="onDelete()">
  <cb-inline-alert status="warning" [closable]="false" title="This action is permanent">
    You will lose access to your transaction history and saved payees.
  </cb-inline-alert>
</cb-modal>`;
}
