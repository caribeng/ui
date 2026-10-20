import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbConfirmPopup } from '@caribeng/ui/confirmpopup';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-confirmpopup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbConfirmPopup,
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
      title="ConfirmPopup"
      lead="Confirmación breve que aparece junto al botón que la dispara, sin bloquear el resto de la página."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="confirm($event) la abre anclada al botón pulsado; accepted y rejected avisan de la decisión. Escape o un clic fuera la cancelan."
      [code]="basicCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-button severity="danger" (click)="borrar.confirm($event)">Eliminar archivo</cb-button>
        <cb-confirm-popup
          #borrar
          message="¿Eliminar este archivo?"
          acceptSeverity="danger"
          (accepted)="result.set('Archivo eliminado')"
          (rejected)="result.set('Cancelado')"
        />
        <p style="margin: 0; font-size: 0.875rem">Resultado: {{ result() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="inline"
      title="En línea"
      description="Con [(visible)] se muestra dentro del flujo de la página, donde esté el componente."
      [code]="inlineCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-button variant="outlined" (click)="inline.set(true)">Mostrar confirmación</cb-button>
        <cb-confirm-popup [(visible)]="inline" message="¿Guardar los cambios?" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ConfirmpopupDocComponent {
  protected readonly docApi = DOC_API['cb-confirm-popup'];
  protected readonly a11y = DOC_A11Y['cb-confirm-popup'];

  protected readonly inline = signal(false);
  protected readonly result = signal('—');

  protected readonly importCode = `import { CbConfirmPopup } from '@caribeng/ui/confirmpopup';`;

  protected readonly basicCode = `<cb-button severity="danger" (click)="borrar.confirm($event)">Eliminar archivo</cb-button>
<cb-confirm-popup
  #borrar
  message="¿Eliminar este archivo?"
  acceptSeverity="danger"
  (accepted)="result.set('Archivo eliminado')"
  (rejected)="result.set('Cancelado')"
/>`;

  protected readonly inlineCode = `<cb-button variant="outlined" (click)="inline.set(true)">Mostrar confirmación</cb-button>
<cb-confirm-popup [(visible)]="inline" message="¿Guardar los cambios?" />`;

  constructor() {
    inject(TocService).reset();
  }
}
