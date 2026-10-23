import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCard } from '@caribeng/ui/card';
import {
  CbTimeline,
  CbTimelineContentTemplate,
  CbTimelineOppositeTemplate,
  type CbTimelineEvent,
} from '@caribeng/ui/timeline';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-timeline-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, 
    CbTimeline,
    CbTimelineContentTemplate,
    CbTimelineOppositeTemplate,
    CbCard,
    DocPlaygroundComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="Timeline"
      lead="Muestra una secuencia de eventos en el tiempo, en vertical u horizontal, con plantillas para el contenido."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Cada evento tiene title y, opcionalmente, date, datetime (fecha legible por máquina) y description."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 420px">
        <cb-timeline [value]="pedido" />
      </div>
    </doc-section>

    <doc-section
      id="icons"
      title="Iconos y colores"
      description="icon muestra un icono dentro del marcador y color cambia su color."
      [code]="iconsCode"
    >
      <div style="width: 100%; max-width: 420px">
        <cb-timeline [value]="estados" />
      </div>
    </doc-section>

    <doc-section
      id="alignment"
      title="Alineación"
      description="align coloca el contenido a la izquierda (left), a la derecha (right) o alternado (alternate). La plantilla cbTimelineOpposite rellena el lado contrario."
      [code]="alignCode"
    >
      <div style="width: 100%">
        <cb-timeline [value]="pedido" align="alternate">
          <ng-template cbTimelineOpposite let-event>
            <small style="opacity: 0.7">{{ event.date }}</small>
          </ng-template>
          <ng-template cbTimelineContent let-event>
            <strong>{{ event.title }}</strong>
          </ng-template>
        </cb-timeline>
      </div>
    </doc-section>

    <doc-section
      id="horizontal"
      title="Horizontal"
      description="orientation=&quot;horizontal&quot; dispone los eventos en fila, útil para seguimientos cortos."
      [code]="horizontalCode"
    >
      <div style="width: 100%">
        <cb-timeline [value]="pedido" orientation="horizontal" />
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla de contenido"
      description="cbTimelineContent sustituye el contenido de cada evento por el tuyo, por ejemplo una tarjeta."
      [code]="templateCode"
    >
      <div style="width: 100%; max-width: 480px">
        <cb-timeline [value]="estados">
          <ng-template cbTimelineContent let-event>
            <cb-card [header]="event.title" [subtitle]="event.date ?? ''">
              <p style="margin: 0">{{ event.description }}</p>
            </cb-card>
          </ng-template>
        </cb-timeline>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class TimelineDocComponent {
  protected readonly a11y = DOC_A11Y['cb-timeline'];
  protected readonly docApi = DOC_API['cb-timeline'];

  protected readonly pedido: CbTimelineEvent[] = [
    { title: 'Pedido creado', date: '20 oct, 10:30', datetime: '2026-10-20T10:30' },
    { title: 'Pago aprobado', date: '20 oct, 10:32', datetime: '2026-10-20T10:32' },
    { title: 'En camino', date: '21 oct', datetime: '2026-10-21', description: 'Salió del centro de distribución.' },
    { title: 'Entregado', date: '22 oct', datetime: '2026-10-22' },
  ];

  protected readonly estados: CbTimelineEvent[] = [
    { title: 'Solicitud recibida', date: 'Lunes', description: 'Validamos tus datos.', icon: 'check', color: '#10b981' },
    { title: 'En revisión', date: 'Martes', description: 'Un asesor revisa tu caso.', icon: 'clock', color: '#f59e0b' },
    { title: 'Requiere documentos', date: 'Miércoles', description: 'Sube tu certificado laboral.', icon: 'info', color: '#3b82f6' },
  ];

  protected readonly importCode = `import { CbTimeline, CbTimelineContentTemplate, CbTimelineOppositeTemplate } from '@caribeng/ui/timeline';`;

  protected readonly basicCode = `<cb-timeline [value]="pedido" />`;

  protected readonly iconsCode = `<cb-timeline [value]="estados" />`;

  protected readonly alignCode = `<cb-timeline [value]="pedido" align="alternate">
  <ng-template cbTimelineOpposite let-event>
    <small>{{ event.date }}</small>
  </ng-template>
  <ng-template cbTimelineContent let-event>
    <strong>{{ event.title }}</strong>
  </ng-template>
</cb-timeline>`;

  protected readonly horizontalCode = `<cb-timeline [value]="pedido" orientation="horizontal" />`;

  protected readonly templateCode = `<cb-timeline [value]="estados">
  <ng-template cbTimelineContent let-event>
    <cb-card [header]="event.title" [subtitle]="event.date ?? ''">
      <p>{{ event.description }}</p>
    </cb-card>
  </ng-template>
</cb-timeline>`;

  constructor() {
    inject(TocService).reset();
  }
}
