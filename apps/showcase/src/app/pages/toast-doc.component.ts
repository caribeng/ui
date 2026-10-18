import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbButton } from '@caribeng/ui/button';
import { CbToast, CbToastService } from '@caribeng/ui/toast';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-toast-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbButton,
    CbToast,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <cb-toast position="top-right" />

    <doc-page-header
      eyebrow="Messages"
      title="Toast"
      lead="Notificaciones no intrusivas con auto-cierre, gestionadas por CbToastService (signals)."
    />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="severities"
      title="Severidades"
      description="Atajos success/info/warn/error. Coloca un <cb-toast /> una vez en la app."
      [code]="severitiesCode"
      [codeTs]="severitiesTs"
    >
      <cb-button severity="success" (click)="toast.success('Guardado', 'Los cambios se guardaron.')">
        Success
      </cb-button>
      <cb-button severity="info" (click)="toast.info('Información', 'Hay una actualización disponible.')">
        Info
      </cb-button>
      <cb-button severity="warning" (click)="toast.warn('Atención', 'Revisa los campos resaltados.')">
        Warn
      </cb-button>
      <cb-button severity="danger" (click)="toast.error('Error', 'No se pudo completar la acción.')">
        Error
      </cb-button>
    </doc-section>

    <doc-section
      id="sticky"
      title="Permanente y limpiar"
      description="life=0 no se auto-cierra. clear() cierra todos."
      [code]="stickyCode"
    >
      <cb-button
        variant="outlined"
        (click)="toast.add({ severity: 'help', summary: 'Permanente', detail: 'Ciérrame manualmente.', life: 0 })"
      >
        Permanente
      </cb-button>
      <cb-button variant="text" severity="secondary" (click)="toast.clear()">
        Limpiar todos
      </cb-button>
    </doc-section>
  `,
})
export class ToastDocComponent {
  protected readonly docApi = DOC_API['cb-toast'];

  protected readonly toast = inject(CbToastService);

  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbToast, CbToastService } from '@caribeng/ui/toast';

@Component({
  imports: [CbToast],
  // ...
})
export class MyComponent {
  private readonly toast = inject(CbToastService);
}`;

  protected readonly severitiesCode = `<!-- Una sola vez en la app -->
<cb-toast position="top-right" />

<cb-button severity="success" (click)="toast.success('Guardado', 'Los cambios se guardaron.')">
  Success
</cb-button>`;
  protected readonly severitiesTs = `private readonly toast = inject(CbToastService);

// toast.success(summary, detail?)
// toast.info(...) · toast.warn(...) · toast.error(...)`;

  protected readonly stickyCode = `<cb-button (click)="toast.add({
  severity: 'help', summary: 'Permanente',
  detail: 'Ciérrame manualmente.', life: 0 })">
  Permanente
</cb-button>

<cb-button (click)="toast.clear()">Limpiar todos</cb-button>`;
}
