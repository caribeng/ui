import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CbNotificationCenter,
  type CbNotification,
  type CbNotificationActionEvent,
} from '@caribeng/ui/notification-center';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

/** Fecha ISO `min` minutos antes de ahora (la demo siempre tiene fechas recientes). */
function ago(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

const NUEVOS: Omit<CbNotification, 'id' | 'date'>[] = [
  { title: 'Pago recibido', text: 'Camila Ruiz te envió $ 85.000', severity: 'success' },
  { title: 'Mateo Díaz comentó en «Informe trimestral»', text: '«Ya está la tabla de provisiones»', person: { name: 'Mateo Díaz' } },
  { title: 'Saldo bajo en Cuenta de ahorros', text: 'Te quedan $ 42.300', severity: 'warning' },
];

@Component({
  selector: 'doc-notification-center-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbNotificationCenter, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Messages"
      title="NotificationCenter"
      lead="Centro de notificaciones: campana con el número de avisos sin leer que abre un panel con la lista agrupada por fecha (Hoy, Ayer, Anteriores), filtro Todas / No leídas, marcar como leída una o todas, eliminar y acciones propias en cada aviso. También se puede pintar en la página con inline."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="bell"
      title="Campana en la barra"
      description="La campana dice cuántos avisos hay sin leer. Elegir un aviso lo marca como leído y cierra el panel; Escape, Tab fuera o un clic fuera también lo cierran y el foco vuelve a la campana. Pulsa «Simular aviso»: el contador sube y el lector de pantalla anuncia la notificación nueva."
      [code]="bellCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <div class="nc-bar">
          <strong>Banca en línea</strong>
          <span style="flex: 1"></span>
          <button type="button" class="nc-sim" (click)="simular()">Simular aviso</button>
          <cb-notification-center [(notifications)]="avisos" [showViewAll]="true" (itemClick)="ultimo.set('Abriste «' + $event.title + '»')" (viewAll)="ultimo.set('Ver todas')" />
        </div>
        <p class="nc-log">{{ ultimo() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="inline"
      title="En la página"
      description="inline pinta el panel como una región de la página, sin campana: útil para una pantalla de «Notificaciones» o un panel lateral. Aquí comparte la lista con la campana de arriba, así que announceNew=&quot;false&quot; evita que los avisos nuevos se anuncien dos veces. Pasa el ratón (o llega con Tab) a un aviso para ver sus herramientas: marcar como leído o no leído y eliminar."
      [code]="inlineCode"
    >
      <div style="width: 100%; max-width: 30rem">
        <cb-notification-center [(notifications)]="avisos" inline maxHeight="none" [announceNew]="false" />
      </div>
    </doc-section>

    <doc-section
      id="actions"
      title="Acciones propias"
      description="Cada aviso puede llevar acciones (actions); la de severity &quot;primary&quot; se destaca. Pulsar una emite actionClick y marca el aviso como leído. groupByDate=&quot;false&quot; quita los grupos y removable=&quot;false&quot;, el botón de eliminar."
      [code]="actionsCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%; max-width: 30rem">
        <cb-notification-center [(notifications)]="solicitudes" inline [groupByDate]="false" [removable]="false" title="Aprobaciones pendientes" (actionClick)="onAction($event)" />
        <p class="nc-log">{{ accion() }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .nc-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem 0.5rem 1rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 8px);
        background: var(--cb-color-surface-raised);
      }
      .nc-sim {
        padding: 0.375rem 0.75rem;
        border: 1px solid var(--cb-color-border-strong);
        border-radius: var(--cb-radius-md, 6px);
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }
      .nc-sim:hover {
        background: var(--cb-color-surface-hover);
      }
      .nc-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class NotificationCenterDocComponent {
  protected readonly docApi = DOC_API['cb-notification-center'];
  protected readonly a11y = DOC_A11Y['cb-notification-center'];

  protected readonly ultimo = signal('');
  protected readonly accion = signal('');
  private siguiente = 0;

  protected readonly avisos = signal<readonly CbNotification[]>([
    { id: 'a1', title: 'Transferencia recibida', text: 'Luis Pérez te envió $ 250.000', date: ago(4), severity: 'success' },
    { id: 'a2', title: 'Ana López te mencionó en «Revisión de riesgo»', text: '«@Tú, ¿puedes revisar la sección de crédito?»', date: ago(48), person: { name: 'Ana López' } },
    { id: 'a3', title: 'Tu tarjeta terminada en 4821 vence pronto', text: 'Solicita la renovación antes del 30 de noviembre.', date: ago(60 * 27), severity: 'warning', read: true },
    { id: 'a4', title: 'Inicio de sesión desde un dispositivo nuevo', text: 'Chrome en Windows · Bogotá', date: ago(60 * 24 * 4), severity: 'danger', read: true },
    { id: 'a5', title: 'Extracto de septiembre disponible', date: ago(60 * 24 * 9), read: true },
  ]);

  protected readonly solicitudes = signal<readonly CbNotification[]>([
    {
      id: 's1',
      title: 'Camila Ruiz solicita vacaciones',
      text: 'Del 2 al 13 de diciembre (10 días)',
      date: ago(15),
      person: { name: 'Camila Ruiz' },
      actions: [
        { id: 'aprobar', label: 'Aprobar', severity: 'primary' },
        { id: 'rechazar', label: 'Rechazar' },
      ],
    },
    {
      id: 's2',
      title: 'Compra por encima del límite',
      text: 'Licencias de diseño · $ 3.400.000',
      date: ago(90),
      severity: 'warning',
      actions: [
        { id: 'aprobar', label: 'Aprobar', severity: 'primary' },
        { id: 'detalle', label: 'Ver detalle' },
      ],
    },
  ]);

  protected simular(): void {
    const base = NUEVOS[this.siguiente++ % NUEVOS.length];
    this.avisos.update((list) => [{ ...base, id: `sim-${this.siguiente}`, date: new Date().toISOString() }, ...list]);
  }

  protected onAction(event: CbNotificationActionEvent): void {
    this.accion.set(`${event.action.label}: «${event.notification.title}»`);
    if (event.action.id !== 'detalle') this.solicitudes.update((list) => list.filter((n) => n.id !== event.notification.id));
  }

  protected readonly importCode = `import { CbNotificationCenter, type CbNotification } from '@caribeng/ui/notification-center';`;
  protected readonly bellCode = `<div class="nc-bar">
  <strong>Banca en línea</strong>
  <span style="flex: 1"></span>
  <button type="button" class="nc-sim" (click)="simular()">Simular aviso</button>
  <cb-notification-center [(notifications)]="avisos" [showViewAll]="true" (itemClick)="ultimo.set('Abriste «' + $event.title + '»')" (viewAll)="ultimo.set('Ver todas')" />
</div>
<p class="nc-log">{{ ultimo() }}</p>`;
  protected readonly inlineCode = `<cb-notification-center [(notifications)]="avisos" inline maxHeight="none" [announceNew]="false" />`;
  protected readonly actionsCode = `<cb-notification-center [(notifications)]="solicitudes" inline [groupByDate]="false" [removable]="false" title="Aprobaciones pendientes" (actionClick)="onAction($event)" />
<p class="nc-log">{{ accion() }}</p>`;

  constructor() {
    inject(TocService).reset();
  }
}
