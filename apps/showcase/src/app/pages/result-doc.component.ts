import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbResult, type CbResultStatus } from '@caribeng/ui/result';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-result-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbResult, CbButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Messages" title="Result" lead="Pantalla de resultado de una operación (éxito, error, aviso) o de error de navegación (404, 403, 500), con acciones." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="status define el icono y el color; las acciones se proyectan como contenido." [code]="basicCode">
      <cb-result style="width: 100%" status="success" title="Transferencia enviada" subtitle="Enviaste $ 250.000 a Laura Gómez. Comprobante #48213.">
        <cb-button>Volver al inicio</cb-button>
        <cb-button variant="outlined">Descargar comprobante</cb-button>
      </cb-result>
    </doc-section>

    <doc-section
      id="status"
      title="Estados"
      description="success, error, warning, info y los errores HTTP 404, 403 y 500 (muestran el código en grande)."
      [code]="statusCode"
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem" role="group" aria-label="Estado">
          @for (s of estados; track s) {
            <cb-button size="sm" [variant]="estado() === s ? 'solid' : 'outlined'" [attr.aria-pressed]="estado() === s" (click)="estado.set(s)">{{ s }}</cb-button>
          }
        </div>
        <cb-result [status]="estado()" [title]="titulos[estado()]" subtitle="Texto de apoyo con el siguiente paso.">
          <cb-button size="sm">Continuar</cb-button>
        </cb-result>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ResultDocComponent {
  protected readonly docApi = DOC_API['cb-result'];
  protected readonly a11y = DOC_A11Y['cb-result'];

  protected readonly estados: CbResultStatus[] = ['success', 'error', 'warning', 'info', '404', '403', '500'];
  protected readonly estado = signal<CbResultStatus>('error');
  protected readonly titulos: Record<CbResultStatus, string> = {
    success: 'Pago realizado',
    error: 'No pudimos procesar el pago',
    warning: 'Tu sesión está por vencer',
    info: 'Solicitud en revisión',
    '404': 'Página no encontrada',
    '403': 'No tienes acceso a esta sección',
    '500': 'Algo salió mal',
  };

  protected readonly importCode = `import { CbResult } from '@caribeng/ui/result';`;
  protected readonly basicCode = `<cb-result status="success" title="Transferencia enviada" subtitle="Enviaste $ 250.000 a Laura Gómez. Comprobante #48213.">
  <cb-button>Volver al inicio</cb-button>
  <cb-button variant="outlined">Descargar comprobante</cb-button>
</cb-result>`;
  protected readonly statusCode = `<cb-result status="404" title="Página no encontrada" subtitle="Texto de apoyo con el siguiente paso.">
  <cb-button size="sm">Continuar</cb-button>
</cb-result>`;

  constructor() {
    inject(TocService).reset();
  }
}
