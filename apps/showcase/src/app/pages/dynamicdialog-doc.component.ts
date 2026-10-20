import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import {
  CB_DYNAMIC_DIALOG_DATA,
  CbDialogService,
  CbDynamicDialog,
  CbDynamicDialogRef,
} from '@caribeng/ui/dynamicdialog';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Cliente {
  nombre: string;
}

/** Contenido de ejemplo que se abre dentro del diálogo dinámico. */
@Component({
  selector: 'doc-cliente-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton],
  template: `
    <p style="margin: 0 0 1rem">¿Guardar los cambios de {{ data.nombre }}?</p>
    <div style="display: flex; gap: 0.5rem; justify-content: flex-end">
      <cb-button variant="text" (click)="ref.close(false)">Cancelar</cb-button>
      <cb-button (click)="ref.close(true)">Guardar</cb-button>
    </div>
  `,
})
class ClienteFormComponent {
  protected readonly data = inject<Cliente>(CB_DYNAMIC_DIALOG_DATA);
  protected readonly ref = inject<CbDynamicDialogRef<boolean>>(CbDynamicDialogRef);
}

@Component({
  selector: 'doc-dynamicdialog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbDynamicDialog,
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
      title="DynamicDialog"
      lead="Abre cualquier componente dentro de un diálogo desde código, le pasa datos y recibe un resultado al cerrarse."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="service"
      title="Con CbDialogService"
      description="open() recibe el componente y la configuración (header, data, width) y devuelve una referencia; onClose emite el resultado."
      [code]="serviceCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-button (click)="editar()">Editar cliente</cb-button>
        <p style="margin: 0; font-size: 0.875rem">Resultado: {{ result() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="content"
      title="Componente abierto"
      description="El componente abierto inyecta CB_DYNAMIC_DIALOG_DATA para leer los datos y CbDynamicDialogRef para cerrarse con close(resultado)."
    >
      <doc-code-block [code]="contentCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="declarative"
      title="Declarativo"
      description="Para mensajes simples, cb-dynamic-dialog muestra header y content y se controla con [(visible)]."
      [code]="declarativeCode"
    >
      <cb-button variant="outlined" (click)="visible.set(true)">Ver detalle</cb-button>
      <cb-dynamic-dialog [(visible)]="visible" header="Solicitud enviada" content="Te avisaremos cuando sea aprobada." />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class DynamicdialogDocComponent {
  private readonly dialog = inject(CbDialogService);

  protected readonly docApi = DOC_API['cb-dynamic-dialog'];
  protected readonly a11y = DOC_A11Y['cb-dynamic-dialog'];

  protected readonly visible = signal(false);
  protected readonly result = signal('—');

  protected editar(): void {
    const ref = this.dialog.open<ClienteFormComponent, Cliente, boolean>(ClienteFormComponent, {
      header: 'Editar cliente',
      data: { nombre: 'Laura Gómez' },
    });
    ref.onClose.subscribe((guardado) => this.result.set(guardado ? 'Guardado' : 'Sin cambios'));
  }

  protected readonly importCode = `import { CbDialogService, CbDynamicDialogRef, CB_DYNAMIC_DIALOG_DATA, CbDynamicDialog } from '@caribeng/ui/dynamicdialog';`;

  protected readonly serviceCode = `<cb-button (click)="editar()">Editar cliente</cb-button>
<p>Resultado: {{ result() }}</p>`;

  protected readonly contentCode = `@Component({
  selector: 'app-cliente-form',
  imports: [CbButton],
  template: \`
    <p>¿Guardar los cambios de {{ data.nombre }}?</p>
    <cb-button variant="text" (click)="ref.close(false)">Cancelar</cb-button>
    <cb-button (click)="ref.close(true)">Guardar</cb-button>
  \`,
})
export class ClienteFormComponent {
  protected readonly data = inject<{ nombre: string }>(CB_DYNAMIC_DIALOG_DATA);
  protected readonly ref = inject<CbDynamicDialogRef<boolean>>(CbDynamicDialogRef);
}`;

  protected readonly declarativeCode = `<cb-button variant="outlined" (click)="visible.set(true)">Ver detalle</cb-button>
<cb-dynamic-dialog [(visible)]="visible" header="Solicitud enviada" content="Te avisaremos cuando sea aprobada." />`;

  constructor() {
    inject(TocService).reset();
  }
}
