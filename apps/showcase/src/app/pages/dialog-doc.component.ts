import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbDialog } from '@caribeng/ui/dialog';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-dialog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbButton,
    CbDialog,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Overlay"
      title="Dialog"
      lead="Modal sobre CDK Overlay con trampa de foco, bloqueo de scroll, cierre con Escape/backdrop y restauración de foco."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="Controla la visibilidad con [(visible)]. Prueba Escape o clic en el fondo."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <cb-button (click)="basic.set(true)">Abrir diálogo</cb-button>
      <cb-dialog [(visible)]="basic" header="Detalles">
        <p style="margin: 0; max-width: 42ch">
          Este es un diálogo modal de CaribeNG. El foco queda atrapado dentro y
          se restaura al cerrar.
        </p>
      </cb-dialog>
    </doc-section>

    <doc-section
      id="footer"
      title="Con footer"
      description="Proyecta acciones con el atributo cb-dialog-footer."
      [code]="footerCode"
      [codeTs]="footerTs"
    >
      <cb-button severity="danger" (click)="confirm.set(true)">Eliminar</cb-button>
      <cb-dialog [(visible)]="confirm" header="Confirmar eliminación" width="26rem">
        <p style="margin: 0">Esta acción no se puede deshacer. ¿Continuar?</p>
        <div cb-dialog-footer>
          <cb-button variant="text" severity="secondary" (click)="confirm.set(false)">
            Cancelar
          </cb-button>
          <cb-button severity="danger" (click)="confirm.set(false)">Eliminar</cb-button>
        </div>
      </cb-dialog>
    </doc-section>

    <doc-section
      id="modal-strict"
      title="Sin cierre por fuera"
      description="Desactiva el cierre por backdrop y Escape para forzar una decisión."
      [code]="strictCode"
    >
      <cb-button variant="outlined" (click)="strict.set(true)">Abrir estricto</cb-button>
      <cb-dialog
        [(visible)]="strict"
        header="Acción requerida"
        [dismissableMask]="false"
        [closeOnEscape]="false"
      >
        <p style="margin: 0; max-width: 40ch">
          Solo se cierra con el botón. El backdrop y Escape están desactivados.
        </p>
        <div cb-dialog-footer>
          <cb-button (click)="strict.set(false)">Entendido</cb-button>
        </div>
      </cb-dialog>
    </doc-section>
  `,
})
export class DialogDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly basic = signal(false);
  protected readonly confirm = signal(false);
  protected readonly strict = signal(false);

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbDialog } from '@caribeng/ui/dialog';

@Component({
  imports: [CbDialog],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-button (click)="basic.set(true)">Abrir diálogo</cb-button>

<cb-dialog [(visible)]="basic" header="Detalles">
  <p>Contenido del diálogo…</p>
</cb-dialog>`;
  protected readonly basicTs = `basic = signal(false);`;

  protected readonly footerCode = `<cb-dialog [(visible)]="confirm" header="Confirmar eliminación" width="26rem">
  <p>Esta acción no se puede deshacer. ¿Continuar?</p>
  <div cb-dialog-footer>
    <cb-button variant="text" severity="secondary" (click)="confirm.set(false)">
      Cancelar
    </cb-button>
    <cb-button severity="danger" (click)="confirm.set(false)">Eliminar</cb-button>
  </div>
</cb-dialog>`;
  protected readonly footerTs = `confirm = signal(false);`;

  protected readonly strictCode = `<cb-dialog
  [(visible)]="strict"
  header="Acción requerida"
  [dismissableMask]="false"
  [closeOnEscape]="false">
  <p>Solo se cierra con el botón.</p>
  <div cb-dialog-footer>
    <cb-button (click)="strict.set(false)">Entendido</cb-button>
  </div>
</cb-dialog>`;
}
