import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbConfirmDialog } from '@caribeng/ui/confirmdialog';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-confirmdialog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbConfirmDialog,
    CbButton,
    DocA11yComponent,
    DocPlaygroundComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Overlays"
      title="ConfirmDialog"
      lead="Diálogo modal para confirmar una acción antes de ejecutarla; atrapa el foco y se cancela con Escape."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Se abre con [(visible)]; accepted y rejected avisan de la decisión. Sin textos propios, usa los del idioma activo."
      [code]="basicCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-button (click)="basic.set(true)">Confirmar acción</cb-button>
        <cb-confirm-dialog [(visible)]="basic" (accepted)="result.set('Aceptado')" (rejected)="result.set('Cancelado')" />
        <p style="margin: 0; font-size: 0.875rem">Resultado: {{ result() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="destructive"
      title="Acción destructiva"
      description="header, message y los textos de los botones se personalizan; acceptSeverity=&quot;danger&quot; marca el botón de aceptar como peligroso."
      [code]="destructiveCode"
    >
      <cb-button severity="danger" (click)="danger.set(true)">Eliminar cuenta</cb-button>
      <cb-confirm-dialog
        [(visible)]="danger"
        header="Eliminar cuenta"
        message="Perderás tu historial de movimientos. Esta acción no se puede deshacer."
        acceptLabel="Sí, eliminar"
        rejectLabel="Conservar"
        acceptSeverity="danger"
      />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ConfirmdialogDocComponent {
  protected readonly a11y = DOC_A11Y['cb-confirm-dialog'];
  protected readonly docApi = DOC_API['cb-confirm-dialog'];

  protected readonly basic = signal(false);
  protected readonly danger = signal(false);
  protected readonly result = signal('—');

  protected readonly importCode = `import { CbConfirmDialog } from '@caribeng/ui/confirmdialog';`;

  protected readonly basicCode = `<cb-button (click)="basic.set(true)">Confirmar acción</cb-button>
<cb-confirm-dialog [(visible)]="basic" (accepted)="result.set('Aceptado')" (rejected)="result.set('Cancelado')" />`;

  protected readonly destructiveCode = `<cb-button severity="danger" (click)="danger.set(true)">Eliminar cuenta</cb-button>
<cb-confirm-dialog
  [(visible)]="danger"
  header="Eliminar cuenta"
  message="Perderás tu historial de movimientos. Esta acción no se puede deshacer."
  acceptLabel="Sí, eliminar"
  rejectLabel="Conservar"
  acceptSeverity="danger"
/>`;

  constructor() {
    inject(TocService).reset();
  }
}
